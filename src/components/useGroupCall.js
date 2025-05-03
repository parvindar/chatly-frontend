import React, { useEffect, useRef, useState } from "react";
import {
  addMessageListener,
  removeMessageListener,
  sendMessageWebSocket
} from "../api/sdk";

export const useGroupCall = (currentUser, roomId, handleGroupCallEndedParam = () => { }) => {
  const userId = currentUser?.id;
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const participantsRef = useRef(new Map());
  const [callState, setCallState] = useState("idle");
  const [participants, setParticipants] = useState([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [participantQueue, setParticipantQueue] = useState([]);
  const [joinTime, setJoinTime] = useState(0);

  const [remoteICECandidate, setRemoteICECandidate] = useState({});

  useEffect(() => {

    console.log("✅ useEffect participantsRef.current:", participantsRef.current);
    if (participantsRef.current) {
      console.log("✅ Peer connection established with participants:", participantsRef.current.length);

      // For ICE candidates
      participantsRef.current.forEach((participant) => {
        const candidates = [...remoteICECandidate[participant.id]];
        while (candidates.length > 0) {
          const candidate = candidates.shift();
          participant.pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        setRemoteICECandidate((prev) => ({ ...prev, [participant.id]: [] }));
      });


    }
  }, [participantsRef.current]);

  useEffect(() => {
    if (participantQueue.length > 0) {
      const queue = [...participantQueue];
      const participant = queue.shift();
      handleParticipantJoined(participant);
      setParticipantQueue(queue);
    }
  }, [participantQueue]);

  // Initialize/cleanup message listeners
  useEffect(() => {

    const handleSignalMessage = async (msg) => {
      const handlers = {
        "group-call-offer": handleGroupOffer,
        "group-call-answer": handleGroupAnswer,
        "ice-candidate": handleIceCandidate,
        "group-call-ended": handleGroupCallEnded,
        "join-room": handleParticipantJoined,
        "leave-room": handleParticipantLeft,
        "audio-video": handleParticipantAudioVideo,
      };
      if (msg.from === userId) {
        return;
      }
      if (msg.room_id !== roomId) {
        return;
      }
      // console.log("🔴 handleSignalMessage", msg, callState);

      if (callState === "idle") {
        return;
      }

      if (handlers[msg.type]) {
        await handlers[msg.type](msg);
      }
    };

    addMessageListener("group_video_call", handleSignalMessage);
    return () => {
      removeMessageListener("group_video_call", handleSignalMessage);
    };
  }, [userId, callState, isVideoEnabled, isAudioEnabled, currentUser, roomId]);

  // Create peer connection for a participant
  const createPeerConnection = (participantId, userInfo, video_enabled, audio_enabled) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          username: "8EI2VeNoMLDDpLI086s-PqgJ11zN94-7e_H5yJvmg-M3Tj1_QYP1k8PRZLPGGvRYAAAAAGf1KPpwYXJ2aW5kYXI=",
          credential: "088e82ce-1480-11f0-bd79-0242ac140004",
          urls: [
            "turn:ss-turn1.xirsys.com:80?transport=udp",
            "turn:ss-turn1.xirsys.com:3478?transport=udp",
            "turn:ss-turn1.xirsys.com:80?transport=tcp",
            "turn:ss-turn1.xirsys.com:3478?transport=tcp",
            "turns:ss-turn1.xirsys.com:443?transport=tcp",
            "turns:ss-turn1.xirsys.com:5349?transport=tcp"
          ]
        },

        {
          urls: "turn:global.relay.metered.ca:80",
          username: "49dcc6138b74f979af70849f",
          credential: "qEljicolNVrA8XGY",
        },
        {
          urls: "turn:global.relay.metered.ca:80?transport=tcp",
          username: "49dcc6138b74f979af70849f",
          credential: "qEljicolNVrA8XGY",
        },
        {
          urls: "turn:global.relay.metered.ca:443",
          username: "49dcc6138b74f979af70849f",
          credential: "qEljicolNVrA8XGY",
        },
        {
          urls: "turns:global.relay.metered.ca:443?transport=tcp",
          username: "49dcc6138b74f979af70849f",
          credential: "qEljicolNVrA8XGY",
        },

      ],
      iceCandidatePoolSize: 10,
    });

    const videoRef = React.createRef();
    const participant = { id: participantId, pc, videoRef, stream: null, user_info: userInfo, videoEnabled: video_enabled, audioEnabled: audio_enabled };

    // Store the participant
    participantsRef.current.set(participantId, participant);
    updateParticipantsList();

    pc.onicecandidate = (event) => {
      if (event.candidate && roomId) {
        sendMessageWebSocket({
          type: "group_video_call",
          message: {
            type: "ice-candidate",
            from: userId,
            to: participantId,
            room_id: roomId,
            candidate: event.candidate,
          },
        });
      }
    };

    pc.ontrack = (event) => {
      const participant = participantsRef.current.get(participantId);
      if (participant && participant.videoRef.current) {
        participant.stream = event.streams[0];
        participant.videoRef.current.srcObject = event.streams[0];
      }
      updateParticipantsList();
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${participantId}:`, pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state with ${participantId}:`, pc.iceConnectionState);
      if (pc.iceConnectionState === "disconnected") {
        // handleParticipantLeft({ from: participantId });
      } else if (pc.iceConnectionState === "failed") {
        console.log("🔴 ICE connection failed, restarting ICE");
        pc.restartIce();
      }
    };

    return pc;
  };

  // Update participants list for React state
  const updateParticipantsList = () => {
    setParticipants(Array.from(participantsRef.current.values()));
  };

  // Join a group call
  const joinRoom = async (roomId) => {
    if (callState !== "idle") return;

    setCallState("joining");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });


      setJoinTime(Date.now());

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Notify server we're joining
      sendMessageWebSocket({
        type: "group_video_call",
        message: {
          type: "join-room",
          from: userId,
          room_id: roomId,
          sender_info: currentUser,
          video_enabled: isVideoEnabled,
          audio_enabled: isAudioEnabled,
        },
      });

      setCallState("active");
    } catch (error) {
      console.error("Error joining room:", error);
      setCallState("idle");
    }
  };

  // Handle new participant joining
  const handleParticipantJoined = async ({ from: participantId, sender_info, video_enabled, audio_enabled }) => {
    if (!roomId) return;
    if (participantsRef.current.has(participantId)) {
      handleParticipantLeft({ from: participantId });
    }
    console.log("🔴 handleParticipantJoined", participantId, sender_info);

    const d = Date.now();
    const timeDiff = d - joinTime;
    if (timeDiff < 1000 || callState !== "active") {
      console.log("🔴 handleParticipantJoined delay", participantId, sender_info);
      setTimeout(() => {
        setParticipantQueue((prev) => [...prev, { from: participantId, sender_info, video_enabled, audio_enabled }]);
      }, (Math.random() * 1000) + 100); //random delay to avoid race condition
      return;
    }
    const pc = createPeerConnection(participantId, sender_info, video_enabled, audio_enabled);
    const stream = localStreamRef.current;

    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    sendMessageWebSocket({
      type: "group_video_call",
      message: {
        type: "group-call-offer",
        from: userId,
        to: participantId,
        room_id: roomId,
        sdp: offer,
        sender_info: currentUser,
        video_enabled: isVideoEnabled,
        audio_enabled: isAudioEnabled,
      },
    });
  };

  // Handle offer from new participant
  const handleGroupOffer = async ({ from, sdp, room_id: offerRoomId, sender_info, video_enabled, audio_enabled }) => {
    if (roomId !== offerRoomId || participantsRef.current.has(from)) return;

    const pc = createPeerConnection(from, sender_info, video_enabled, audio_enabled);
    const stream = localStreamRef.current;

    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    sendMessageWebSocket({
      type: "group_video_call",
      message: {
        type: "group-call-answer",
        from: userId,
        to: from,
        room_id: roomId,
        sdp: answer,
        sender_info: currentUser,
      },
    });
  };

  // Handle answer from participant
  const handleGroupAnswer = async ({ from, sdp }) => {
    const participant = participantsRef.current.get(from);
    if (participant) {
      await participant.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    }
  };

  // Handle ICE candidate
  const handleIceCandidate = async ({ from, candidate }) => {
    const participant = participantsRef.current.get(from);
    if (participant && candidate) {
      try {
        await participant.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        setRemoteICECandidate((prev) => ({ ...prev, [from]: [...(prev[from] || []), candidate] }));
        console.error("Error adding ICE candidate:", err);
      }
    }
  };

  // Handle participant leaving
  const handleParticipantLeft = ({ from: participantId }) => {
    const participant = participantsRef.current.get(participantId);
    if (participant) {
      participant.pc.close();
      participantsRef.current.delete(participantId);
      updateParticipantsList();
    }
  };

  const handleParticipantAudioVideo = ({ from: participantId, video_enabled, audio_enabled, room_id }) => {
    const participant = participantsRef.current.get(participantId);
    console.log("🔴 handleParticipantAudioVideo", participantId, video_enabled, audio_enabled, roomId, room_id);
    if (participant && roomId === room_id) {
      console.log("🔴 changing audio and video state", participantId, video_enabled, audio_enabled, roomId, room_id);
      participant.videoEnabled = video_enabled;
      participant.audioEnabled = audio_enabled;
      updateParticipantsList();
    }
  };

  // Leave the group call
  const leaveRoom = () => {
    if (callState !== "active" || !roomId) return;

    setCallState("leaving");

    // Notify server we're leaving
    sendMessageWebSocket({
      type: "group_video_call",
      message: {
        type: "leave-room",
        from: userId,
        room_id: roomId,
      },
    });

    // Close all peer connections
    participantsRef.current.forEach((participant) => {
      participant.pc.close();
    });
    participantsRef.current.clear();
    updateParticipantsList();

    // Clean up local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    setCallState("idle");
    handleGroupCallEndedParam();
  };

  // Handle group call ended by host
  const handleGroupCallEnded = () => {
    console.log("🔴 handleGroupCallEnded");
    leaveRoom();
    handleGroupCallEndedParam();
  };

  // Toggle local video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        sendMessageWebSocket({
          type: "group_video_call",
          message: {
            type: "audio-video",
            from: userId,
            room_id: roomId,
            video_enabled: videoTrack.enabled,
            audio_enabled: isAudioEnabled,
          },
        });
      }
    }
  };

  // Toggle local audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        sendMessageWebSocket({
          type: "group_video_call",
          message: {
            type: "audio-video",
            from: userId,
            room_id: roomId,
            video_enabled: isVideoEnabled,
            audio_enabled: audioTrack.enabled,
          },
        });
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (callState === "active") {
        leaveRoom();
      }
    };
  }, []);

  return {
    localVideoRef,
    participants,
    joinRoom,
    leaveRoom,
    callState,
    roomId,
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio,
  };
};