import React, { useEffect, useRef, useState } from "react";

import { addMessageListener, sendMessageWebSocket  } from "../api/sdk"; // Adjust the import path as necessary

const VideoCall = () => {
  const [socket, setSocket] = useState(null);
//   const [userId, setUserId] = useState("");
//   const [peerId, setPeerId] = useState("");
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  useEffect(() => {

    const handleVideoCallMessage = async (event) => {
        const msg = JSON.parse(event.data);
    
        switch (msg.type) {
          case "webrtc-answer":
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            break;
    
          case "ice-candidate":
            if (msg.candidate) {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.candidate));
            }
            break;
    
          default:
            break;
        }
      };

    addMessageListener("video_call",handleVideoCallMessage);

    return () => {
      removeMessageListener("video_call",handleVideoCallMessage);
    };
  }, []);



  const startCall = async (currentUserId, peerId) => {
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current.srcObject = localStream;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pcRef.current = pc;

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.ontrack = (event) => {
      remoteStreamRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessageWebSocket(JSON.stringify({
            type : "video_call",
            message : {
                type: "ice-candidate",
                from: currentUserId,
                to: peerId,
                candidate: event.candidate,
            }
        }));
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    sendMessageWebSocket(JSON.stringify({
        type : "video_call",
        message : {
            type: "webrtc-offer",
            from: userId,
            to: peerId,
            sdp: offer,
        }
    }));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">React WebRTC Video Call</h2>

      <div className="flex gap-4 mb-4">
        <input
          className="border px-2 py-1"
          placeholder="Your User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          className="border px-2 py-1"
          placeholder="Call Peer ID"
          value={peerId}
          onChange={(e) => setPeerId(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-1 rounded"
          onClick={startCall}
        >
          Start Call
        </button>
      </div>

      <div className="flex gap-4">
        <video ref={localStreamRef} autoPlay muted className="w-1/2 border" />
        <video ref={remoteStreamRef} autoPlay className="w-1/2 border" />
      </div>
    </div>
  );
};

export default VideoCall;
