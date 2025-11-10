import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import colors from '../styles/colors';
import { CustomScrollbar } from '../styles/styles';
import { FiMoreVertical } from 'react-icons/fi';
import TypingAnimation from './TypingAnimation';
import { getInitials } from '../utils/common';

const GroupItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s, color 0.2s;
  background-color: ${(props) => (props.isSelected ? '#414a53' : 'transparent')};
  color: ${(props) => (props.isSelected ? colors.textPrimary : colors.textSecondary)};
  font-size: 14px;

  &:hover {
    background-color: ${(props) =>
    props.isSelected ? '#414a53' : '#34363c'};
    color: ${colors.textPrimary};
  }
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  cursor: ${(props) => (props.isMember ? 'not-allowed' : 'pointer')};
  position: relative;
  transition: background-color 0.2s, color 0.2s, transform 0.2s ease;
  opacity: ${(props) => (props.isMember ? 0.6 : 1)};

  background-color: ${(props) =>
    props.isSelected ? '#414a53' : 'transparent'};
  color: ${(props) =>
    props.isSelected ? colors.textPrimary : colors.textSecondary};

  &:hover {
    background-color: ${(props) =>
    props.isSelected ? '#414a53' : '#34363c'};
    color: ${colors.textPrimary};
  }
`;

const UserProfilePic = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  margin-right: 10px;
  flex-shrink: 0;
  cursor: pointer;
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
    if (props.status === 'video_call') return '#f04747';
    return props.status === 'online' ? '#43b581' : '#747f8d';
  }};
  border-radius: 50%;
  border: 1px solid #23272a;
  display: ${props => (props.status && (props.status !== 'offline')) ? 'block' : 'none'};
`;

const UserName = styled.span`
  font-size: 14px;
  color: white;
  cursor: pointer;
`;

const UserId = styled.span`
  font-size: 12px;
  color: #99aab5;
  margin-top: 2px;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ThreeDotsMenu = styled.div`
  position: absolute;
  top: 50%;
  right: 4px;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 18px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UnreadMessagesIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${colors.primary};
  margin-left: auto;
  margin-right: 24px;
`;

const TypingAnimationContainer = styled.div`
  margin-left: auto;
  margin-right: 24px;
  display: flex;
  align-items: center;
`;

const UserTypingIndicatorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-top: 10px;
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
  padding: 8px;
  font-size: 14px;
  color: white;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: #3a3f45;
  }
`;

const DropdownMenu = React.forwardRef(({ items, onItemClick }, ref) => {
  return (
    <DropdownMenuContainer ref={ref} onClick={(e) => e.stopPropagation()}>
      {items.map((item, index) => (
        <MenuItem key={index} onClick={() => onItemClick(item.action)}>
          {item.label}
        </MenuItem>
      ))}
    </DropdownMenuContainer>
  );
});

const GroupListContainer = styled.div`
  flex: 1; /* Take up available space */
  overflow-y: auto; /* Enable vertical scrolling */
  overflow-x: hidden; /* Disable horizontal scrolling */
  padding: 8px;

  /* Custom scrollbar styling */
  ${CustomScrollbar}
`;

const GroupList = ({ 
  groups = [], 
  selectedGroup, 
  onSelectGroup, 
  type = 'group',
  typingUsers = {},
  onCreateChat,
  onCreateGroup,
  onDeleteGroup,
  onEditGroup,
  onAddMember,
  onOpenAddMemberModal,
  onOpenEditGroupModal,
  userMap = {},
  userStatusMap = {},
  selectedTab
}) => {
  const [visibleDropdown, setVisibleDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setVisibleDropdown(null);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <GroupListContainer>
          {groups.map((item) => (
            <UserItem
              key={item.id}
              isSelected={selectedGroup && selectedGroup.id === item.id}
              onClick={() => onSelectGroup(item)}
            >
              <UserProfilePic>
                <ProfileImage
                  src={type === 'private' ? item.user?.profile_pic || `https://i.pravatar.cc/100?u=${item.user?.id}` : item.profile_pic || `https://i.pravatar.cc/100?u=${item.id}`}
                  alt={type === 'private' ? getInitials(item.user?.name) : getInitials(item.name)}
                  referrerPolicy="no-referrer"
                />
                {type === 'private' && (
                  <OnlineStatusIndicator status={userStatusMap[item.user?.id] || 'offline'} />
                )}
              </UserProfilePic>
              
              <UserDetails>
                <UserName>{type === 'private' ? item.user?.name : item.name}</UserName>
                {type === 'private' && item.user?.user_id && (
                  <UserId>{item.user.user_id}</UserId>
                )}
              </UserDetails>

              {((item.id !== selectedGroup?.id) && Object.values(typingUsers?.[item.id] || {}).filter((isTyping) => isTyping).length > 0) ? (
                <TypingAnimationContainer>
                  <TypingAnimation />
                </TypingAnimationContainer>
              ) : (item.last_read_message_id && item.latest_message && BigInt(item.last_read_message_id) < BigInt(item.latest_message.id)) && (
                <UnreadMessagesIndicator />
              )}

              <ThreeDotsMenu
                onClick={(e) => {
                  e.stopPropagation();
                  setVisibleDropdown(item.id);
                }}
              >
                <FiMoreVertical />
              </ThreeDotsMenu>
              
              {visibleDropdown === item.id && (
                <DropdownMenu
                  ref={dropdownRef}
                  items={type === 'private' ? [
                    { label: 'Delete Chat', action: () => onDeleteGroup && onDeleteGroup(item.id) }
                  ] : [
                    ...(item.role === 'admin' ? [
                      // { 
                      //   label: 'Add Member', 
                      //   action: () => setIsAddMemberModalOpen(true)
                      // },
                      // { 
                      //   label: 'Edit', 
                      //   action: () => onOpenEditGroupModal ? onOpenEditGroupModal(item) : onEditGroup && onEditGroup(item)
                      // }
                    ] : []),
                    { label: 'Leave', action: () => onDeleteGroup && onDeleteGroup(item.id) }
                  ]}
                  onItemClick={(action) => {
                    action();
                    setVisibleDropdown(null);
                  }}
                />
              )}
            </UserItem>
          ))}
        </GroupListContainer>
  );
};

export default GroupList;