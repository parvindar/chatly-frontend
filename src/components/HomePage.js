import React, { useState, useEffect, useRef, useCallback,forwardRef,memo } from 'react';
import GroupList from './GroupList';
import ChatBox from './ChatBox';
import VideoCallComponent from './VideoCallComponent';
import styled from 'styled-components';
import colors from '../styles/colors'

import mockData from '../mockData.json'; // Import mock data
import {
  createGroup,
  fetchGroups,
  initializeWebSocket,
  addMessageListener,
  removeMessageListener,
  sendMessageWebSocket,
  getUsersList, // Import the API function
  addMemberInGroup, // Import the API function
  getGroupMembers,
  removeMemberFromGroup, // Import the API function
  makeMemberGroupAdmin,
  getGroupMemberOptions,
  fetchPrivateChats,
  createPrivateChat,
  deleteChat,
  getMessagesByChatId
} from '../api/sdk';

import { useVideoCall } from '../components/useVideoCall'; // Import the custom hook for video call
import { useApiAction } from './useAPIAction';
import _ from 'lodash'; // Import lodash for throttling
import { FiLogOut,FiVideo, FiPhoneOff , FiMoreVertical } from 'react-icons/fi'; // Import the logout icon from react-icons
import { MdCallEnd } from 'react-icons/md';

const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #2c2f33; 
`;

const LeftPanel = styled.div`
  width: 25%;
  max-width: 250px;
  min-width: 180px;
  background-color: #23272a; /* Slightly darker for the left panel */
  color: white;
  display: flex;
  flex-direction: column;
  position: relative; /* To position the button at the bottom */
  overflow: hidden; /* Prevent horizontal scrolling */
`;

const GroupListContainer = styled.div`
  flex: 1; /* Take up available space */
  overflow-y: auto; /* Enable vertical scrolling */
  overflow-x: hidden; /* Disable horizontal scrolling */
  padding: 8px;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px; /* Width of the scrollbar */
  }

  &::-webkit-scrollbar-track {
    background: #2c2f33; /* Track background color */
  }

  &::-webkit-scrollbar-thumb {
    background: #7289da; /* Thumb color */
    border-radius: 4px; /* Rounded corners for the thumb */
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #5b6eae; /* Thumb color on hover */
  }
`;

const RightPanel = styled.div`
  flex: 1;
  background-color: #36393f; /* Main chat area background */
  color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevent horizontal scrolling */
`;

const ChatBoxContainer = styled.div`
  flex: 1; /* Take up the remaining space below the VideoCallComponent */
  border-top: 0px solid #23272a; /* Add a subtle border between video and chat */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevent content from overflowing */
  `;

const CreateChannelButton = styled.button`
  width: calc(100% - 40px); /* Adjust width to match equal left and right margins */
  padding: 10px;
  margin: 0 20px; /* Equal padding on left and right */
  background-color: ${colors.primary};
  color: ${colors.textPrimary};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  position: absolute; /* Fix the button at the bottom */
  bottom: 10px; /* Match the offset with the chatbox input */
  left: 0; /* Center the button horizontally within the panel */
  transition: background-color 0.2s;

  &:hover {
    background-color: ${colors.primaryHover};
  }
`;

const InputContainer = styled.div`
  display: flex;
  padding: 10px 20px; /* Match the offset with the sidebar button */
  background-color: #2c2f33;
  border-top: 1px solid #23272a;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  margin-right: 10px;
  background-color: #3a3f45;
  color: white;
`;

const SendButton = styled.button`
  padding: 10px 20px;
  background-color: #7289da;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #5b6eae;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background-color: #23272a;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalInput = styled.input`
  width: calc(100% - 20px); /* Fix width to stay within the container */
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
  width: calc(100% - 20px); /* Fix width to stay within the container */
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

  &:disabled {
    background-color: ${colors.secondary}; /* Gray out the button */
    color: ${colors.textSecondary}; /* Subtle gray text */
    cursor: not-allowed; /* Show not-allowed cursor */
  }
`;

const GroupItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  position: relative; /* To position the three dots menu */
  transition: background-color 0.2s, color 0.2s;
  background-color: ${(props) => (props.isSelected ? '#414a53' : 'transparent')}; /* Selected color */
  color: ${(props) => (props.isSelected ? colors.textPrimary : colors.textSecondary)}; /* Change text color for selected item */
  font-size: 14px; /* Decrease font size for group names */

  &:hover {
    background-color: ${(props) =>
      props.isSelected ? '#414a53' : '#34363c'}; /* Hover color, a bit darker */
    color: ${colors.textPrimary};
  }
`;
const ThreeDotsMenu = styled.div`
  position: absolute;
  top: 50%; /* Center vertically within the parent container */
  right: 4px; /* Align to the right edge of the container */
  transform: translateY(-50%); /* Adjust for vertical centering */
  cursor: pointer;
  font-size: 18px; /* Adjust icon size */
  color: white;
  display: flex; /* Ensure proper alignment */
  align-items: center; /* Center the icon vertically */
  justify-content: center; /* Center the icon horizontally */
`;

const DropdownMenuContainer = styled.div`
  position: absolute;
  top: 30px;
  right: 10px;
  background-color: #23272a;
  border: 1px solid #7289da;
  border-radius: 4px;
  z-index: 10;
  padding: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const MenuItem = styled.div`
  padding: 8px; /* Slightly smaller padding */
  font-size: 14px; /* Smaller font size */
  color: white;
  cursor: pointer;
  border-radius: 4px; /* Add rounded corners for hover effect */

  &:hover {
    background-color: #3a3f45; /* Subtle gray for hover effect */
  }
`;

const DropdownMenu = forwardRef(({ items, onItemClick }, ref) => {
  return (
    <DropdownMenuContainer ref={ref}>
      {items.map((item, index) => (
        <MenuItem key={index} onClick={() => onItemClick(item.action)}>
          {item.label}
        </MenuItem>
      ))}
    </DropdownMenuContainer>
  );
});

const UserList = styled.div`
  max-height: 80vh; /* Limit the height of the user list */
  overflow-y: auto; /* Enable vertical scrolling when the height is exceeded */
  margin-top: 10px;
  margin-bottom: 10px;
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #2c2f33;
  }

  &::-webkit-scrollbar-thumb {
    background: #7289da;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #5b6eae;
  }
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  cursor: ${(props) => (props.isMember ? 'not-allowed' : 'pointer')}; /* Disable pointer for members */
  position: relative; /* To position the three dots menu */
  transition: background-color 0.2s, color 0.2s, transform 0.2s ease; /* Add transform for scaling effect */
  opacity: ${(props) => (props.isMember ? 0.6 : 1)}; /* Dim the item if the user is already a member */

  background-color: ${(props) =>
    props.isSelected ? '#414a53' : 'transparent'}; /* Selected color */
  color: ${(props) =>
    props.isSelected ? colors.textPrimary : colors.textSecondary}; /* Change text color for selected item */

  &:hover {
    background-color: ${(props) =>
      props.isSelected ? '#414a53' : '#34363c'}; /* Hover color, a bit darker */
    color: ${colors.textPrimary};
  }
`;

const UserProfilePic = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  margin-right: 10px;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`;

const OnlineStatusIndicator = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: ${props => {
    if (props.status === 'video_call') return '#f04747'; // Red for video call
    return props.status === 'online' ? '#43b581' : '#747f8d';
  }};
  border-radius: 50%;
  border: 1px solid #23272a;
  display: ${props =>  (props.status && (props.status !== 'offline')) ? 'block' : 'none'};
`;

const UserName = styled.span`
  font-size: 14px;
  color: white;
`;

const MemberListContainer = styled.div`
  flex: 1; /* Take up available space */
  overflow-y: auto; /* Enable vertical scrolling */
  overflow-x: hidden; /* Disable horizontal scrolling */
  padding: 8px;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px; /* Width of the scrollbar */
  }

  &::-webkit-scrollbar-track {
    background: #2c2f33; /* Track background color */
  }

  &::-webkit-scrollbar-thumb {
    background: #7289da; /* Thumb color */
    border-radius: 4px; /* Rounded corners for the thumb */
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #5b6eae; /* Thumb color on hover */
  }
`;

const RightPanelMembers = styled.div`
  width: 25%; /* Same width as the LeftPanel */
  min-width: 180px;
  max-width: 250px;
  background-color: #23272a; /* Slightly darker for the right panel */
  color: white;
  display: flex;
  flex-direction: column;
  position: relative; /* To position elements inside */
  overflow: hidden; /* Prevent horizontal scrolling */
`;

const UserRole = styled.span`
  font-size: 12px;
  color: ${(props) => (props.isAdmin ? '#f04747' : '#99aab5')}; /* Red for admin, gray for member */
  margin-left: 10px; /* Add spacing between the name and the role */
`;

const MembersHeading = styled.h3`
  font-size: 16px; /* Decrease the font size */
  font-weight: bold;
  color: #99aab5; /* Subtle gray color */
  text-align: center; /* Center the heading horizontally */
  margin: 10px 0; /* Add some vertical spacing */
  border-bottom: 1px solid #2c2f33; /* Add a subtle bottom border */
  padding-bottom: 10px; /* Add some padding below the text */
`;

const MemberThreeDotsMenu = styled.div`
  position: absolute;
  top: 50%; /* Center vertically within the UserItem */
  right: 10px; /* Align to the right edge of the UserItem */
  transform: translateY(-50%); /* Adjust for vertical centering */
  cursor: pointer;
  font-size: 18px;
  color: white;
`;

const MemberDropdownMenu = styled.div`
  position: absolute;
  top: 30px;
  right: 10px;
  background-color: #23272a;
  border: 1px solid #7289da;
  border-radius: 4px;
  z-index: 10;
  padding: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  & > div {
    padding: 10px;
    color: white;
    cursor: pointer;

    &:hover {
      background-color: #7289da;
    }
  }
`;

const ChannelsHeading = styled.h3`
  font-size: 16px; /* Decrease the font size */
  font-weight: bold;
  color: #99aab5; /* Subtle gray color */
  text-align: center; /* Center the heading horizontally */
  margin: 10px 0; /* Add some vertical spacing */
  border-bottom: 1px solid #2c2f33; /* Add a subtle bottom border */
  padding-bottom: 10px; /* Add some padding below the text */
`;

const UserId = styled.span`
  font-size: 12px; /* Smaller font size for user_id */
  color: #99aab5; /* Subtle gray color */
  display: block; /* Display on a new line */
  margin-top: 2px; /* Add some spacing above the user_id */
`;

const CurrentUserContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #2c2f33; /* Add a subtle bottom border */
  margin-bottom: 0px; /* Add spacing below the profile section */
  border-radius: 4px; /* Add rounded corners for hover effect */
  cursor: pointer; /* Make it look clickable */
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: #3a3f45; /* Subtle gray for hover effect */
    color: white; /* Change text color on hover */
  }
`;

const CurrentUserProfilePic = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

const CurrentUserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const CurrentUserName = styled.span`
  font-size: 14px;
  color: white;
`;

const CurrentUserId = styled.span`
  font-size: 12px;
  color: #99aab5; /* Subtle gray color */
  margin-top: 2px;
`;

const AlreadyInGroupLabel = styled.span`
  font-size: 12px;
  color: #99aab5; /* Subtle gray color */
  margin-top: 4px; /* Add spacing above the label */
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogoutIcon = styled(FiLogOut)`
  font-size: 20px;
  color: #99aab5; /* Subtle gray color */
  cursor: pointer;
  margin-left: auto; /* Push the icon to the right */
  transition: color 0.2s;

  &:hover {
    color: #f04747; /* Red color on hover */
  }
`;

const TabsContainer = styled.div`
  display: flex;
  justify-content: space-between; /* Distribute tabs evenly */
  background-color: #23272a; /* Match the left panel background */
  padding: 8px;
  border-bottom: 1px solid #2c2f33; /* Subtle border below the tabs */
`;

const Tab = styled.div`
  flex: 1; /* Make all tabs take equal width */
  text-align: center; /* Center the text inside the tab */
  font-size: 14px;
  font-weight: bold;
  color: ${(props) => (props.isActive ? colors.textPrimary : colors.textSecondary)}; /* Highlight active tab */
  cursor: pointer;
  padding: 10px 0; /* Add vertical padding */
  border-radius: 4px; /* Add rounded corners */
  transition: background-color 0.2s, color 0.2s;

  background-color: ${(props) =>
    props.isActive ? '#414a53' : 'transparent'}; /* Selected color */
  color: ${(props) =>
    props.isActive ? colors.textPrimary : colors.textSecondary}; /* Change text color for selected item */

  &:hover {
    background-color: ${(props) =>
      props.isActive ? '#414a53' : '#34363c'}; /* Hover color, a bit darker */
    color: ${colors.textPrimary};
  }
`;

const VideoCallSection = styled.div`
    height: 35%;
    min-height: 210px;
    margin-bottom: 4px;
    padding: 4px;
  // background-color: #23272a;
  // border-radius: 8px;
  // overflow: hidden;
`;

// Add the new styled component for the chat header bar
const ChatHeaderBar = styled.div`
  height: 20px; /* Adjust height as needed */
  background-color: #23272a; /* Dark background */
  color: #999999;
  font-size: 12px;
  display: flex;
  align-items: center; /* Center content vertically */
  justify-content: center; /* Center content horizontally */
  padding: 0 15px; /* Add some padding */
  font-weight: bold;
  border-bottom: 1px solid #2c2f33; /* Optional border */
  flex-shrink: 0; /* Prevent the header from shrinking */
`;

const HomePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messagesMap, setMessagesMap] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [visibleDropdown, setVisibleDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [userMap, setUserMap] = useState({"a0000000-0000-0000-0000-000000000000" : { id : "a0000000-0000-0000-0000-000000000000", name : "AI", user_id : "ai", status : "online" }});
  const [selectedTab, setSelectedTab] = useState('groups');
  const [visibleMemberDropdown, setVisibleMemberDropdown] = useState(null);
  const groupDropdownRef = useRef(null);
  const memberDropdownRef = useRef(null);
const [privateChats, setPrivateChats] = useState([]);
    const [isCreateChatModalOpen, setIsCreateChatModalOpen] = useState(false);
const [isVideoCallActive, setIsVideoCallActive] = useState(false);

const [userStatusMap, setUserStatusMap] = useState({});
const [typingUsers, setTypingUsers] = useState({});
const [hasMoreMessages, setHasMoreMessages] = useState({});
const [initialMessageLoaded, setInitialMessageLoaded] = useState({});

const {runAction, isLoading} = useApiAction();

       // Reference for the RTCPeerConnection
// Throttled function to fetch users
  const fetchGroupMemberOptions = useCallback(
    _.throttle(async (term) => {
      if (selectedGroup?.id && term.trim()) {
        try {
          const results = await getGroupMemberOptions(selectedGroup.id,term);
          setSearchResults(results);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      } else {
        setSearchResults([]);
      }
    }, 300),
    [selectedGroup]
  );

  const fetchUsers = useCallback(
    _.throttle(async (term) => {
      if (term.trim()) {
        try {
          const results = await getUsersList(term);
          setSearchResults(results);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      } else {
        setSearchResults([]);
      }
    }, 300),
    [currentUser]
  );

  // Handle search input changes
  const handleSearch = (term) => {
    setSearchTerm(term);
    fetchGroupMemberOptions(term);
  };

  const handleCreateChatSearch = (term) => {
    setSearchTerm(term);
    fetchUsers(term);
  };

  // Handle adding a member to the group
  const handleAddMember = async (userId) => {
    if (selectedGroup) {
      try {
        await addMemberInGroup(selectedGroup.id, userId);
        setIsAddMemberModalOpen(false);
        console.log('Member added successfully!');
        setGroupMembers((prevMembers) => [
          ...prevMembers,
          { id: userId, name: '', role: 'member' },
        ]);

        const updatedMembers = await getGroupMembers(selectedGroup.id);
        setGroupMembers(updatedMembers.list);
      } catch (error) { 
        console.error('Error adding member:', error);
      }
    }
  };

  // Handle making a member an admin
  const handleMakeAdmin = async (memberId) => {
    try {
      await makeMemberGroupAdmin(selectedGroup.id, memberId);
      console.log('Member promoted to admin successfully!');
      setGroupMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === memberId ? { ...member, role: 'admin' } : member
        )
      );
    } catch (error) {
      console.error('Error promoting member to admin:', error);
    }
  };

  // Handle removing a member from the group
  const handleRemoveMember = async (memberId) => {
    try {
      await removeMemberFromGroup(selectedGroup.id, memberId);
      console.log('Member removed successfully!');
      setGroupMembers((prevMembers) =>
        prevMembers.filter((member) => member.id !== memberId)
      );
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  // Handle leaving a channel
  const handleLeaveChannel = async (groupId) => {
    try {
      
      await removeMemberFromGroup(groupId, currentUser.id);
      console.log('Left the channel successfully!');
      setGroups((prevGroups) => prevGroups.filter((group) => group.id !== groupId));
      setSelectedGroup(null);
    } catch (error) {
      console.error('Error leaving the channel:', error);
    }
  };

  useEffect(()=>{
    const currentUserId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    if(!currentUserId || !token){
      window.location.href = '/login'; 
    }else{
      const user = JSON.parse(localStorage.getItem('user'));
      setCurrentUser(user);
    }
  },[])

  const fetchPrivateChatss = async () => {
    const data = await fetchPrivateChats(currentUser.id); 
    setPrivateChats(data.list);
  };

  const loadGroups = async (firsttime = false) => {
    const data = await fetchGroups();
    setGroups(data.list);

    if (data.list.length > 0 && firsttime) {
      setSelectedGroup(data.list[0]); 
    }

  };

  useEffect(() => {
    if(!currentUser) return;
    const statusMap = {...userStatusMap};
    statusMap[currentUser.id] = currentUser.status;
    setUserStatusMap(statusMap);

    fetchPrivateChatss();
    loadGroups(true);

  }, [currentUser]);

  useEffect(() =>{
    if(!privateChats) return ;

    const statusMap = {...userStatusMap};

    for(const chat of privateChats){
      statusMap[chat.user.id] = chat.user.status;
    }
    setUserStatusMap(statusMap);

    setUserMap(prev => {
      const newMap = {...prev};
      for(const chat of privateChats){
        newMap[chat.user.id] = chat.user;
      }
      return newMap;
    })

  },[privateChats])

  useEffect(()=>{
    if(groupMembers?.length){
      setUserMap(prev => {
        const newMap = {...prev};
        for(const member of groupMembers){
          newMap[member.id] = member;
        }
        return newMap;
      })
    }
  },[groupMembers])

  useEffect(() => {
    if(!currentUser) return; 
    if(selectedTab !== 'privateChats') return; 
   
  
    fetchPrivateChatss();
  }, [currentUser,selectedTab]);

  // Load groups on component mount
  useEffect(() => {

    if(!currentUser) return; 
    if(selectedTab !== 'groups') return; 

    loadGroups();

  }, [currentUser,selectedTab]);

  const handleNewMessage = (message, local = false) => {
    const { chat_id, sender_id, ...messageData } = message;
    if(currentUser.id === sender_id && !local){
      setMessagesMap((prevMap) => ({
        ...prevMap,
        [chat_id]: [...prevMap[chat_id].filter(msg => !(!msg.id)), message],
      }));
      return;
    }
    setMessagesMap((prevMap) => ({
      ...prevMap,
      [chat_id]: [...(prevMap[chat_id] || []), message],
    }));
  };

  const handleReaction = (message, local = false) => {
    const { chat_id, message_id, emoji, user_id, is_deleted } = message; // Assuming user_id is part of the message
    const reactedByMe = user_id === currentUser.id;
    if(currentUser.id === user_id && !local){
      return;
    }
    setMessagesMap((prevMap) => ({
      ...prevMap,
      [chat_id]: prevMap[chat_id]?.map(msg => {
        if (msg.id === message_id) {
          const existingReactions = msg.reactions || {};
          const currentReaction = existingReactions[emoji] || { count: 0, me: false };
           // Check if the current user reacted
          if(is_deleted){

            if(currentReaction.count === 0){
              return msg;
            }

            if(currentReaction.count === 1){
              // remove emoji from msg
              const newReactions = {...existingReactions};
              delete newReactions[emoji];
              return {
                ...msg,
                reactions: newReactions
              };
            }

            return {
              ...msg,
              reactions: {
                ...existingReactions,
                [emoji]: {
                  count: currentReaction.count - 1, 
                  me: reactedByMe ? false : currentReaction.me
                }
              }
            };
          }
          
          return {
            ...msg,
            reactions: {
              ...existingReactions,
              [emoji]: {
                count: currentReaction.count + 1,
                me: reactedByMe ? true : currentReaction.me
              }
            }
          };
        }
        return msg;
      }) || [],
    }));
  };

  // Initialize WebSocket connection
  useEffect(() => {
    initializeWebSocket();

    const handleUserStatus = (message) => {
      const {user_id, status} = message;
      setUserStatusMap((prevMap) => ({
        ...prevMap,
        [user_id]: status,
      }));
    };

    const handleTypingStatus = (message) => {
      const { user_id, is_typing, chat_id } = message;
      setTypingUsers(prev => ({
        ...prev,
        [chat_id]: {
          ...prev[chat_id],
          [user_id]: is_typing
        }
      }));
    };

    const handleDeleteMessage = (message) => {
      const { chat_id, message_id } = message;
      setMessagesMap((prevMap) => ({
        ...prevMap,
        [chat_id]: prevMap[chat_id]?.filter(msg => msg.id !== message_id) || [],
      }));
    };

    const handleEditMessage = (message) => {
      const { chat_id, message_id, content } = message;
      setMessagesMap((prevMap) => ({
        ...prevMap,
        [chat_id]: prevMap[chat_id]?.map(msg => msg.id === message_id ? {...msg, content, is_edited : true} : msg) || [],
      }));
    };

    addMessageListener("chat", handleNewMessage);
    addMessageListener("user_status", handleUserStatus);
    addMessageListener("typing_status", handleTypingStatus);
    addMessageListener("message_deleted", handleDeleteMessage);
    addMessageListener("message_edited", handleEditMessage);
    addMessageListener("message_reaction", handleReaction);

    return () => {
      removeMessageListener("chat", handleNewMessage);
      removeMessageListener("user_status", handleUserStatus);
      removeMessageListener("typing_status", handleTypingStatus);
      removeMessageListener("message_deleted", handleDeleteMessage);
      removeMessageListener("message_edited", handleEditMessage);
      removeMessageListener("message_reaction", handleReaction);
    };
  }, [currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setVisibleDropdown(null); 
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(event.target)) {
        setVisibleDropdown(null);
      }

      if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target)) {
        setVisibleMemberDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // useEffect(() => {
  //   setSelectedGroup(null);
  //   setGroupMembers([]);
  // }, [selectedTab]);

  // Fetch members of the selected group

  const fetchMessages = async (chatId) => {
      const messages = await getMessagesByChatId(chatId, messagesMap[chatId]?.[0]?.id);

      if(!messages?.list?.length){
        setHasMoreMessages((prevMap) => ({
          ...prevMap,
          [chatId]: false,
        }));
      }else{
        if(!hasMoreMessages[chatId]){
          setHasMoreMessages((prevMap) => ({
            ...prevMap,
            [chatId]: true,
          }));
        }
      }

      setMessagesMap((prevMap) => ({
        ...prevMap,
        [chatId]: [...messages.list, ...(prevMap[chatId] || [])],
      }));
  }

  useEffect(() => {
    const fetchGroupMembers = async () => {
      if (selectedGroup) {
        try {
          const members = await getGroupMembers(selectedGroup.id); 
          setGroupMembers(members.list);
        } catch (error) {
          console.error('Error fetching group members:', error);
        }
      }
    };

    if(selectedGroup){
      if(!initialMessageLoaded[selectedGroup.id]){
        fetchMessages(selectedGroup.id);
        setInitialMessageLoaded((prevMap) => ({
          ...prevMap,
          [selectedGroup.id]: true,
        }));
      }
      fetchGroupMembers();
    }
  }, [selectedGroup]);

  // Function to send a message
  const sendMessage = (message) => {
    if (selectedGroup) {
      const wsmessage = {
        type : 'chat',
        message : message
      }
      sendMessageWebSocket(wsmessage); 
    }
  };

  // Function to add a new message to the selected group's messages
  const addNewMessage = (groupId, newMessage) => {
    setMessagesMap((prevMap) => ({
      ...prevMap,
      [groupId]: [...(prevMap[groupId] || []), newMessage],
    }));
  };

  // Function to create a new channel
  const handleCreateChannel = async () => {
    if (newChannelName.trim()) {
      try {
        const response = await createGroup(newChannelName.trim(), newChannelDescription.trim());
        const newGroup = response.data;
        newGroup.role = 'admin';
        setGroups((prevGroups) => [...prevGroups, newGroup]);
        setMessagesMap((prevMap) => ({
          ...prevMap,
          [newGroup.id]: [], 
        }));
        setSelectedGroup(newGroup); 
        setNewChannelName(''); 
        setNewChannelDescription(''); 
        setIsModalOpen(false); 
        console.log('Channel created successfully!'); 
      } catch (error) {
        console.error('Error creating channel:', error);
      }
    }  
  };

  const handleCreateChat = async (userId) => {
    try {
      const response = await createPrivateChat( userId); 
      const newChat = response;
  
      setPrivateChats((prevChats) => [...prevChats, newChat]);
  
      setIsCreateChatModalOpen(false); 
      console.log('Private chat created successfully!');
    } catch (error) {
      console.error('Error creating private chat:', error);
    }
  };
  
    const handleDeleteChat = async (chatId) => {
    try {
      await deleteChat(chatId); 
      console.log('Chat deleted successfully!');
      setPrivateChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
      if (selectedGroup?.id === chatId) {
        setSelectedGroup(null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const toggleDropdown = (groupId) => {
    setVisibleDropdown((prev) => (prev === groupId ? null : groupId)); 
  };

  const {
    localVideoRef,
    remoteVideoRef,
    startCall,
    handleSignalMessage,
    endCall,
    currentCall,
    videoCallState,
    pendingCall,
    requestCall,
    acceptCall,
    rejectCall,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled,
    isRemoteVideoEnabled
  } = useVideoCall({ id: currentUser?.id });

  const handleVideoCall = (peerId) => {
    setTimeout(() => {
      requestCall(peerId);
    }, 0);
  };

  // Add this function to send typing status
  const sendTypingStatus = useCallback(
    _.throttle((isTyping) => {
      if (selectedGroup) {
        const message = {
          type: 'typing_status',
          message: {
            user_id: currentUser.id,
            is_typing: isTyping,
            chat_id: selectedGroup.id
          }
        };
        sendMessageWebSocket(message);
      }
    }, 1000), // Throttle to once per second
    [selectedGroup, currentUser]
  );

  // Add function to get user info for video call
  const getUserInfoForCall = () => {
    if (videoCallState === 'incoming') {
      // For incoming calls, find the user in privateChats
      return privateChats.find(chat => chat.user.id === pendingCall)?.user;
    } else if (videoCallState === 'outgoing') {
      // For outgoing calls, find the user in privateChats
      return privateChats.find(chat => chat.user.id === pendingCall)?.user;
    }
    return null;
  };

  return (
    <Container>
      <LeftPanel>
        {/* Current User Info */}
        <CurrentUserContainer>
          <CurrentUserProfilePic
            src={currentUser?.profile_pic || 'https://i.pravatar.cc/40'}
            alt={currentUser?.name || 'User'}
          />
          <CurrentUserDetails>
            <CurrentUserName>{currentUser?.name || 'User Name'}</CurrentUserName>
            <CurrentUserId>{currentUser?.user_id || 'user_id'}</CurrentUserId>
          </CurrentUserDetails>
          <LogoutIcon
            onClick={() => {
              localStorage.clear(); 
              window.location.href = '/login'; 
            }}
          />
        </CurrentUserContainer>

        {/* Tabs for Groups and Private Chats */}
        <TabsContainer>
          <Tab
            isActive={selectedTab === 'groups'}
            onClick={() => setSelectedTab('groups')}
          >
            Groups
          </Tab>
          <Tab
            isActive={selectedTab === 'privateChats'}
            onClick={() => setSelectedTab('privateChats')}
          >
            Private
          </Tab>
        </TabsContainer>

        {/* Channels Heading */}
        

        {/* Group or Private Chat List */}
        <GroupListContainer>
          {selectedTab === 'groups' &&
            groups.map((group) => (
              <GroupItem
                key={group.id}
                isSelected={selectedGroup && selectedGroup.id === group.id}
                onClick={() => setSelectedGroup(group)}
              >
                {group.name}
                <ThreeDotsMenu
                  className="menu"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    toggleDropdown(group.id);
                  }}
                >
                   <FiMoreVertical /> 
                </ThreeDotsMenu>
                {visibleDropdown === group.id && (
                  <DropdownMenu
                    ref={groupDropdownRef}
                    items={[
                      ...(group.role === 'admin'
                        ? [{ label: 'Add Member', action: () => setIsAddMemberModalOpen(true) }]
                        : []),
                      { label: 'Leave Channel', action: () => handleLeaveChannel(group.id) },
                    ]}
                    onItemClick={(action) => action()}
                  />
                )}
              </GroupItem>
            ))}
          {selectedTab === 'privateChats' &&
  privateChats.map((chat) => (
    <UserItem
      key={chat.id}
      isSelected={selectedGroup && selectedGroup.id === chat.id} 
      onClick={() => setSelectedGroup(chat)} 
    >
      <UserProfilePic>
        <ProfileImage
          src={chat.user.profile_pic || 'https://i.pravatar.cc/40'} 
          alt={chat.user.name || 'User'}
        />
        <OnlineStatusIndicator status={userStatusMap[chat.user.id]} />
      </UserProfilePic>
      <UserDetails>
        <UserName>{chat.user.name || 'User Name'}</UserName> 
        <UserId>{chat.user.user_id || 'user_id'}</UserId> 
      </UserDetails>
      <ThreeDotsMenu
        className="menu"
        onClick={(e) => {
          e.stopPropagation(); 
          toggleDropdown(chat.id); 
        }}
      >
        <FiMoreVertical /> 
      </ThreeDotsMenu>
      {visibleDropdown === chat.id && (
        <DropdownMenu
          ref={groupDropdownRef}
          items={[
            { label: 'Delete Chat', action: () => handleDeleteChat(chat.id) }, 
          ]}
          onItemClick={(action) => action()} 
        />
      )}
    </UserItem>
  ))}
        </GroupListContainer>

        {/* Create New Channel Button */}
        {selectedTab === 'groups' && (
          <CreateChannelButton onClick={() => setIsModalOpen(true)}>
            New Group
          </CreateChannelButton>
        )}
        {selectedTab === 'privateChats' && (
          <CreateChannelButton onClick={() => setIsCreateChatModalOpen(true)}>
            New Chat
          </CreateChannelButton>
        )}
      </LeftPanel>
      <RightPanel>
        {/* Add the ChatHeaderBar here */}
        {selectedGroup && (
          <ChatHeaderBar>
            {selectedGroup.type === 'private' ?  selectedGroup.user?.name : selectedGroup.name }
          </ChatHeaderBar>
        )}
        {videoCallState !== 'idle' && (
          <VideoCallSection>
            <VideoCallComponent
              localVideoRef={localVideoRef}
              remoteVideoRef={remoteVideoRef}
              endCall={endCall}
              videoCallState={videoCallState}
              pendingCall={pendingCall}
              acceptCall={acceptCall}
              rejectCall={rejectCall}
              userInfo={getUserInfoForCall()}
              toggleVideo={toggleVideo}
              toggleAudio={toggleAudio}
              isVideoEnabled={isVideoEnabled}
              isAudioEnabled={isAudioEnabled}
              isRemoteVideoEnabled={isRemoteVideoEnabled}
            />
          </VideoCallSection>
        )}
        <ChatBoxContainer>
          {selectedGroup && (
            <ChatBox
              messages={messagesMap[selectedGroup?.id] || []}
              onSendMessage={sendMessage}
              currentUser={currentUser}
              typingUsers={typingUsers[selectedGroup?.id] || {}}
              onTyping={sendTypingStatus}
              groupMembers={groupMembers}
              group={selectedGroup}
              userMap={userMap}
              fetchMessages={fetchMessages}
              hasMoreMessages={hasMoreMessages[selectedGroup?.id]}
              handleNewMessage={handleNewMessage}
              handleReaction={handleReaction}
            />
          )}
        </ChatBoxContainer>
      </RightPanel>
      <RightPanelMembers>
        {selectedGroup && selectedGroup.type === 'private' && (
          <>
            {/* User Profile Section for Private Chat */}
            <MembersHeading>Profile</MembersHeading> {/* Reuse heading style */}
            <div style={{ padding: '10px', textAlign: 'center' }}> {/* Center content */}
              <UserProfilePic style={{ margin: '0 auto 10px auto', width: '80px', height: '80px' }}> {/* Larger profile pic */}
                <ProfileImage
                  src={selectedGroup.user.profile_pic || 'https://i.pravatar.cc/80'}
                  alt={selectedGroup.user.name}
                  style={{  border : `2px solid ${colors.primary}` }}
                />
                <OnlineStatusIndicator status={userStatusMap[selectedGroup.user.id]} style={{ width: '12px', height: '12px', right: '2px', bottom: '2px' }}/> {/* Adjusted indicator */}
              </UserProfilePic>
              <UserName style={{ fontSize: '16px', display: 'block', marginBottom: '5px' }}>{selectedGroup.user.name}</UserName>
              <UserId style={{ fontSize: '14px' }}>@{selectedGroup.user.user_id}</UserId>
            </div>

            {/* Video Call Button */}
            {videoCallState === 'idle' && (
              <ModalButton
                onClick={() => {
                  handleVideoCall(selectedGroup.user.id);
                  setIsVideoCallActive(true);
                }}
                style={{
                  margin: '10px auto',
                  width: '60%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiVideo style={{ marginRight: '8px' }} />
                Video Call
              </ModalButton>
            )}
          </>
        )}

        {selectedGroup && selectedGroup.type !== 'private' && (
          <>
            {/* Member List Section for Group Chat */}
            <MembersHeading>Members</MembersHeading>
            <MemberListContainer>
              {groupMembers.map((member) => (
                <UserItem key={member.id}>
                  <UserProfilePic>
                    <ProfileImage
                      src={member.profile_pic || 'https://i.pravatar.cc/40'}
                      alt={member.name}
                    />
                    <OnlineStatusIndicator status={userStatusMap[member.id]} />
                  </UserProfilePic>
                  <UserName>{member.name}</UserName>
                  <UserRole isAdmin={member.role === 'admin'}>
                    {member.role === 'admin' ? 'Admin' : 'Member'}
                  </UserRole>
                  {selectedGroup.role === 'admin' &&
                    member.id !== selectedGroup.created_by &&
                    member.id !== currentUser.id && (
                      <ThreeDotsMenu
                        onClick={(e) => {
                          e.stopPropagation(); 
                          setVisibleMemberDropdown((prev) =>
                            prev === member.id ? null : member.id
                          );
                        }}
                      >
                         <FiMoreVertical /> 
                      </ThreeDotsMenu>
                    )}
                  {visibleMemberDropdown === member.id && (
                    <DropdownMenu
                      ref={memberDropdownRef} 
                      className="member-dropdown"
                      items={[
                        { label: 'Remove', action: () => handleRemoveMember(member.id) },
                        ...(member.role !== 'admin'
                          ? [{ label: 'Make Admin', action: () => handleMakeAdmin(member.id) }]
                          : []),
                      ]}
                      onItemClick={(action) => action()} 
                    />
                  )}
                </UserItem>
              ))}
            </MemberListContainer>
          </>
        )}
      </RightPanelMembers>
      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <h3>New Group</h3>
            <ModalInput
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="Enter Group Name"
            />
            <ModalTextarea
              rows="3"
              value={newChannelDescription}
              onChange={(e) => setNewChannelDescription(e.target.value)}
              placeholder="Enter Description"
            />
            <ModalButtonContainer>
            <ModalButton secondary onClick = {()=>setIsModalOpen(false)}>Cancel</ModalButton>
            <ModalButton onClick = {()=>runAction("createChannel", handleCreateChannel)} disabled = {!newChannelName || isLoading("createChannel")}>Create</ModalButton>
            
            </ModalButtonContainer>
          </ModalContent>
        </ModalOverlay>
      )}
      {isAddMemberModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <h3>Add Member</h3>
            <ModalInput
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for a user..."
            />
            <UserList>
              {searchResults.map((user) => (
                <UserItem
                  key={user.id}
                  isMember={user.is_member || isLoading("addMember")} 
                  onClick = {()=>{ if(!user.is_member && !isLoading("addMember" )) runAction("addMember", ()=>handleAddMember(user.id))}}
                >
                  <UserProfilePic>
                    <ProfileImage
                      src={user.profile_pic || 'https://i.pravatar.cc/40'}
                      alt={user.name}
                    />
                    {/* <OnlineStatusIndicator isOnline={user.is_member} /> */}
                  </UserProfilePic>
                  <UserDetails>
                    <UserName>{user.name}</UserName>
                    <UserId>{user.user_id}</UserId>
                    {user.is_member && (
                      <AlreadyInGroupLabel>Already in group</AlreadyInGroupLabel>
                    )}
                  </UserDetails>
                </UserItem>
              ))}
            </UserList>
            <ModalButton onClick={() => setIsAddMemberModalOpen(false)}>
              Close
            </ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}
      {isCreateChatModalOpen && (
  <ModalOverlay>
    <ModalContent>
      <h3>New Chat</h3>
      <ModalInput
        type="text"
        value={searchTerm}
        onChange={(e) => handleCreateChatSearch(e.target.value)}
        placeholder="Search for a user..."
      />
      <UserList>
        {searchResults.map((user) => (
          <UserItem
            key={user.id}
            isMember={isLoading("createChat")} 
            onClick = {()=>{ if(!isLoading("createChat")) runAction("createChat", ()=>handleCreateChat(user.id))}}
          >
            <UserProfilePic>
              <ProfileImage
                src={user.profile_pic || 'https://i.pravatar.cc/40'}
                alt={user.name}
              />
              {/* <OnlineStatusIndicator isOnline={user.is_member} /> */}
            </UserProfilePic>
            <UserDetails>
              <UserName>{user.name}</UserName>
              <UserId>{user.user_id}</UserId>
            </UserDetails>
          </UserItem>
        ))}
      </UserList>
      <ModalButton onClick={() => setIsCreateChatModalOpen(false)}>
        Close
      </ModalButton>
    </ModalContent>
  </ModalOverlay>
)}
    </Container>
  );
};

export default HomePage;