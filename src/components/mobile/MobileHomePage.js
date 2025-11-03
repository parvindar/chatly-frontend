import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { IoChatboxEllipses, IoChevronBackOutline } from "react-icons/io5";
import { HiUserGroup } from "react-icons/hi2";
import { FaUserFriends } from "react-icons/fa";
import { FiVideo } from "react-icons/fi";
import GroupList from '../GroupList';
import VideoCallComponent from './MobileVideoCallComponent';
import ChatBox from '../ChatBox';
import FriendsComponent from '../FriendsComponent';
import CurrentUserProfilePopup from '../CurrentUserProfilePopup';
import UserProfilePopup from '../UserProfilePopup';
import CreateGroupModal from '../CreateGroupModal';
import NewPrivateChatModal from '../NewPrivateChatModal';
import { useVideoCall } from '../../components/useVideoCall'; // Import the custom hook for video call

import colors from '../../styles/colors';

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

const ChatWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 60px;
  background-color: #2c2f33;
  z-index: 1001;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #23272a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  padding: 0 15px 0 0;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    color: ${colors.primary};
  }
`;

const ChatProfilePic = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
`;

const ChatTitle = styled.div`
  color: white;
  font-size: 18px;
  flex: 1;
`;

const VideoCallButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #2c2f33;
  position: relative;
`;

const TopNavbar = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #23272a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavbarTitle = styled.h1`
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const ListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 60px;
  display: ${props => props.visible ? 'block' : 'none'};
  margin-top: -1px;
`;

const TabBar = styled.div`
  display: flex;
  background-color: #23272a;
  padding: 6px;
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 50px;
  z-index: 1000;
  gap: 8px;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const TabButton = styled.button`
  flex: 1;
  padding: 8px;
  background-color: ${props => props.active ? colors.primary : 'transparent'};
  color: white;
  border: none;
  border-radius: 4px;
  margin: 0 5px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;

  &:hover {
    background-color: ${colors.primaryHover};
  }

  svg {
    transition: transform 0.2s;
  }

  &:active svg {
    transform: scale(0.9);
  }
`;

const ProfileTabButton = styled(TabButton)`
//   position: relative;
//   overflow: hidden;
//   padding: 0;
//   width: 32px;
     height: 36px;
//   border-radius: 50%;
     margin: 2px 5px;
  background-color: transparent;
  
  img {
    width: 32px;
    height: 32px;
    object-fit: cover;
    border-radius: 50%;
    border: 2px solid ${props => props.active ? colors.primary : 'transparent'};
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: ${props => props.active ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'};
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 60px; /* Height of the tab bar */
  position: relative;
  height: calc(100vh - 60px);
`;

const FloatingActionButton = styled.button`
  position: fixed;
  right: 20px;
  bottom: 80px; /* Above the tab bar */
  width: 40px;
  height: 40px;
  border-radius: 28px;
  background-color: ${colors.primary};
  color: white;
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  z-index: 1002;
  transition: background-color 0.2s, transform 0.2s;

  &:hover {
    background-color: ${colors.primaryHover};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1005;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #23272a;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 350px;
  max-height: 75vh;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #3a3f45;
  color: white;
  outline: none;

  &:focus {
    border-color: #7289da;
  }
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #3a3f45;
  color: white;
  outline: none;
  resize: none;

  &:focus {
    border-color: #7289da;
  }
`;

const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const ModalButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: ${props => props.secondary ? '#36393f' : colors.primary};
  color: ${colors.textPrimary};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${props => props.secondary ? '#2c2f33' : colors.primaryHover};
  }
`;

const UserList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin: 10px 0;
`;

const UserItem = styled.div`
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &:hover {
    background-color: #36393f;
  }
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
}) => {
  const [activeTab, setActiveTab] = useState('private');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    onSelectGroup(null);
  }, []);

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
    console.log(privateChats, groups, selectedGroup);
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
                    src={selectedGroup.user?.profile_pic || 'https://i.pravatar.cc/40'}
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
              <ChatWrapper>
                <ChatHeader>
                  <BackButton onClick={() => {
                    onSelectGroup(null);
                    setActiveTab('group');
                  }}>
                    <IoChevronBackOutline />
                  </BackButton>
                  <ChatProfilePic 
                    src={selectedGroup.type === 'private' ? 
                      userMap[selectedGroup.members.find(id => id !== currentUser.id)]?.profile_pic || 'https://i.pravatar.cc/40' : 
                      selectedGroup.avatar || 'https://i.pravatar.cc/40'
                    } 
                    alt="Chat"
                  />
                  <ChatTitle>
                    {selectedGroup.name}
                  </ChatTitle>
                </ChatHeader>
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
    <Container>
      {videoCallState !== 'idle' && (
        <VideoCallModal>
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
          />
          </VideoCallContainer>
        </VideoCallModal>
      )}
      {/* Add FAB */}
      {((activeTab === 'private' || activeTab === 'group') && !selectedGroup) && (
        <FloatingActionButton onClick={handleCreateNew}>
          +
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
      <TabBar>
        <TabButton
          active={activeTab === 'private'}
          onClick={() => setActiveTab('private')}
        >
          <IconWrapper active={activeTab === 'private'}>
            <IoChatboxEllipses />
          </IconWrapper>
        </TabButton>
        <TabButton
          active={activeTab === 'group'}
          onClick={() => setActiveTab('group')}
        >
          <IconWrapper active={activeTab === 'group'}>
            <HiUserGroup />
          </IconWrapper>
        </TabButton>
        <TabButton
          active={activeTab === 'friends'}
          onClick={() => setActiveTab('friends')}
        >
          <IconWrapper active={activeTab === 'friends'}>
            <FaUserFriends />
          </IconWrapper>
        </TabButton>
        <ProfileTabButton
          active={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        >
          <img 
            src={currentUser?.profile_pic || 'https://i.pravatar.cc/40'} 
            alt="Profile"
          />
        </ProfileTabButton>
      </TabBar>
    </Container>
  );
};

export default MobileHomePage;
