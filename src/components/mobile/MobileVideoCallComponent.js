import React, { useState } from 'react';
import styled from 'styled-components';
import colors from '../../styles/colors';
import { MdCallEnd, MdCall, MdCallMissed, MdVideocam, MdVideocamOff, MdMic, MdMicOff } from 'react-icons/md';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhone, FiLogIn, FiLogOut, FiMoreVertical, FiUser, FiMinimize2 } from 'react-icons/fi';


const VideoCallContainer = styled.div`
aspect-ratio: 16 / 9;
    // height: 100%;
  // max-width: 500px;
  max-height: 35vh;
  // width: 100%;
  margin: 0 auto;
//   position: relative;
  border-radius: 15px;
  overflow: hidden;
  background-color: #1a1a1a;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.1),
              inset 0 0 30px rgba(0, 0, 0, 0.4);
  
  // border: 2px solid ${colors.primaryActive};

  ${props => props.showControls && `
    .call-controls, .video-user-info {
      opacity: 1;
    }
  `}
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
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  // ${VideoCallContainer}:hover & {
  //   opacity: 1;
  // }

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
  // border: 2px solid ${colors.secondary};
  z-index: 3;
  transition: transform 0.3s ease;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.1),
              inset 0 0 20px rgba(0, 0, 0, 0.4);

  &:hover {
    transform: scale(1.1);
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
  bottom: 36px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 3000;
  opacity: ${props => props.isRunning ? 0 : 1};
  transition: opacity 0.3s ease;
  pointer-events: ${props => (props.isRunning && !props.showControls) ? 'none' : 'auto'};

  ${props => props.isRunning && props.showControls && `
    opacity: 1;
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
`

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
  font-size: clamp(0.8rem, 2vw, 1rem);
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
      showControls={showControls}>
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
              <ProfileImage style={{ borderWidth: '1px' }}
                src={currentUser?.profile_pic || 'https://i.pravatar.cc/100'}
                alt={currentUser?.name || 'User'}
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
            <ControlButton variant="end" onClick={endCall}>
              <MdCallEnd />
            </ControlButton>
          </CallControls>
            )}
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