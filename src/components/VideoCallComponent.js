import React, { useState } from 'react';
import styled from 'styled-components';
import colors from '../styles/colors';
import { MdCallEnd, MdCall, MdCallMissed, MdVideocam, MdVideocamOff, MdMic, MdMicOff } from 'react-icons/md';

const VideoCallContainer = styled.div`
    height: 100%;
  max-width: 500px;
//   min-height: 220px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  background-color: #1a1a1a;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.1),
              inset 0 0 30px rgba(0, 0, 0, 0.4);

  &:hover .call-controls {
    opacity: 1;
  }
`;

const RemoteVideo = styled.video`
  aspect-ratio: 4 / 3;
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
`;

const LocalVideo = styled.video`
  width: 25%;
  aspect-ratio: 4 / 3;
  position: absolute;
  bottom: 10px;
  right: 10px;
  border-radius: 8px;
  z-index: 2;
  transition: transform 0.3s ease;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.1),
              inset 0 0 20px rgba(0, 0, 0, 0.4);

  &:hover {
    transform: scale(1.1);
  }
`;

const CallControls = styled.div`
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 3;
  opacity: ${props => props.isRunning ? 0 : 1};
  transition: opacity 0.3s ease;
  pointer-events: auto;

  ${props => props.isRunning && `
    ${VideoCallContainer}:hover & {
      opacity: 1;
    }
  `}
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.variant === 'end' ? '#f04747' : colors.primary};
  color: white;

  &:hover {
    background-color: ${props => props.variant === 'end' ? '#d32f2f' : colors.primaryHover};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    font-size: 24px;
  }
`;

const ToggleButton = styled(ControlButton)`
  background-color: ${props => props.enabled ? colors.primary : '#666'};
  
  &:hover {
    background-color: ${props => props.enabled ? colors.primaryHover : '#555'};
  }
`;

const CallStatusContainer = styled.div`
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
    height: 100%;
  text-align: center;
  color: white;
  z-index: 3;
//   background-color: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 15px;
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: 20px;
`;

const ProfileImage = styled.img`
  height: 40%;
  max-width: 120px;
  max-height: 120px;
  aspect-ratio: 1;
  border-radius: 50%;
//   margin: 8px;
margin-bottom: 2%;
  border: 3px solid ${colors.primary};
  object-fit: cover;
`;

const UserName = styled.div`
  font-size: clamp(1rem, 4vw, 1.25rem);
  font-weight: bold;
//   margin-bottom: 0.5rem;
  color: white;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 100%;
`;

const StatusText = styled.div`
  font-size: clamp(0.875rem, 3vw, 1rem);
  color: ${colors.textSecondary};
//   margin-bottom: 24px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 100%;
`;

const VideoCallComponent = ({ 
  localVideoRef, 
  remoteVideoRef, 
  endCall,
  videoCallState,
  pendingCall,
  acceptCall,
  rejectCall,
  userInfo,
  toggleVideo,
  toggleAudio,
  isVideoEnabled,
  isAudioEnabled
}) => {
  return (
    <VideoCallContainer>
      {videoCallState === 'running' ? (
        <>
          <RemoteVideo ref={remoteVideoRef} autoPlay playsInline />
          <LocalVideo ref={localVideoRef} autoPlay playsInline muted />
          <CallControls isRunning={true} className="call-controls">
            <ToggleButton 
              enabled={isVideoEnabled} 
              onClick={toggleVideo}
              title={isVideoEnabled ? 'Disable Video' : 'Enable Video'}
            >
              {isVideoEnabled ? <MdVideocam /> : <MdVideocamOff />}
            </ToggleButton>
            <ToggleButton 
              enabled={isAudioEnabled} 
              onClick={toggleAudio}
              title={isAudioEnabled ? 'Disable Audio' : 'Enable Audio'}
            >
              {isAudioEnabled ? <MdMic /> : <MdMicOff />}
            </ToggleButton>
            <ControlButton variant="end" onClick={endCall}>
              <MdCallEnd />
            </ControlButton>
          </CallControls>
        </>
      ) : videoCallState === 'incoming' ? (
        <>
          <CallStatusContainer>
            <ProfileImage 
              src={userInfo?.profile_pic || 'https://i.pravatar.cc/100'} 
              alt={userInfo?.name || 'User'}
            />
            <UserName>{userInfo?.name || 'User'}</UserName>
            <StatusText>is calling you...</StatusText>
          </CallStatusContainer>
          <CallControls isRunning={false}>
            <ControlButton onClick={acceptCall}>
              <MdCall />
            </ControlButton>
            <ControlButton variant="end" onClick={rejectCall}>
              <MdCallEnd />
            </ControlButton>
          </CallControls>
        </>
      ) : videoCallState === 'outgoing' ? (
        <>
          <CallStatusContainer>
            <ProfileImage 
              src={userInfo?.profile_pic || 'https://i.pravatar.cc/100'} 
              alt={userInfo?.name || 'User'}
            />
            <UserName>{userInfo?.name || 'User'}</UserName>
            <StatusText>Calling...</StatusText>
          </CallStatusContainer>
          <CallControls isRunning={false}>
            <ControlButton variant="end" onClick={rejectCall}>
              <MdCallEnd />
            </ControlButton>
          </CallControls>
        </>
      ) : videoCallState === 'rejected' ? (
        <CallStatusContainer>
          <StatusText>Call rejected</StatusText>
        </CallStatusContainer>
      ) : null}
    </VideoCallContainer>
  );
};

export default VideoCallComponent; 