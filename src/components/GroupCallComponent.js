import styled, { css } from 'styled-components';
import { useGroupCall } from "./useGroupCall";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { initializeWebSocket, getGroupMembers, getGroupDetails } from "../api/sdk";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhone, FiLogIn, FiLogOut, FiMoreVertical, FiUser } from 'react-icons/fi';
import colors from '../styles/colors'


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
  padding-bottom: 60px;
  min-height: 0;
`;

const VideoGrid = styled.div`
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;  /* Centers items horizontally */
//   align-content: flex-start;    /* Centers items vertically */
  align-content: center;
  gap: 12px;
  padding: 8px;
  overflow-y: auto;
//   height: 100%;
  min-height: 0;

  @media (max-width: 768px) {
    align-content: ${props => props.participantCount <= 4 ? 'center' : 'flex-start'};
  }

  @media (max-width: 480px) {
    align-content: ${props => props.participantCount <= 4 ? 'center' : 'flex-start'};
  }

  ${CustomScrollbar}
`;



const VideoContainer = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #3c4043;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  aspect-ratio: 16/9;
  
  /* Dynamic sizing based on participant count */
  flex: 1 1 calc(
    clamp(250px, 100%/2 - 32px, 400px)
  );
  max-width: ${props =>
    props.participantCount <= 2 ? 'clamp(400px,100%, 500px)' :
      props.participantCount <= 4 ? '400px' :
        '400px'
  };
  min-width: 250px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  @media (max-width: 768px) {
    flex-basis: calc(50% - 16px);
    max-width: none;
  }

  @media (max-width: 480px) {
    flex-basis: 100%;
  }
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
  bottom: 8px;
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
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
//   padding: 20px;
  height: 60px;
  // background: #36393f;
  background: transparent;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
//   border-top: 1px solid #3c4043;

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
  // position: absolute;
  // top: 50%;
  // left: 50%;
  // transform: translate(-50%, -50%);
  position:absolute;
  left:0;
  top:0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  
  border-radius: 4px;
  font-size: 16px;
  z-index: ${props => props.isVideoEnabled ? 1 : 3};
  img{
    // width: 50%;
    height: 40%;
    border-radius: 50%;
  }
`;

const GroupCallComponent = ({ currentUser, group, handleGroupCallEnded, isGroupCallActive, isGroupCallShuttingDown }) => {
  if (!currentUser || !group) {
    return <></>;
  }

  if (!isGroupCallActive) {
    return <></>;
  }

  const roomId = group.id;

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

  // participants = participants.slice(0, 4);

  return (
    <Container>
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

      <VideoGrid participantCount={participants.length + 1}>
        <VideoContainer participantCount={participants.length + 1}>
          {/* {(callState !== "active" || !isVideoEnabled || !localVideoRef.current?.srcObject) && ( */}
          <ProfileInfo isVideoEnabled={isVideoEnabled}>
            <img src={currentUser?.profile_pic || 'https://i.pravatar.cc/100'} alt="Profile" />
            <span style={{ fontWeight: 'bold', marginTop: '12px' }}>{currentUser?.name || 'You'}</span>
            {!isAudioEnabled && <FiMicOff style={{ position: 'absolute', left: '12px', bottom: '12px' }} size={14} />}
          </ProfileInfo>
          {/* )} */}

          <Video ref={localVideoRef} autoPlay muted playsInline />
          {callState === "active" && isVideoEnabled && localVideoRef.current?.srcObject && (<>
            <UserInfo>
              <span>{currentUser?.name || 'You'}</span>
              {!isAudioEnabled && <FiMicOff size={14} />}
              {!isVideoEnabled && <FiVideoOff size={14} />}
            </UserInfo>
          </>
          )}
        </VideoContainer>

        {participants.map((participant) => (
          <VideoContainer participantCount={participants.length + 1} key={participant.id}>


            <Video
              ref={participant.videoRef}
              autoPlay
              playsInline
            />
            {/* {(!participant.videoEnabled || !participant.videoRef) && ( */}
            <ProfileInfo isVideoEnabled={participant.videoEnabled}>
              <img src={participant.user_info?.profile_pic || 'https://i.pravatar.cc/100'} alt="Profile" />
              <span style={{ fontWeight: 'bold', marginTop: '12px' }}>{participant.user_info?.name}</span>
              {!participant.audioEnabled && <FiMicOff style={{ position: 'absolute', left: '12px', bottom: '12px' }} size={14} />}
            </ProfileInfo>
            {/* )} */}
            {(participant.videoEnabled && participant.stream) && (
              <>
                <UserInfo>
                  <span>{participant.user_info.name}</span>
                  {!participant.audioEnabled && <FiMicOff size={14} />}
                  {!participant.videoEnabled && <FiVideoOff size={14} />}
                </UserInfo>
              </>
            )}
          </VideoContainer>
        ))}
      </VideoGrid>

      <Controls>
        {callState !== "idle" && (
          <>
            <ControlButton
              onClick={toggleAudio}
              active={isAudioEnabled}
            >
              {isAudioEnabled ? <FiMic /> : <FiMicOff />}
              {/* <ButtonLabel>{isAudioEnabled ? 'Mute' : 'Unmute'}</ButtonLabel> */}
            </ControlButton>

            <ControlButton
              onClick={toggleVideo}
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
    </Container>
  );
};

export default GroupCallComponent;