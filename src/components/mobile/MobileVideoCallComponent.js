import React, { useState } from 'react';
import styled from 'styled-components';
import colors from '../../styles/colors';
import { MdCallEnd, MdCall, MdCallMissed, MdVideocam, MdVideocamOff, MdMic, MdMicOff } from 'react-icons/md';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhone, FiLogIn, FiLogOut, FiMoreVertical, FiUser, FiMinimize2 } from 'react-icons/fi';


const VideoCallContainer = styled.div`
  aspect-ratio: 16 / 9;
  max-height: 35vh;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1d22 60%, #242830 100%);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.1),
              inset 0 0 30px rgba(0, 0, 0, 0.4);

  ${props => props.isMinimized && `
    animation: minimizedPulse 2s ease-in-out infinite;
  `}

  ${props => props.showControls && `
    .call-controls, .video-user-info {
      opacity: 1;
    }
  `}

  @keyframes minimizedPulse {
    0%, 100% {
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
                  0 0 0 2px rgba(99, 140, 245, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    50% {
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
                  0 0 0 4px rgba(99, 140, 245, 0.6),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
  }
`;

const RemoteVideo = styled.video`
//   aspect-ratio: 16 / 9;
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
`;

const MinimizeButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: white;
  backdrop-filter: blur(10px) saturate(150%);
  -webkit-backdrop-filter: blur(10px) saturate(150%);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);

  &:active {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%);
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.15);
    transform: scale(0.95);
  }

  pointer-events: ${props => (props.isRunning && !props.showControls) ? 'none' : 'auto'};

`;

const VideoUserInfo = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 2;
  opacity: 0;
`;


const LocalVideoContainer = styled.div`
  width: 25%;
  aspect-ratio: 3 / 4;
  position: absolute;
  bottom: 10px;
  right: 10px;
  border-radius: 8px;
  z-index: 3;
  transition: transform 0.3s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.1),
              inset 0 0 20px rgba(0, 0, 0, 0.4);

  &:active {
    transform: scale(0.95);
  }
  overflow: hidden;

  ${props => props.isMinimized && `
    opacity: 0;
  `}
`;

const LocalVideo = styled.video`
  aspect-ratio: 16 / 9;
  width: 100%;
  height: 100%;
  padding: 0px;
  margin: 0px;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  // width: 25%;
  // aspect-ratio: 16 / 9;
  // position: absolute;
  // bottom: 10px;
  // right: 10px;
  // border-radius: 8px;
  // // border: 2px solid ${colors.secondary};
  // object-fit: cover;
  // z-index: 2;
  // transition: transform 0.3s ease;
  // cursor: pointer;
  // box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3),
  //             0 0 0 1px rgba(255, 255, 255, 0.1),
  //             inset 0 0 20px rgba(0, 0, 0, 0.4);

  // &:hover {
  //   transform: scale(1.1);
  // }
`;

const CallControls = styled.div`
  position: absolute;
  bottom: 48px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 32px;
  z-index: 3000;
  opacity: ${props => props.isRunning ? 0 : 1};
  transition: opacity 0.3s ease;
  pointer-events: ${props => (props.isRunning && !props.showControls) ? 'none' : 'auto'};
  align-items: center;
  justify-content: center;

  ${props => props.isRunning && props.showControls && `
    opacity: 1;
  `}
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.isLarge ? '70px' : '48px'};
  height: ${props => props.isLarge ? '70px' : '48px'};
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: ${props => props.variant === 'end' 
    ? 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)' 
    : 'linear-gradient(135deg, rgba(99, 140, 245, 0.3) 0%, rgba(78, 115, 223, 0.2) 100%)'};
  color: white;
  box-shadow: ${props => props.variant === 'end' 
    ? '0 8px 24px rgba(255, 107, 107, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
    : '0 8px 24px rgba(99, 140, 245, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)'};
  backdrop-filter: blur(10px) saturate(150%);
  -webkit-backdrop-filter: blur(10px) saturate(150%);
  font-weight: 600;

  &:active {
    background: ${props => props.variant === 'end' 
      ? 'linear-gradient(135deg, #ff7e7e 0%, #ff6666 100%)' 
      : 'linear-gradient(135deg, rgba(99, 140, 245, 0.5) 0%, rgba(78, 115, 223, 0.35) 100%)'};
    transform: scale(0.92);
    box-shadow: ${props => props.variant === 'end' 
      ? '0 12px 32px rgba(255, 107, 107, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25)' 
      : '0 12px 32px rgba(99, 140, 245, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'};
    border-color: rgba(255, 255, 255, 0.3);
  }

  svg {
    font-size: ${props => props.isLarge ? '36px' : '24px'};
  }
`;

const ToggleButton = styled(ControlButton)`
  background-color: ${props => props.enabled ? colors.primary : '#666'};
  width: 56px;
  height: 56px;

  svg {
    font-size: 28px;
  }
`;

const EndCallButton = styled(ControlButton)`
  width: 56px;
  height: 56px;

  svg {
    font-size: 28px;
  }
`;

const CallStatusContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  color: white;
  z-index: 3;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: linear-gradient(135deg, rgba(26, 29, 34, 0.9) 0%, rgba(36, 40, 48, 0.9) 100%);
  backdrop-filter: blur(25px) saturate(200%);
  -webkit-backdrop-filter: blur(25px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeInScale 0.4s ease-out;

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const ProfileImage = styled.img`
  height: auto;
  width: 120px;
  max-width: 140px;
  max-height: 140px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 3px solid rgba(99, 140, 245, 0.7);
  object-fit: cover;
  box-shadow: 0 0 40px rgba(99, 140, 245, 0.5),
              0 0 80px rgba(99, 140, 245, 0.25),
              0 12px 40px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: profileRing 3s ease-in-out infinite;
  position: relative;

  @keyframes profileRing {
    0%, 100% {
      box-shadow: 0 0 40px rgba(99, 140, 245, 0.5),
                  0 0 80px rgba(99, 140, 245, 0.25),
                  0 12px 40px rgba(0, 0, 0, 0.4),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 50px rgba(99, 140, 245, 0.7),
                  0 0 100px rgba(99, 140, 245, 0.35),
                  0 12px 48px rgba(0, 0, 0, 0.5),
                  inset 0 1px 0 rgba(255, 255, 255, 0.25);
      transform: scale(1.02);
    }
  }
`;

const UserName = styled.div`
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  font-weight: 700;
  color: white;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 100%;
  letter-spacing: -0.3px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const StatusText = styled.div`
  font-size: clamp(0.875rem, 2.5vw, 1rem);
  color: rgba(255, 255, 255, 0.75);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 100%;
  font-weight: 500;
  letter-spacing: 0.5px;
  animation: statusPulse 2s ease-in-out infinite;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);

  @keyframes statusPulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
`;

const UserInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  background-color: #1a1a1a;
  gap: 24px;
`;

const VideoCallComponent = ({
  currentUser,
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
  localAudioVideo,
  remoteAudioVideo,
  isMinimized,
  setMinimized
}) => {

  const [showControls, setShowControls] = useState(false);

  // Auto-hide controls after delay
  React.useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 5000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showControls]);

  const handleContainerTouch = (e) => {
    e.preventDefault();
    if (isMinimized) {
      setMinimized(false);
    } else {
      setShowControls(!showControls);
    }
  };

  return (
    <VideoCallContainer 
      onClick={handleContainerTouch}
      showControls={showControls}
      isMinimized={isMinimized}>
      {videoCallState === 'running' ? (
        <>

        {!isMinimized &&
            <MinimizeButton className="call-controls" onClick={(e) => {
                e.stopPropagation();
                setMinimized(true);
            }}>
                <FiMinimize2 size={16} />
            </MinimizeButton>
        }
          
          {!remoteAudioVideo.video && <UserInfoContainer>
            <ProfileImage
              src={userInfo?.profile_pic || 'https://i.pravatar.cc/100'}
              alt={userInfo?.name || 'User'}
              referrerPolicy="no-referrer"
            />
            { !isMinimized && <UserName>{userInfo?.name || 'User'}</UserName>}

          </UserInfoContainer>
          }

          <RemoteVideo ref={remoteVideoRef} autoPlay playsInline />
          {!isMinimized && (
          <VideoUserInfo className="video-user-info">
            <span>{userInfo?.name}</span>
            {!remoteAudioVideo.audio && <FiMicOff size={14} />}
            {!remoteAudioVideo.video && <FiVideoOff size={14} />}
          </VideoUserInfo> )}
          <LocalVideoContainer isMinimized={isMinimized} >
            {!localAudioVideo.video && <UserInfoContainer>
              <ProfileImage style={{ borderWidth: '1px', width: '60%', maxWidth: '80px' }}
                src={currentUser?.profile_pic || 'https://i.pravatar.cc/100'}
                alt={currentUser?.name || 'User'}
                referrerPolicy="no-referrer"
              />
            </UserInfoContainer>}
            <LocalVideo ref={localVideoRef} autoPlay playsInline muted />
          </LocalVideoContainer>
          {!isMinimized && (
          <CallControls isRunning={true} showControls={showControls} className="call-controls">
            <ToggleButton
              enabled={localAudioVideo.video}
              onClick={ (e) => { e.stopPropagation(); toggleVideo();}}
              title={localAudioVideo.video ? 'Disable Video' : 'Enable Video'}
            >
              {localAudioVideo.video ? <MdVideocam /> : <MdVideocamOff />}
            </ToggleButton>
            <ToggleButton
              enabled={localAudioVideo.audio}
              onClick={(e) => { e.stopPropagation(); toggleAudio(); }}
              title={localAudioVideo.audio ? 'Disable Audio' : 'Enable Audio'}
            >
              {localAudioVideo.audio ? <MdMic /> : <MdMicOff />}
            </ToggleButton>
            <EndCallButton variant="end" onClick={endCall}>
              <MdCallEnd />
            </EndCallButton>
          </CallControls>
            )}
        </>
      ) : videoCallState === 'incoming' ? (
        <>
          <CallStatusContainer>
            <ProfileImage
              src={userInfo?.profile_pic || 'https://i.pravatar.cc/100'}
              alt={userInfo?.name || 'User'}
              referrerPolicy="no-referrer"
            />
            <UserName>{userInfo?.name || 'User'}</UserName>
            <StatusText>is calling you...</StatusText>
          </CallStatusContainer>
          <CallControls isRunning={false}>
            <ControlButton isLarge onClick={acceptCall}>
              <MdCall />
            </ControlButton>
            <ControlButton isLarge variant="end" onClick={rejectCall}>
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
              referrerPolicy="no-referrer"
            />
            <UserName>{userInfo?.name || 'User'}</UserName>
            <StatusText>Calling...</StatusText>
          </CallStatusContainer>
          <CallControls isRunning={false}>
            <ControlButton isLarge variant="end" onClick={rejectCall}>
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