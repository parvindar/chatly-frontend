import styled from 'styled-components';
import { useGroupCall } from "./useGroupCall";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { initializeWebSocket, getGroupMembers, getGroupDetails } from "../api/sdk";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhone, FiLogIn, FiLogOut, FiMoreVertical, FiUser } from 'react-icons/fi';
import colors from '../styles/colors'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #202124;
  color: #e8eaed;
  font-family: 'Google Sans', Roboto, Arial, sans-serif;
`;

const VideoGrid = styled.div`
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;  /* Centers items horizontally */
  align-content: center;    /* Centers items vertically */
  gap: 16px;
  padding: 16px;
  overflow-y: auto;
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
    props.participantCount <= 2 ? '600px' : 
    props.participantCount <= 4 ? '400px' : 
    '300px'
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
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background: #2d2e31;
  border-top: 1px solid #3c4043;
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
  width: 48px;
  height: 48px;
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
    font-size: 20px;
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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  
  border-radius: 4px;
  font-size: 16px;

  img{
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }
`;

const MeetingPage = () => {
    const { roomId } = useParams();
    const [currentUser, setCurrentUser] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [groupInfo, setGroupInfo] = useState(null);


    const fetchGroupMembers = async () => {
        try {
          const members = await getGroupMembers(roomId);
          let isUserMember = false;
          for(let i = 0; i < members.list.length; i++){
            if(members.list[i].id === currentUser.id){
              isUserMember = true;
              break;
            }
          }
          if(!isUserMember){
             window.location.href = '/home'
          }
          setGroupMembers(members.list);
        } catch (error) {
          console.error('Error fetching group members:', error);
        }
    };

    const fetchGroupDetails = async () => {
        try {
            const groupDetails = await getGroupDetails(roomId);
            setGroupInfo(groupDetails);
        } catch (error) {
            console.error('Error fetching group details:', error);  
        }
    };

    useEffect(() => {
        if(currentUser){
            fetchGroupMembers();
            fetchGroupDetails();
        }
    }, [currentUser]);

    useEffect(() => {
        const currentUserId = localStorage.getItem('user_id');
        const token = localStorage.getItem('token');
        if (!currentUserId || !token) {
            window.location.href = '/login';
        } else {
            const user = JSON.parse(localStorage.getItem('user'));
            setCurrentUser(user);
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            initializeWebSocket(() => {
                // joinRoom(roomId);
            });
        }
    }, [currentUser]);

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
    } = useGroupCall( currentUser,roomId);

    return (
        <Container>
            <MeetingInfo>
                <span>{groupInfo?.name}</span>
            </MeetingInfo>

            <ParticipantsCount>
                <FiUser size={14} />
                <span>{participants.length + 1}</span>
            </ParticipantsCount>

            {/* <MoreOptions>
                <FiMoreVertical />
            </MoreOptions> */}

            <VideoGrid>
                <VideoContainer participantCount={participants.length + 1}>
                    {callState !== "active" && (
                        <ProfileInfo>
                            <img src={currentUser?.profile_pic || 'https://i.pravatar.cc/100'} alt="Profile" />
                            <span style={{ fontWeight: 'bold', marginTop: '12px'}}>{currentUser?.name || 'You'}</span>
                        </ProfileInfo>
                    )}
                    {callState !== "idle" && (<>
                    <Video ref={localVideoRef} autoPlay muted playsInline />
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
                        <UserInfo>
                            <span>{participant.user_info.name}</span>
                            {/* {!participant.audioEnabled && <FiMicOff size={14} />}
                            {!participant.videoEnabled && <FiVideoOff size={14} />} */}
                        </UserInfo>
                    </VideoContainer>
                ))}
            </VideoGrid>

            <Controls>
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

                {callState !== "active" ? (
                    <ControlButton
                        onClick={() => joinRoom(roomId)}
                        disabled={callState !== "idle"}
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

export default MeetingPage;