import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { IoChatboxEllipses, IoChevronBackOutline } from "react-icons/io5";
import { HiUserGroup } from "react-icons/hi2";
import { FaUserFriends } from "react-icons/fa";
import { FiVideo,FiPhone } from "react-icons/fi";
import { MdAdd } from "react-icons/md";
import GroupList from '../GroupList';
import VideoCallComponent from './MobileVideoCallComponent';
import GroupCallComponent from './MobileGroupCallComponent';
import ChatBox from '../ChatBox';
import FriendsComponent from '../FriendsComponent';
import CurrentUserProfilePopup from '../CurrentUserProfilePopup';
import UserProfilePopup from '../UserProfilePopup';
import CreateGroupModal from '../CreateGroupModal';
import NewPrivateChatModal from '../NewPrivateChatModal';
import { useVideoCall } from '../../components/useVideoCall'; // Import the custom hook for video call

import colors from '../../styles/colors';
import { getInitials } from '../../utils/common';

const VideoCallModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.95);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  ${props => props.minimized && `
    position: fixed;
    top : 8px;
    right: 8px;
    left: auto;
    bottom: auto;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
  `};
  `;

const VideoCallContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const GroupCallContainer = styled.div`
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  z-index: 1002;
  background-color: #24262A;
  ${props => props.minimized && `
    position: fixed;
    top : 8px;
    right: 8px;
    left: auto;
    bottom: auto;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
  `};
`;

const ChatWrapper = styled.div`
  position: fixed;
  width: 100%;
  top: 0;
  bottom: 0;
  z-index: 1;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 18px;
  background: rgba(30, 33, 38, 0.45);
  backdrop-filter: blur(30px) saturate(200%);
  -webkit-backdrop-filter: blur(30px) saturate(200%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1001;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  font-size: 24px;
  padding: 0;
  margin-right: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  transition: all 0.25s ease;
  border-radius: 8px;

  &:hover {
    color: rgba(99, 140, 245, 0.9);
    background-color: rgba(99, 140, 245, 0.08);
  }

  &:active {
    transform: scale(0.92);
  }
`;

const ChatProfilePic = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 14px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.25s ease;
  cursor: pointer;

  &:hover {
    border-color: rgba(99, 140, 245, 0.4);
    box-shadow: 0 6px 16px rgba(99, 140, 245, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
`;

const ChatTitle = styled.div`
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  flex: 1;
  letter-spacing: -0.2px;
  cursor: pointer;
  transition: color 0.25s ease;

  &:hover {
    color: rgba(99, 140, 245, 0.95);
  }
`;

const VideoCallButton = styled.button`
  background: linear-gradient(135deg, rgba(99, 140, 245, 0.2) 0%, rgba(78, 115, 223, 0.15) 100%);
  border: 1.2px solid rgba(99, 140, 245, 0.4);
  color: #ffffff;
  font-size: 20px;
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.25s ease;
  backdrop-filter: blur(15px) saturate(150%);
  -webkit-backdrop-filter: blur(15px) saturate(150%);
  box-shadow: 0 4px 12px rgba(99, 140, 245, 0.08);

  &:hover {
    background: linear-gradient(135deg, rgba(99, 140, 245, 0.3) 0%, rgba(78, 115, 223, 0.25) 100%);
    border-color: rgba(99, 140, 245, 0.6);
    box-shadow: 0 6px 16px rgba(99, 140, 245, 0.12);
  }

  &:active {
    transform: scale(0.92);
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #1a1d22 0%, #242830 100%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  
  /* Ensure distorted background is visible through glass */
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(99, 140, 245, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(99, 140, 245, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
`;

const TopNavbar = styled.div`
  display: flex;
  align-items: center;
  padding: 18px 20px;
  background: rgba(30, 33, 38, 0.45);
  backdrop-filter: blur(30px) saturate(200%);
  -webkit-backdrop-filter: blur(30px) saturate(200%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  // border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1);
`;

const NavbarTitle = styled.h1`
  color: #ffffff;
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.3px;
`;

const ListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 88px;
  padding-top: 68px;
  display: ${props => props.visible ? 'block' : 'none'};
  
  /* Smooth scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.25);
    }
  }
`;

const TabBar = styled.div`
  display: flex;
  background: rgba(30, 33, 38, 0.35);
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  padding: 12px 14px;
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;
  height: 56px;
  z-index: 1000;
  gap: 10px;
  align-items: center;
  justify-content: center;
  border: 1.2px solid rgba(255, 255, 255, 0.12);
  border-radius: 28px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 10px;
  background-color: ${props => props.active ? 'rgba(99, 140, 245, 0.25)' : 'rgba(255, 255, 255, 0.05)'};
  color: white;
  border: 1.2px solid ${props => props.active ? 'rgba(99, 140, 245, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 14px;
  margin: 0 4px;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  backdrop-filter: blur(15px) saturate(160%);
  -webkit-backdrop-filter: blur(15px) saturate(160%);
  box-shadow: ${props => props.active ? 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 4px 12px rgba(99, 140, 245, 0.15)' : 'inset 0 0.5px 0 rgba(255, 255, 255, 0.08)'};
  position: relative;

  &:first-child {
    border-radius: 18px 12px 12px 18px;
  }

  &:last-child {
    border-radius: 12px 18px 18px 12px;
  }

  &:hover {
    background-color: ${props => props.active ? 'rgba(99, 140, 245, 0.35)' : 'rgba(255, 255, 255, 0.1)'};
    border-color: ${props => props.active ? 'rgba(99, 140, 245, 0.6)' : 'rgba(255, 255, 255, 0.2)'};
  }

  svg {
    transition: transform 0.25s ease;
  }

  &:active svg {
    transform: scale(0.88);
  }
`;

const MessageBadge = styled.div`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
    }
    50% {
      box-shadow: 0 4px 20px rgba(255, 107, 107, 0.6);
    }
  }
`;

const ProfileTabButton = styled(TabButton)`
  height: 40px;
  margin: 2px 4px;
  background-color: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: none;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  img {
    width: 36px;
    height: 36px;
    object-fit: cover;
    border-radius: 50%;
    border: 2.5px solid ${props => props.active ? 'rgba(99, 140, 245, 0.6)' : 'rgba(255, 255, 255, 0.15)'};
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: ${props => props.active ? 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 12px rgba(99, 140, 245, 0.15)' : 'inset 0 0.5px 0 rgba(255, 255, 255, 0.1)'};
  }

  &:hover {
    img {
      border-color: rgba(255, 255, 255, 0.25);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 2px 8px rgba(255, 255, 255, 0.08);
    }
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: ${props => props.active ? '#ffffff' : 'rgba(255, 255, 255, 0.65)'};
  transition: color 0.25s ease;
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  position: relative;
  height: 100%;
  z-index: 1;
  
  /* Smooth scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.25);
    }
  }
`;

const FloatingActionButton = styled.button`
  position: fixed;
  right: 24px;
  bottom: 88px;
  width: 48px;
  height: 48px;
  border-radius: 28px;
  background-color: rgba(78, 115, 223, 0.3);
  color: white;
  border: 1px solid rgba(78, 115, 223, 0.6);
  box-shadow: 0 6px 16px rgba(99, 140, 245, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1002;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 0;

  svg {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    background-color: rgba(78, 115, 223, 0.4);
    border-color: rgba(78, 115, 223, 0.7);
    transform: scale(1.05);
    box-shadow: 0 8px 20px rgba(99, 140, 245, 0.15);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ChatBoxWrapper = styled.div`
    position: fixed;
    width: 100%;
    top: 76px;
    bottom: 0;
    padding-top: ${props => props.isGroupCallActive ? '152px' : '0px'};
`;

const ChatBoxContainer = styled.div`
  padding-top: ${props => props.isGroupCallActive ? '110px' : '0px'};
`;

const MobileHomePage = ({
  currentUser,
  groups,
  privateChats,
  selectedGroup,
  messagesMap,
  userMap,
  userStatusMap,
  typingUsers = {},
  groupMembers,
  isVideoCallActive,
  isGroupCallActive,
  isGroupCallShuttingDown,
  setIsGroupCallShuttingDown,
  onSelectGroup,
  onCreateGroup,
  onEditGroup,
  onDeleteGroup,
  onAddMember, 
  onRemoveMember,
  onMakeAdmin,
  onSendMessage,
  onCreatePrivateChat,
  onDeleteChat,
  onEditChat,
  showUserProfilePopup,
  setShowUserProfilePopup,
  handleShowUserProfilePopup,
  handleOnSaveUserProfile,
  onClickSendMessage,
  // Video call related props
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
  onStartVideoCall,
  onEndVideoCall,
  onStartGroupCall,
  onEndGroupCall,
  handleVideoCall,
  onUpdateProfile,
  onLogout,
  toggleDropdown,
  visibleDropdown,
  setVisibleDropdown,
  sendTypingStatus,
  fetchMessages,
  hasMoreMessages,
  handleNewMessage,
  handleReaction,
  newMessageCount,
  newMessageEdit,
  handleUpdateLatestReadMessage,
  onOpenAddMemberModal,
  onOpenEditGroupModal,
  friendRequests,
  setFriendRequests,
  friendRequestsSent,
  setFriendRequestsSent,
  friendRequestChange,
  setFriendRequestChange,

    setIsGroupCallActive,
}) => {
  const [activeTab, setActiveTab] = useState('private');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  const [isVideoCallMinimized, setIsVideoCallMinimized] = useState(false);
  const [isGroupCallMinimized, setIsGroupCallMinimized] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  useEffect(()=>{
    if(videoCallState === 'idle' && isVideoCallMinimized){
      setIsVideoCallMinimized(false);
    }
  },[videoCallState])

  useEffect(() => {
    onSelectGroup(null);
  }, []);

  // Compute unread badge counts based on comparing last_read_message_id with latest_message.id
  // This matches the HomePage logic and automatically clears when messages are marked as read
  const unreadPrivateCount = privateChats
    ? privateChats.filter(chat =>
        chat.latest_message?.id && 
        chat.last_read_message_id && 
        BigInt(chat.last_read_message_id) < BigInt(chat.latest_message.id)
      ).length
    : 0;

  const unreadGroupCount = groups
    ? groups.filter(group =>
        group.latest_message?.id &&
        group.last_read_message_id &&
        BigInt(group.last_read_message_id) < BigInt(group.latest_message.id)
      ).length
    : 0;

  // Handle phone back button press
  useEffect(() => {
    const handleBackPress = (event) => {
      if (selectedGroup) {
        event.preventDefault();
        onSelectGroup(null);
        setActiveTab(selectedGroup.type === 'private' ? 'private' : 'group');
      }
    };

    // For Android back button
    window.addEventListener('popstate', handleBackPress);
    return () => {
      window.removeEventListener('popstate', handleBackPress);
    };
  }, [selectedGroup, onSelectGroup]);

  // Handle swipe right gesture
  const handleTouchStart = (e) => {
    // Only track swipe if it starts from the left edge (within 30px)
    if (e.touches[0].clientX < 30) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === 0) return; // Swipe didn't start from left edge
    
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX;
    
    // If swiped more than 50px to the right and chat is open, trigger back
    if (swipeDistance > 50 && selectedGroup) {
      onSelectGroup(null);
      setActiveTab(selectedGroup.type === 'private' ? 'private' : 'group');
    }
    
    setTouchStartX(0); // Reset after gesture
  };

  const handleCreateNew = () => {
    if (activeTab === 'private') {
      setShowNewChat(true);
    } else if (activeTab === 'group') {
      setShowCreateGroup(true);
    }
  };

  useEffect(() => {
    console.log('Selected Group changed:', selectedGroup);
  }, [selectedGroup]);


    // const {
    //   localVideoRef,
    //   remoteVideoRef,
    //   startCall,
    //   handleSignalMessage,
    //   endCall,
    //   currentCall,
    //   videoCallState,
    //   pendingCall,
    //   requestCall,
    //   acceptCall,
    //   rejectCall,
    //   toggleVideo,
    //   toggleAudio,
    //   localAudioVideo,
    //   remoteAudioVideo
    // } = useVideoCall({ id: currentUser?.id });
  
    // const handleVideoCall = (peerId) => {
    //   setTimeout(() => {
    //     requestCall(peerId);
    //   }, 0);
    // };

  const renderContent = () => {
    switch (activeTab) {
      case 'friends':
        return (
          <FriendsComponent 
            setFriendRequests={setFriendRequests}
            friendRequests={friendRequests}
            friendRequestsSent={friendRequestsSent}
            friendRequestChange={friendRequestChange}
            setFriendRequestChange={setFriendRequestChange}
            userMap={userMap}
            currentUser={currentUser}
          />
        );
      case 'private':
        return (
          <>
            {!selectedGroup && (
              <TopNavbar>
                <NavbarTitle>Chats</NavbarTitle>
              </TopNavbar>
            )}
            {showUserProfilePopup && (showUserProfilePopup.id != currentUser.id ? (
            <UserProfilePopup
                user_id={showUserProfilePopup.id}
                onClose={() => setShowUserProfilePopup(null)}
                onMessageClick={() => {
                    onClickSendMessage(showUserProfilePopup.id);
                    setShowUserProfilePopup(null);
                }}
                friendRequestChange={friendRequestChange}
                />
            ) : <CurrentUserProfilePopup
                user_id={showUserProfilePopup.id}
                onClose={() => setShowUserProfilePopup(null)}
                onSave={handleOnSaveUserProfile}
            />)} 
            <ListContainer visible={!selectedGroup}>
              <GroupList
                groups={privateChats}
                selectedGroup={selectedGroup}
                onSelectGroup={onSelectGroup}
                userMap={userMap}
                userStatusMap={userStatusMap}
                typingUsers={typingUsers}
                type="private"
                selectedTab={activeTab}
                onDeleteGroup={onDeleteChat}
                onCreateChat={onCreatePrivateChat}
                onOpenAddMemberModal={onOpenAddMemberModal}
                onOpenEditGroupModal={onOpenEditGroupModal}
              />
            </ListContainer>
            {selectedGroup && (
              <ChatWrapper>
                <ChatHeader>
                  <BackButton onClick={() => {
                    onSelectGroup(null);
                    setActiveTab('private');
                  }}>
                    <IoChevronBackOutline />
                  </BackButton>
                  <ChatProfilePic 
                    src={selectedGroup.user?.profile_pic || `https://i.pravatar.cc/40?u=${selectedGroup.user.id}`}
                    alt="Chat"
                    onClick={ () => handleShowUserProfilePopup(selectedGroup.user)}
                  />
                  <ChatTitle onClick={ () => handleShowUserProfilePopup(selectedGroup.user)}>
                    {selectedGroup.user?.name}
                  </ChatTitle>
                  {videoCallState === 'idle' && (
                    <VideoCallButton 
                      onClick={() => {
                        handleVideoCall(selectedGroup.user.id);
                        onStartVideoCall();
                      }}
                    >
                      <FiVideo />
                    </VideoCallButton>
                  )}
                </ChatHeader>
                <ChatBoxWrapper>
                <ChatBox
                  group={selectedGroup}
                  messages={messagesMap[selectedGroup.id] || []}
                  onSendMessage={onSendMessage}
                  currentUser={currentUser}
                  userMap={userMap}
                  typingUsers={typingUsers[selectedGroup.id] || {}}
                  onTyping={sendTypingStatus}
                  groupMembers={groupMembers}
                  fetchMessages={fetchMessages}
                  hasMoreMessages={hasMoreMessages?.[selectedGroup.id]}
                  handleNewMessage={handleNewMessage}
                  handleReaction={handleReaction}
                  newMessageCount={newMessageCount?.[selectedGroup.id]}
                  newMessageEdit={newMessageEdit}
                  setShowUserProfilePopup={setShowUserProfilePopup}
                  handleUpdateLatestReadMessage={handleUpdateLatestReadMessage}
                  isVideoCallActive={isVideoCallActive}
                  onStartVideoCall={onStartVideoCall}
                  onEndVideoCall={onEndVideoCall}
                  onDeleteChat={onDeleteChat}
                  onEditChat={onEditChat}
                />
                </ChatBoxWrapper>
              </ChatWrapper>
            )}
          </>
        );
      case 'group':
        return (
          <>
            {!selectedGroup && (
              <TopNavbar>
                <NavbarTitle>Groups</NavbarTitle>
              </TopNavbar>
            )}
            {showUserProfilePopup && (showUserProfilePopup.id != currentUser.id ? (
            <UserProfilePopup
                user_id={showUserProfilePopup.id}
                onClose={() => setShowUserProfilePopup(null)}
                onMessageClick={() => {
                    onClickSendMessage(showUserProfilePopup.id);
                    setActiveTab('private');
                    setShowUserProfilePopup(null);
                }}
                friendRequestChange={friendRequestChange}
                />
            ) : <CurrentUserProfilePopup
                user_id={showUserProfilePopup.id}
                onClose={() => setShowUserProfilePopup(null)}
                onSave={handleOnSaveUserProfile}
            />)} 
            <ListContainer visible={!selectedGroup}>
              <GroupList
                groups={groups}
                selectedGroup={selectedGroup}
                onSelectGroup={onSelectGroup}
                onCreateGroup={onCreateGroup}
                onEditGroup={onEditGroup}
                onDeleteGroup={onDeleteGroup}
                onAddMember={onAddMember}
                userMap={userMap}
                userStatusMap={userStatusMap}
                typingUsers={typingUsers}
                type="group"
                selectedTab={activeTab}
                onOpenAddMemberModal={onOpenAddMemberModal}
                onOpenEditGroupModal={onOpenEditGroupModal}
              />
            </ListContainer>
            {selectedGroup && (
              <ChatWrapper isGroupCallActive={isGroupCallActive}>
                <ChatHeader>
                  <BackButton onClick={() => {
                    onSelectGroup(null);
                    setActiveTab('group');
                  }}>
                    <IoChevronBackOutline />
                  </BackButton>
                  <ChatProfilePic 
                    src={selectedGroup.type === 'private' ? 
                      userMap[selectedGroup.members.find(id => id !== currentUser.id)]?.profile_pic || `https://i.pravatar.cc/40?u=${selectedGroup.id}` : 
                      selectedGroup.avatar || `https://i.pravatar.cc/40?u=${selectedGroup.id}`
                    } 
                    alt="Chat"
                  />
                  <ChatTitle>
                    {selectedGroup.name}
                  </ChatTitle>

                  {!isGroupCallActive && (
                    <VideoCallButton 
                      onClick={() => {
                        setIsGroupCallActive(true);
                      }}
                    >
                      <FiVideo />
                    </VideoCallButton>
                  )}
                  {/* {isGroupCallActive && (
                    <VideoCallButton 
                      onClick={() => {
                        setIsGroupCallActive(false);
                      }}
                    >
                     <FiPhone color='red' />
                    </VideoCallButton>
                  )} */}
                </ChatHeader>
                { isGroupCallActive && <div style={{marginTop : '110px'}} ></div>}
                
                  <ChatBoxWrapper isGroupCallActive={isGroupCallActive}>
                    {/* <ChatBoxContainer isGroupCallActive={isGroupCallActive}> */}
                <ChatBox
                  group={selectedGroup}
                  messages={messagesMap[selectedGroup.id] || []}
                  onSendMessage={onSendMessage}
                  currentUser={currentUser}
                  userMap={userMap}
                  typingUsers={typingUsers[selectedGroup.id] || {}}
                  onTyping={sendTypingStatus}
                  groupMembers={groupMembers}
                  fetchMessages={fetchMessages}
                  hasMoreMessages={hasMoreMessages?.[selectedGroup.id]}
                  handleNewMessage={handleNewMessage}
                  handleReaction={handleReaction}
                  newMessageCount={newMessageCount?.[selectedGroup.id]}
                  newMessageEdit={newMessageEdit}
                  setShowUserProfilePopup={handleShowUserProfilePopup}
                  handleUpdateLatestReadMessage={handleUpdateLatestReadMessage}
                  isGroupCallActive={isGroupCallActive}
                  onStartGroupCall={onStartGroupCall}
                  onEndGroupCall={onEndGroupCall}
                  onAddMember={onAddMember}
                  onRemoveMember={onRemoveMember}
                  onMakeAdmin={onMakeAdmin}
                />
                {/* </ChatBoxContainer> */}
                </ChatBoxWrapper>
              </ChatWrapper>
            )}
          </>
        );
      case 'profile':
        return (
          <CurrentUserProfilePopup
            user_id={currentUser.id}
            onClose={() => setActiveTab('private')}
            onSave={onUpdateProfile}
            showLogoutButton={true}
            onLogout={onLogout}
            isMobile={true}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {videoCallState !== 'idle' && (
        <VideoCallModal minimized={isVideoCallMinimized}>
            <VideoCallContainer>
              <VideoCallComponent
                currentUser={currentUser}
                localVideoRef={localVideoRef}
                remoteVideoRef={remoteVideoRef}
                endCall={endCall}
                videoCallState={videoCallState}
                pendingCall={pendingCall}
                acceptCall={acceptCall}
                rejectCall={rejectCall}
                userInfo={userInfo}
                toggleVideo={toggleVideo}
                toggleAudio={toggleAudio}
                localAudioVideo={localAudioVideo}
                remoteAudioVideo={remoteAudioVideo}
                isMinimized={isVideoCallMinimized}
                setMinimized={setIsVideoCallMinimized}
            />
          </VideoCallContainer>
        </VideoCallModal>
      )}

      {(isGroupCallActive || isGroupCallShuttingDown) && (
            <GroupCallContainer minimized={isGroupCallMinimized}>
              <GroupCallComponent
                currentUser={currentUser}
                group={selectedGroup}
                handleGroupCallEnded={() => {
                  setIsGroupCallActive(false);
                  setIsGroupCallShuttingDown(false);
                }}
                isGroupCallActive={isGroupCallActive}
                isGroupCallShuttingDown={isGroupCallShuttingDown}
                isMinimized={isGroupCallMinimized}
                setMinimized={setIsGroupCallMinimized}
              />
            </GroupCallContainer>
          )}
      {/* Add FAB */}
      {((activeTab === 'private' || activeTab === 'group') && !selectedGroup) && (
        <FloatingActionButton onClick={handleCreateNew}>
          <MdAdd />
        </FloatingActionButton>
      )}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreateGroup={onCreateGroup}
      />
      <NewPrivateChatModal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        onCreateChat={onCreatePrivateChat}
      />
      <ContentArea>
        {renderContent()}
      </ContentArea>
      { !selectedGroup &&
      <TabBar>
        <TabButton
          active={activeTab === 'private'}
          onClick={() => setActiveTab('private')}
        >
          <IconWrapper active={activeTab === 'private'}>
            <IoChatboxEllipses />
          </IconWrapper>
          {unreadPrivateCount > 0 && (
            <MessageBadge>{unreadPrivateCount > 9 ? '9+' : unreadPrivateCount}</MessageBadge>
          )}
        </TabButton>
        <TabButton
          active={activeTab === 'group'}
          onClick={() => setActiveTab('group')}
        >
          <IconWrapper active={activeTab === 'group'}>
            <HiUserGroup />
          </IconWrapper>
          {unreadGroupCount > 0 && (
            <MessageBadge>{unreadGroupCount > 9 ? '9+' : unreadGroupCount}</MessageBadge>
          )}
        </TabButton>
        <TabButton
          active={activeTab === 'friends'}
          onClick={() => setActiveTab('friends')}
        >
          <IconWrapper active={activeTab === 'friends'}>
            <FaUserFriends />
          </IconWrapper>
          {friendRequests?.length > 0 && (
            <MessageBadge>{friendRequests.length > 9 ? '9+' : friendRequests.length}</MessageBadge>
          )}
        </TabButton>
        <ProfileTabButton
          active={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        >
          <img 
            src={currentUser?.profile_pic || 'https://i.pravatar.cc/40'} 
            alt={getInitials(currentUser?.name) || ''}
            referrerPolicy="no-referrer"
          />
        </ProfileTabButton>
      </TabBar>
    }
    </Container>
  );
};

export default MobileHomePage;
