import { useEffect, useRef, useState } from "react";

import { addMessageListener, removeMessageListener, sendMessageWebSocket } from "../api/sdk";

export const useVideoCall = (userId) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const [currentCall, setCurrentCall] = useState(null);
  const [videoCallState, setVideoCallState] = useState("idle"); // New state for video call status

  useEffect(() => {
    addMessageListener("video_call", handleSignalMessage);
    return () => {
      removeMessageListener("video_call", handleSignalMessage);
    };
  }, []);

  const createPeerConnection = (remoteUserId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" },{
        urls: "stun:stun.relay.metered.ca:80",
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
      },],
      iceCandidatePoolSize: 10,
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE candidate type:", event.candidate.type);
        console.log("Sending ICE candidate:", event.candidate);
        sendMessageWebSocket({
          type: "video_call",
          message: {
            type: "ice-candidate",
            from: userId,
            to: remoteUserId,
            candidate: event.candidate,
          },
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        console.log("✅ Received remote stream ", event.streams[0]);
        console.log("Remote stream tracks:", event.streams[0]?.getTracks());
        remoteVideoRef.current.srcObject = null;
        remoteVideoRef.current.srcObject = event.streams[0];

        remoteVideoRef.current.onloadedmetadata = () => {
            console.log("✅ Remote video metadata loaded, attempting to play");
            remoteVideoRef.current.play().catch((e) => {
              console.warn("⚠️ Auto-play failed for remote video:", e);
            });
          };
      }
    };

    pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
      };
      
      pc.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", pc.iceConnectionState);
      };

    return pc;
  };

  const startCall = async (remoteUserId) => {
    setVideoCallState("running"); // Set state to running when the call starts

    const stream = await navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .catch((err) => {
        console.error("Error accessing media devices:", err);
      });

    if (!stream) {
      console.error("Failed to get media stream.");
      return;
    }

    requestAnimationFrame(() => {
      const videoEl = localVideoRef.current;
      if (!videoEl) return;

      if ("srcObject" in videoEl) {
        videoEl.srcObject = stream;
        videoEl.onloadedmetadata = () => {
          console.log("✅ Metadata loaded, attempting to play");
          videoEl.play().catch((e) => {
            console.warn("⚠️ Auto-play failed:", e);
          });
        };
        console.log("✅ Attached stream to local video element after rAF");
      } else {
        videoEl.src = URL.createObjectURL(stream);
      }
    });

    localStreamRef.current = stream;
    const pc = createPeerConnection(remoteUserId);
    pcRef.current = pc;
    setCurrentCall(remoteUserId);

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    sendMessageWebSocket({
      type: "video_call",
      message: {
        type: "webrtc-offer",
        from: userId,
        to: remoteUserId,
        sdp: offer,
      },
    });
  };

  const handleOffer = async ({ from, sdp }) => {
    setVideoCallState("running");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStreamRef.current = stream;
    requestAnimationFrame(() => {
      const videoEl = localVideoRef.current;
      if (!videoEl) return;

      if ("srcObject" in videoEl) {
        videoEl.srcObject = stream;
        videoEl.onloadedmetadata = () => {
          console.log("✅ Metadata loaded, attempting to play");
          videoEl.play().catch((e) => {
            console.warn("⚠️ Auto-play failed:", e);
          });
        };
        console.log("✅ Attached stream to local video element after rAF");
      } else {
        videoEl.src = URL.createObjectURL(stream);
      }
    });

    const pc = createPeerConnection(from);
    pcRef.current = pc;
    setCurrentCall(from);

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    sendMessageWebSocket({
      type: "video_call",
      message: {
        type: "webrtc-answer",
        from: userId,
        to: from,
        sdp: answer,
      },
    });
  };

  const handleAnswer = async ({ sdp }) => {
    if (pcRef.current) {
      console.log("Setting remote description:", sdp);
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    }
  };

  const handleIceCandidate = async ({ candidate }) => {
    if (pcRef.current && candidate) {
      console.log("Adding ICE candidate:", candidate);
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    }
  };

  const handleCallEnded = () => {
    endCallProcess();
  };

  const handleSignalMessage = async (msg) => {
    const { type } = msg;

    const handlers = {
      "webrtc-offer": handleOffer,
      "webrtc-answer": handleAnswer,
      "ice-candidate": handleIceCandidate,
      "call-ended": handleCallEnded,
    };

    if (handlers[type]) {
      await handlers[type](msg);
    }
  };

  const endCall = () => {
    sendMessageWebSocket({
        type: "video_call",
        message: {
          type: "call-ended",
          from: userId,
          to: currentCall,
        },
      });

    endCallProcess();
  } 

  const endCallProcess = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    setCurrentCall(null);
    // Reset state to idle when the call ends
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    setVideoCallState("idle"); 
  };

  useEffect(() => {
    return () => {
      endCallProcess();
    };
  }, []);

  return {
    localVideoRef,
    remoteVideoRef,
    startCall,
    handleSignalMessage,
    endCall,
    currentCall,
    videoCallState, // Expose the video call state
  };
};
