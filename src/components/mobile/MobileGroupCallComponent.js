import styled, { css } from 'styled-components';
import { useGroupCall } from "../useGroupCall";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { initializeWebSocket, getGroupMembers, getGroupDetails } from "../../api/sdk";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhone, FiLogIn, FiLogOut, FiMoreVertical, FiUser, FiMinimize2 } from 'react-icons/fi';
import colors from '../../styles/colors'
import { getInitials } from '../../utils/common';



const CustomScrollbar = css`
  &::-webkit-scrollbar {
    height: 4px; /* Added height for horizontal scrollbars */
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #2c2f33;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #4A7BCC;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #3a66a1;
  }

`;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #202124;
  color: #e8eaed;
  font-family: 'Google Sans', Roboto, Arial, sans-serif;
//   padding-top: 32px;
  // padding-bottom: 60px;
  min-height: 0;
`;

const VideoGrid = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  padding-left: 12px;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  // scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  // width: 100%;
  height: 80px;
  ${CustomScrollbar}
`;

const VideoContainer = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  background: #3c4043;
  border-radius: 50%;
  overflow: hidden;
  scroll-snap-align: start;
  border: 2px solid ${colors.primary};
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => props.isMaximized && css`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    border-radius: 0;
    z-index: 5000;
  `}
`;

const Video = styled.video`
  position:relative;
  width: 100%;
  height: calc(100% + 1px);
  object-fit: cover;
  z-index: 2;
`;

const UserInfo = styled.div`
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 3;
  white-space: nowrap;
  opacity: ${props => props?.isMaximized ? 1 : 0};
  transition: opacity 0.3s ease;

  ${VideoContainer}:hover & {
    opacity: 1;
  }
`;

const UserInfo2 = styled.div`
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 3;
  white-space: nowrap;
  opacity: ${props => props?.isMaximized ? 1 : 1};
  transition: opacity 0.3s ease;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  height: 60px;
  // background: linear-gradient(to top, rgba(21, 21, 21, 0.72), rgba(35, 34, 34, 0.62));
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 5;
  opacity: ${props => props.show ? 1 : 0};
  pointer-events: ${props => props.show ? 'auto' : 'none'};
  transition: opacity 0.3s ease;
`;

const ControlButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.red ? '#d93025' : props.active ? colors.primary : '#3c4043'};
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.red ? '#f14a3f' : props.active ? '#5390f5' : '#4e5154'};
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    font-size: 18px;
  }
`;

const VideoBubbleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px
  `

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
  opacity: 1;
  transition: opacity 0.3s ease;
  color: white;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
`;

const ButtonLabel = styled.span`
  font-size: 12px;
  margin-top: 4px;
`;

const MeetingInfo = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MoreOptions = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
`;

const ParticipantsCount = styled.div`
  position: absolute;
  top: 16px;
  right: 24px;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ProfileInfo = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: ${props => props.isMaximized ? '100%' : 'auto'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  border-radius: ${props => props?.isMaximized ? '0' : '50%'};
  font-size: ${props => props?.isMaximized ? '16px' : '12px'};
  z-index: ${props => props.isVideoEnabled ? 0 : 3};
  transition: all 0.3s ease;

  img {
    width: ${props => props.isMaximized ? '120px' : '100%'};
    height: ${props => props.isMaximized ? '120px' : '100%'};
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  span {
    opacity: ${props => props.isMaximized ? 1 : 0};
    transform: translateY(${props => props.isMaximized ? '0' : '-10px'});
    transition: all 0.3s ease;
  }
`;



const GroupCallComponent = ({ currentUser, group, handleGroupCallEnded, isGroupCallActive, isGroupCallShuttingDown, isMinimized, setMinimized }) => {
  if (!currentUser || !group) {
    return <></>;
  }

  if (!isGroupCallActive) {
    return <></>;
  }

  const roomId = group.id;
  const [maximizedParticipant, setMaximizedParticipant] = useState(null);
  const [showControls, setShowControls] = useState(false);

  // Auto-hide controls after delay
  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showControls]);

  const getName = (name) => {
    return isMinimized ? getInitials(name) : name;
  }

  useEffect(() => {
    if (group) {
      joinRoom(roomId);
    }
  }, [group]);

  useEffect(() => {
    if (isGroupCallShuttingDown) {
      leaveRoom();
      handleGroupCallEnded();
    }
  }, [isGroupCallShuttingDown]);



  useEffect(() => {
    return () => {
      console.log("leaving room");
      leaveRoom();
    }
  }, []);

  const {
    localVideoRef,
    participants,
    joinRoom,
    leaveRoom,
    callState,
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio,
  } = useGroupCall(currentUser, roomId, handleGroupCallEnded);

  // let participants = [
  //     {
  //         id: 1,
  //         name: "John Doe",
  //         profile_pic: "https://i.pravatar.cc/100",
  //     },
  //     {
  //         id: 2,
  //         name: "Jane Doe",
  //         profile_pic: "https://i.pravatar.cc/100",
  //     },
  //     {
  //         id: 3,
  //         name: "John Doe",
  //         profile_pic: "https://i.pravatar.cc/100",
  //     },
  //     {
  //         id: 4,
  //         name: "Jane Doe",
  //         profile_pic: "https://i.pravatar.cc/100",
  //     },
  //     {
  //         id: 5,
  //         name: "John Doe",
  //         profile_pic: "https://i.pravatar.cc/100",
  //     },
  //     {
  //         id: 6,
  //         name: "Jane Doe",
  //         profile_pic: "https://i.pravatar.cc/100",
  //     },
  //     {   
  //         id: 7,
  //         name: "John Doe",
  //         profile_pic: "https://i.pravatar.cc/100",
  //     },
  //     {
  //         id: 8,
  //         name: "Jane Doe",
  //         profile_pic: "https://i.pravatar.cc/100",
  //     },
  //     {
  //         id: 9,
  //         name: "John Doe",
  //         profile_pic: "https://i.pravatar.cc/100",
  //     },
  //     {
  //         id: 10,
  //         name: "Jane Doe",
  //         profile_pic: "https://i.pravatar.cc/100",
  //     }
  // ];

  // participants = participants.slice(0, 8);

  return (
    <Container onClick={ () => {if(isMinimized) setMinimized(false)}}>
      {/* <MeetingInfo>
                <span>{group?.name}</span>
            </MeetingInfo> */}

      {/* <ParticipantsCount>
                <FiUser size={14} />
                <span>{participants.length + 1}</span>
            </ParticipantsCount> */}

      {/* <MoreOptions>
                <FiMoreVertical />
            </MoreOptions> */}

            {/* {!isMinimized && showControls &&
                        <MinimizeButton onClick={(e) => {
                            e.stopPropagation();
                            setMinimized(true);
                        }}>
                            <FiMinimize2 size={16} />
                        </MinimizeButton>
                    } */}

      <VideoGrid onClick={() => setShowControls(prev => !prev)}>
        {/* Local user video container */}
        <VideoBubbleContainer>
        <VideoContainer 
          isMaximized={maximizedParticipant === 'local'} 
          onClick={() => setMaximizedParticipant(maximizedParticipant === 'local' ? null : 'local')}
        >
          <ProfileInfo isVideoEnabled={isVideoEnabled} isMaximized={maximizedParticipant === 'local'}>
            <img src={currentUser?.profile_pic || 'https://i.pravatar.cc/100'} alt="Profile" />
            <span style={{ fontWeight: 'bold', marginTop: '12px' }}>You</span>
            {!isAudioEnabled && <FiMicOff style={{ position: 'absolute', left: '12px', bottom: '12px' }} size={14} />}
          </ProfileInfo>
          
          <Video ref={localVideoRef} autoPlay muted playsInline />
          <UserInfo>
            <span>{getInitials(currentUser?.name) || 'You'}</span>
            {!isAudioEnabled && <FiMicOff size={14} />}
            {!isVideoEnabled && <FiVideoOff size={14} />}
          </UserInfo>
        </VideoContainer>
         <div style = {{ display: 'flex',alignItems: 'center', justifyContent: 'center',width: '100%' }}>
            <UserInfo2>
             <span>{getInitials(currentUser?.name) || 'You'}</span>
            {!isAudioEnabled && <FiMicOff size={14} />}
            {!isVideoEnabled && <FiVideoOff size={14} />}
            </UserInfo2>
            </div>
        </VideoBubbleContainer>
        
        {/* Remote participants */}
        {participants.map((participant) => (
          <VideoBubbleContainer>
          <VideoContainer 
            key={participant.id}
            isMaximized={maximizedParticipant === participant.id}
            onClick={() => setMaximizedParticipant(maximizedParticipant === participant.id ? null : participant.id)}
          >
            <Video
              ref={participant.videoRef}
              autoPlay
              playsInline
            />
            <ProfileInfo isVideoEnabled={participant.videoEnabled} isMaximized={maximizedParticipant === participant.id}>
              <img src={participant.user_info?.profile_pic || 'https://i.pravatar.cc/100'} alt="Profile" />
              <span style={{ fontWeight: 'bold', marginTop: '12px' }}>{participant.user_info?.name}</span>
              {!participant.audioEnabled && <FiMicOff style={{ position: 'absolute', left: '12px', bottom: '12px' }} size={14} />}
            </ProfileInfo>
         
            <UserInfo>
              <span>{getInitials(participant.user_info?.name || '')}</span>
              {!participant.audioEnabled && <FiMicOff size={14} />}
              {!participant.videoEnabled && <FiVideoOff size={14} />}
            </UserInfo>
      
          </VideoContainer>
          <div style = {{ display: 'flex',alignItems: 'center', justifyContent: 'center',width: '100%' }}>
            <UserInfo2>
              <span>{getInitials(participant.user_info?.name || '')}</span>
              {!participant.audioEnabled && <FiMicOff size={14} />}
              {!participant.videoEnabled && <FiVideoOff size={14} />}
            </UserInfo2>
            </div>
          </VideoBubbleContainer>
        ))}
      </VideoGrid>

      { !isMinimized &&
      <Controls show={showControls} onClick={ () => {if(showControls) setShowControls(false)}}>
        {callState !== "idle" && (
          <>
            <ControlButton
              onClick={(e)=> {e.stopPropagation(); toggleAudio();}}
              active={isAudioEnabled}
            >
              {isAudioEnabled ? <FiMic /> : <FiMicOff />}
              {/* <ButtonLabel>{isAudioEnabled ? 'Mute' : 'Unmute'}</ButtonLabel> */}
            </ControlButton>

            <ControlButton
              onClick={(e) => { e.stopPropagation(); toggleVideo(); }}
              active={isVideoEnabled}
            >
              {isVideoEnabled ? <FiVideo /> : <FiVideoOff />}
              {/* <ButtonLabel>{isVideoEnabled ? 'Stop Video' : 'Start Video'}</ButtonLabel> */}
            </ControlButton>
          </>
        )}

        {callState !== "active" ? (
          <ControlButton
            onClick={() => joinRoom(roomId)}
            disabled={callState !== "idle"}
            active={callState === "idle"}
          >
            <FiLogIn />
            {/* <ButtonLabel>Join</ButtonLabel> */}
          </ControlButton>
        ) : (
          <ControlButton
            onClick={leaveRoom}
            red
          >
            <FiPhone />
            {/* <ButtonLabel>Leave</ButtonLabel> */}
          </ControlButton>
        )}
      </Controls>
    }
    </Container>
  );
};

export default GroupCallComponent;