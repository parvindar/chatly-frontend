import { useEffect, useRef, useState } from "react";

import { addMessageListener, removeMessageListener, sendMessageWebSocket } from "../api/sdk";

export const useVideoCall = ({ id: userId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const outgoingRingtoneRef = useRef(null);
  const incomingRingtoneRef = useRef(null);
  const vibrationIntervalRef = useRef(null);
  const audioUnlockedRef = useRef(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [videoCallState, setVideoCallState] = useState("idle"); // New state for video call status
  const [remoteICECandidate, setRemoteICECandidate] = useState([]);
  const [pendingCall, setPendingCall] = useState(null); // New state for pending call requests
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isRemoteVideoEnabled, setIsRemoteVideoEnabled] = useState(true);
  const [remoteAudioVideo, setRemoteAudioVideo] = useState({ audio: true, video: true });
  const [localAudioVideo, setLocalAudioVideo] = useState({ audio: true, video: true });
  const [isRingtonePlaying, setIsRingtonePlaying] = useState(false);
  // const localVideoRef = useRef(null);
  // const remoteVideoRef = useRef(null);
  // const pcRef = useRef(null);
  // const localStreamRef = useRef(null);

  useEffect(() => {
    addMessageListener("video_call", handleSignalMessage);
    return () => {
      removeMessageListener("video_call", handleSignalMessage);
    };
  }, [userId, pendingCall, currentCall]);

  useEffect(() => {
    console.log("useVideoCall userId effect triggered with:", userId);
    if (!userId) {
      console.error("userId is required for video calls");
      return;
    }
  }, [userId]);

  useEffect(() => {
    if (pcRef.current) {
      console.log("✅ Peer connection established");

      // For ICE candidates
      const candidates = [...remoteICECandidate];
      while (candidates.length > 0) {
        console.log("length:", candidates.length);
        console.log("useEffect: Adding ICE candidate:");
        const candidate = candidates.shift();
        pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
      setRemoteICECandidate([]);

    }
  }, [pcRef.current]);

  const createPeerConnection = (remoteUserId) => {
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

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE candidate type:", event.candidate.type);
        console.log("Sending ICE candidate:");
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
        console.log("✅ Received remote stream ");
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
    stopRingtone(); // Ensure all ringtones are stopped when call starts
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
    stopRingtone();
    setVideoCallState("running");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    }).catch((err) => {
      console.error("Error accessing media devices:", err);
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
      console.log("Setting remote description:");
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    } else {
      console.error("handleAnswer: No peer connection found");
    }
  };

  const handleIceCandidate = async ({ candidate }) => {
    if (pcRef.current) {
      console.log("Adding ICE candidate:");
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    } else {
      console.error("handleIceCandidate: No peer connection found");
      setRemoteICECandidate(prevCandidates => [...prevCandidates, candidate]);
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
      "call-request": handleCallRequest,
      "call-accepted": handleCallAccepted,
      "call-rejected": handleCallRejected,
      "audio-video": handleAudioVideo,
    };

    if (handlers[type]) {
      try {
        await handlers[type](msg);
      } catch (err) {
        console.error("Error handling signal message:", err, type, msg);
        if (pendingCall) {
          setPendingCall(null);
        }
      }
    }
  };

  const handleCallRequest = ({ from }) => {
    console.log("userId:", userId);
    console.log("from:", from);
    if (pendingCall && pendingCall !== from) {
      console.log("handleCallRequest: Pending call already exists, rejecting new request");
      sendMessageWebSocket({
        type: "video_call",
        message: {
          type: "call-rejected",
          from: userId,
          to: from,
          reason: "busy",
        },
      });
      return;
    }

    if (currentCall && currentCall !== from) {
      console.log("handleCallRequest: Current call already exists, rejecting new request");
      sendMessageWebSocket({
        type: "video_call",
        message: { type: "call-rejected", from: userId, to: from, reason: "busy" },
      });
      return;
    }

    setPendingCall(from);
    setVideoCallState("incoming");
    playRingtone('incoming'); // Play incoming ringtone
    triggerIncomingCallVibration(); // Vibrate for incoming call
  };

  const handleCallAccepted = ({ from }) => {
    if (from === pendingCall) {
      stopRingtone(); // Stop outgoing ringtone when call is accepted
      setPendingCall(null);
      startCall(from);
    }
  };

  const handleCallRejected = (msg) => {
    const { from } = msg;

    if (from === pendingCall) {
      stopRingtone(); // Stop ringtone when call is rejected by remote user
      setPendingCall(null);
      setVideoCallState("idle");
    }
  };

  const handleAudioVideo = (msg) => {
    const { from, audio_enabled, video_enabled } = msg;
    if (from === currentCall) {
      setRemoteAudioVideo({ audio: audio_enabled, video: video_enabled });
    }
  };

  useEffect(() => {
    console.log("localAudioVideo:", localAudioVideo);
  }, [localAudioVideo])

  // Vibration patterns for different call states
  const triggerIncomingCallVibration = () => {
    // Stop any existing vibration interval
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
    }
    
    if (navigator.vibrate) {
      // Incoming call vibration pattern: longer vibrations with pauses
      // [vibrate, pause, vibrate, pause, vibrate, pause]
      navigator.vibrate([400, 200, 400, 200, 400]);
      
      // Loop vibration every 1100ms (duration of pattern above)
      vibrationIntervalRef.current = setInterval(() => {
        if (navigator.vibrate) {
          navigator.vibrate([400, 200, 400, 200, 400]);
        }
      }, 1100);
    }
  };

  const triggerOutgoingCallVibration = () => {
    // Stop any existing vibration interval
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
    }
    
    if (navigator.vibrate) {
      // Outgoing call vibration pattern: shorter, lighter vibrations
      // [vibrate, pause, vibrate, pause]
      navigator.vibrate([200, 100, 200]);
      
      // Loop vibration every 500ms (duration of pattern above)
      vibrationIntervalRef.current = setInterval(() => {
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      }, 500);
    }
  };

  const stopVibration = () => {
    // Clear any existing vibration interval
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
    
    if (navigator.vibrate) {
      navigator.vibrate(0); // Stop all vibration
    }
  };

  const playRingtone = (type = 'incoming') => {
    const ringtone = type === 'outgoing' ? outgoingRingtoneRef.current : incomingRingtoneRef.current;
    if (ringtone) {
      // const startTime = type === 'incoming' ? 0 : 0;
      
      ringtone.pause();
      // ringtone.currentTime = startTime;
      
      ringtone.play().catch(err => {
        console.warn(`Failed to play ${type} ringtone:`, err);
      });
      
      setIsRingtonePlaying(true);
    }
  };

  const stopRingtone = () => {
    if (outgoingRingtoneRef.current) {
      outgoingRingtoneRef.current.pause();
      outgoingRingtoneRef.current.currentTime = 0; // Reset to start
    }
    if (incomingRingtoneRef.current) {
      incomingRingtoneRef.current.pause();
      incomingRingtoneRef.current.currentTime = 0; // Reset to beginning of file (not 4.85)
    }
    stopVibration(); // Stop vibration when stopping ringtone
    setIsRingtonePlaying(false);
  };

  // Initialize separate ringtone audio elements for incoming and outgoing calls
  // Initialize separate ringtone audio elements for incoming and outgoing calls
  useEffect(() => {
    if (!outgoingRingtoneRef.current) {
      // Create audio element for outgoing ringtone
      const outgoingAudio = document.createElement('audio');
      const publicUrl = process.env.PUBLIC_URL || '';
      outgoingAudio.src = `${publicUrl}/sounds/call-outgoing.mp3`;
      outgoingAudio.loop = true;
      outgoingAudio.preload = "auto";
      outgoingAudio.volume = 1.0; // Set to max for iOS to use system volume
      
      // Critical iOS attributes for proper playback
      outgoingAudio.setAttribute('playsinline', '');
      outgoingAudio.setAttribute('webkit-playsinline', '');
      
      // iOS doesn't support ringtone volume for web apps
      // But we can try to optimize for the ringer volume by not setting x-webkit-airplay
      // This makes iOS treat it more like a notification sound
      
      // For Android: Set audio type for proper volume control
      outgoingAudio.setAttribute('type', 'audio/mpeg');
      outgoingAudio.setAttribute('preload', 'auto');
      
      // Try to use voicechat/communications category (iOS 15+)
      if (typeof outgoingAudio.setSinkId === 'function') {
        outgoingAudio.setSinkId('communications').catch(() => {});
      }
      
      // iOS Web Audio Workaround: Add as visible element initially to ensure proper audio routing
      // Then hide it after it's registered with the audio system
      document.body.appendChild(outgoingAudio);
      outgoingAudio.style.position = 'fixed';
      outgoingAudio.style.top = '-1px';
      outgoingAudio.style.left = '-1px';
      outgoingAudio.style.width = '1px';
      outgoingAudio.style.height = '1px';
      outgoingAudio.style.opacity = '0';
      outgoingAudio.style.pointerEvents = 'none';
      
      outgoingAudio.onerror = () => {
        console.warn("Failed to load outgoing ringtone:", outgoingAudio.src);
      };
      outgoingRingtoneRef.current = outgoingAudio;
    }

    if (!incomingRingtoneRef.current) {
      // Create audio element for incoming ringtone
      const incomingAudio = document.createElement('audio');
      const publicUrl = process.env.PUBLIC_URL || '';
      incomingAudio.src = `${publicUrl}/sounds/gta-ringtone-2.mp3`;
      incomingAudio.loop = true;
      incomingAudio.preload = "auto";
      incomingAudio.volume = 1.0; // Set to max for iOS to use system volume
      
      // Critical iOS attributes for proper playback
      incomingAudio.setAttribute('playsinline', '');
      incomingAudio.setAttribute('webkit-playsinline', '');
      
      // iOS doesn't support ringtone volume for web apps
      // But we can try to optimize for the ringer volume by not setting x-webkit-airplay
      // This makes iOS treat it more like a notification sound
      
      // For Android: Set audio type for proper volume control
      incomingAudio.setAttribute('type', 'audio/mpeg');
      incomingAudio.setAttribute('preload', 'auto');
      
      // Try to use voicechat/communications category (iOS 15+)
      if (typeof incomingAudio.setSinkId === 'function') {
        incomingAudio.setSinkId('communications').catch(() => {});
      }
      
      // iOS Web Audio Workaround: Add as visible element initially to ensure proper audio routing
      // Then hide it after it's registered with the audio system
      document.body.appendChild(incomingAudio);
      incomingAudio.style.position = 'fixed';
      incomingAudio.style.top = '-1px';
      incomingAudio.style.left = '-1px';
      incomingAudio.style.width = '1px';
      incomingAudio.style.height = '1px';
      incomingAudio.style.opacity = '0';
      incomingAudio.style.pointerEvents = 'none';
      
      incomingAudio.onerror = () => {
        console.warn("Failed to load incoming ringtone:", incomingAudio.src);
      };
      incomingRingtoneRef.current = incomingAudio;
    }

    // Unlock audio on user interaction for iOS
    const unlockAudio = () => {
      if (!audioUnlockedRef.current) {
        console.log('Unlocking audio for iOS...');
        
        // Mute, play, pause, unmute, and reset only incoming ringtone to unlock audio silently
        
        if (incomingRingtoneRef.current) {
          const originalVolume = incomingRingtoneRef.current.volume;
          incomingRingtoneRef.current.volume = 0; // Mute
          incomingRingtoneRef.current.play().then(() => {
            incomingRingtoneRef.current.pause();
            incomingRingtoneRef.current.currentTime = 0;
            incomingRingtoneRef.current.volume = originalVolume; // Restore volume
          }).catch(() => {
            incomingRingtoneRef.current.volume = originalVolume; // Restore on error
          });
        }
        
        audioUnlockedRef.current = true;
        console.log('Audio unlocked');
      }
    };

    // Add event listeners for user interaction
    const events = ['click', 'touchstart', 'touchend', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, unlockAudio, { once: true, passive: true });
    });

    // Cleanup function to remove audio elements
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, unlockAudio);
      });
      
      if (outgoingRingtoneRef.current) {
        outgoingRingtoneRef.current.pause();
        if (outgoingRingtoneRef.current.parentNode) {
          document.body.removeChild(outgoingRingtoneRef.current);
        }
      }
      if (incomingRingtoneRef.current) {
        incomingRingtoneRef.current.pause();
        if (incomingRingtoneRef.current.parentNode) {
          document.body.removeChild(incomingRingtoneRef.current);
        }
      }
    };
  }, []);

  const requestCall = (remoteUserId) => {
    sendMessageWebSocket({
      type: "video_call",
      message: {
        type: "call-request",
        from: userId,
        to: remoteUserId,
      },
    });
    setPendingCall(remoteUserId);
    setVideoCallState("outgoing");
    playRingtone('outgoing'); // Play outgoing ringtone
    triggerOutgoingCallVibration(); // Vibrate for outgoing call
  };

  const acceptCall = () => {
    stopRingtone(); // Stop ringtone when accepting call
    if (pendingCall) {
      setPendingCall(null);
      startCall(pendingCall);
    }
  };

  const rejectCall = () => {
    stopRingtone(); // Stop ringtone when rejecting call
    if (pendingCall) {
      sendMessageWebSocket({
        type: "video_call",
        message: {
          type: "call-rejected",
          from: userId,
          to: pendingCall,
        },
      });
      setPendingCall(null);
      setVideoCallState("idle");
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
    stopRingtone(); // Stop ringtone when ending call
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

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        sendMessageWebSocket({
          type: "video_call",
          message: {
            type: "audio-video",
            from: userId,
            to: currentCall,
            audio_enabled: localAudioVideo.audio,
            video_enabled: videoTrack.enabled,
          },
        });
        setLocalAudioVideo({ video: videoTrack.enabled, audio: localAudioVideo.audio });
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        sendMessageWebSocket({
          type: "video_call",
          message: {
            type: "audio-video",
            from: userId,
            to: currentCall,
            audio_enabled: audioTrack.enabled,
            video_enabled: localAudioVideo.video,
          },
        });
        setLocalAudioVideo({ video: localAudioVideo.video, audio: audioTrack.enabled });
      }
    }
  };

  useEffect(() => {
    console.log("useEffect: isRemoteVideoEnabled", isRemoteVideoEnabled);
  }, [isRemoteVideoEnabled]);


  useEffect(() => {

    const stream = remoteVideoRef.current?.srcObject;
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        setIsRemoteVideoEnabled(videoTrack.enabled);
        videoTrack.onmute = () => setIsRemoteVideoEnabled(false);
        videoTrack.onunmute = () => setIsRemoteVideoEnabled(true);
      }
    }

  }, [remoteVideoRef.current?.srcObject]);



  return {
    localVideoRef,
    remoteVideoRef,
    startCall,
    handleSignalMessage,
    endCall,
    currentCall,
    videoCallState, // Expose the video call state
    pendingCall,
    requestCall,
    acceptCall,
    rejectCall,
    toggleVideo,
    toggleAudio,
    localAudioVideo,
    remoteAudioVideo,
    isRingtonePlaying,
    playRingtone,
    stopRingtone
  };
};
