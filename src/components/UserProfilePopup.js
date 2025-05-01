import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUserClock, FaUserPlus, FaComment, FaUserCheck, FaUserTimes, FaTimes } from 'react-icons/fa';
import { getUserProfile, sendFriendRequest, actOnFriendRequest, removeFriend } from '../api/sdk';
import colors from '../styles/colors';
import { useApiAction } from './useAPIAction';
import { CustomScrollbar } from '../styles/styles';

const dummyGroups = [
  {
    id: 1,
    name: 'Group 1',
    description: 'Description for Group 1',
    profile_pic: 'https://i.pravatar.cc/100',
  },
  {
    id: 2,
    name: 'Group 2',
    description: 'Description for Group 2',
    profile_pic: 'https://i.pravatar.cc/100',
  },
  {
    id: 3,
    name: 'Group 3',
    description: 'Description for Group 3',
    profile_pic: 'https://i.pravatar.cc/100',
  },
  {
    id: 4,
    name: 'Group 4',
    description: 'Description for Group 4',
    profile_pic: 'https://i.pravatar.cc/100',
  },
  {
    id: 5,
    name: 'Group 5 ajskldf jal',
    description: 'Description for Group',
    profile_pic: 'https://i.pravatar.cc'
  },
  {
    id: 6,
    name: 'Group 5 jskdlf ja',
    description: 'Description for Group',
    profile_pic: 'https://i.pravatar.cc'
  },
  {
    id: 5,
    name: 'Group 5 ajskldf jal',
    description: 'Description for Group',
    profile_pic: 'https://i.pravatar.cc'
  },
  {
    id: 6,
    name: 'Group 5 jskdlf ja',
    description: 'Description for Group',
    profile_pic: 'https://i.pravatar.cc'
  }
]

const UserProfilePopup = ({ user_id, onClose, onMessageClick, friendRequestChange }) => {

  const [user, setUser] = useState({
    name: '',
    bio: '',
    profile_pic: '',
    mutual_groups: [],
    mutual_friends: [],
    is_friend: true,
    is_fr_sent: false,
    is_fr_received: true
  });
  const { runAction, isLoading } = useApiAction();




  useEffect(() => {
    if (user_id) {
      getUserProfile(user_id)
        .then(response => {
          setUser(response);
        })
        .catch(error => {
          console.error("Error fetching user profile:", error);
        });
    }

  }, [user_id]);

  useEffect(() => {
    if (friendRequestChange?.user_id == user_id) {
      getUserProfile(user_id)
        .then(response => {
          setUser(response);
        })
        .catch(error => {
          console.error("Error fetching user profile:", error);
        });
    }
  }
    , [friendRequestChange]);

  const handleSendFriendRequest = () => {
    if (isLoading('send-friend-request')) return;
    sendFriendRequest(user_id)
      .then(() => {

        setUser(prevUser => ({
          ...prevUser,
          is_fr_sent: true,
          is_fr_received: false
        }));
      })
      .catch(error => {
        console.error('Error sending friend request:', error);
      });
  };

  const handleActOnFriendRequest = (friend_request_id, action) => {
    if (isLoading(`${action}-request`)) return;
    actOnFriendRequest(friend_request_id, action)
      .then(() => {

        if (action == 'accept') {
          setUser(prevUser => ({
            ...prevUser,
            is_friend: true,
            is_fr_sent: false,
            is_fr_received: false
          }));
        } else if (action == 'reject') {
          setUser(prevUser => ({
            ...prevUser,
            is_friend: false,
            is_fr_sent: false,
            is_fr_received: false
          }));
        } else if (action == 'cancel') {
          setUser(prevUser => ({
            ...prevUser,
            is_friend: false,
            is_fr_sent: false,
            is_fr_received: false
          }));
        }

      })
      .catch(error => {
        console.error('Error acting on friend request:', error);
      });
  };

  const handleRemoveFriend = () => {
    if (isLoading('remove-friend')) return;
    removeFriend(user_id)
      .then(() => {
        setUser(prevUser => ({
          ...prevUser,
          is_friend: false,
          is_fr_sent: false,
          is_fr_received: false
        }));
      })
      .catch(error => {
        console.error('Error removing friend:', error);
      });
  };


  if (!user?.id) {
    return null;
  }

  return (
    <PopupOverlay onClick={onClose}>
      <PopupContainer onClick={(e) => e.stopPropagation()}>
        {user.is_friend &&
          <div title='Friend' style={{ position: 'absolute', top: '10px', right: '10px', color: 'green' }}>
            <FaUserCheck />
          </div>
        }
        <Header>
          <Avatar src={user.profile_pic || 'https://i.pravatar.cc/80'} alt={user.user_id} />
          <Username>
            <DisplayName>{user.name}</DisplayName>
            <Tag>@{user.user_id}</Tag>
          </Username>
        </Header>

        <ContentContainer>
          {/* <Section>
          <SectionTitle>About</SectionTitle>
          <Bio>{user.bio || "Cool User."}</Bio>
        </Section> */}

          {user.mutual_groups && user.mutual_groups.length > 0 && (
            <>
              <Section>
                <SectionTitle>Mutual Groups ({user.mutual_groups.length})</SectionTitle>
                <MutualServersList>
                  {user.mutual_groups.map((group) => (
                    <Server key={group.id}>
                      <ServerIcon src={group.icon || 'https://i.pravatar.cc/40'} alt={group.name} />
                      <ServerName>{group.name}</ServerName>
                    </Server>
                  ))}
                  {/* {user.mutual_groups.length > 3 && (
                <MoreServers>+{user.mutual_groups.length - 3} more</MoreServers>
              )} */}
                </MutualServersList>
              </Section>
              <Divider />
            </>
          )}

          {user.mutual_friends && user.mutual_friends.length > 0 && (
            <>
              <Section>
                <SectionTitle>Mutual Friends ({user.mutual_friends.length})</SectionTitle>
                <MutualServersList>
                  {user.mutual_friends.map((friend) => (
                    <Server key={friend.id}>
                      <ServerIcon src={friend.profile_pic || 'https://i.pravatar.cc/40'} alt={friend.name} />
                      <ServerName>{friend.name}</ServerName>
                    </Server>
                  ))}
                  {/* {user.mutual_groups.length > 3 && (
                <MoreServers>+{user.mutual_groups.length - 3} more</MoreServers>
              )} */}
                </MutualServersList>
              </Section>
              <Divider />
            </>
          )}
        </ContentContainer>
        <ActionButtons>
          <Button primary onClick={onMessageClick}>
            <FaComment /> Message
          </Button>
          {!user.is_friend && (
            user.is_fr_sent ? (
              <Button loading={isLoading('cancel-request')} onClick={() => runAction('cancel-request', () => handleActOnFriendRequest(user.is_fr_sent, 'cancel'))} >
                <span className="default-text">
                  <FaUserClock size={14} /> Request Sent
                </span>
                <span className="hover-text">
                  <FaTimes size={14} /> Cancel Request
                </span>
              </Button>
            ) : user.is_fr_received ? (<>
              <Button primary loading={isLoading('accept-request')} onClick={() => runAction('accept-request', () => handleActOnFriendRequest(user.is_fr_received, 'accept'))}>
                <FaUserCheck /> Accept
              </Button>
              <Button loading={isLoading('reject-request')} onClick={() => runAction('reject-request', () => handleActOnFriendRequest(user.is_fr_received, 'reject'))}>
                <FaUserTimes /> Reject
              </Button>
            </>
            ) : (
              <Button loading={isLoading('send-friend-request')} onClick={() => runAction('send-friend-request', () => handleSendFriendRequest(user_id))}>
                <FaUserPlus /> Add Friend
              </Button>
            ))
          }
          {user.is_friend &&
            (
              <Button loading={isLoading('remove-friend')} onClick={() => runAction('remove-friend', () => handleRemoveFriend(user_id))}>
                <FaUserTimes /> Remove Friend
              </Button>
            )
          }
        </ActionButtons>
      </PopupContainer>
    </PopupOverlay>
  );
};

// Styled Components (Discord-inspired theme)
const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PopupContainer = styled.div`
  position: relative;
  background: #36393f;
  border-radius: 8px;
  width: 340px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  color: #dcddde;
  font-family: 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background: #202225;
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 16px;
  border : 2px solid ${colors.primary};
`;

const Username = styled.div`
  display: flex;
  flex-direction: column;
`;

const DisplayName = styled.span`
  font-size: 20px;
  font-weight: 600;
  color: white;
`;

const Tag = styled.span`
  font-size: 14px;
  color: #b9bbbe;
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(79, 84, 92, 0.48);
  margin: 8px 0;
`;

const Section = styled.div`
  padding: 12px 16px;
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #b9bbbe;
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const Bio = styled.p`
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
`;

const ContentContainer = styled.div`
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  ${CustomScrollbar}
`

const MutualServersList = styled.div`
  display: flex;
  flex-wrap: wrap; 
  gap: 8px;
  max-height: 120px;
  overflow-y: auto;

  ${CustomScrollbar}
`;

const Server = styled.div`
  display: flex;
  align-items: center;
  background: #2f3136;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 14px;
`;

const ServerIcon = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 6px;
`;

const ServerName = styled.span`
  white-space: nowrap;
`;

const MoreServers = styled.span`
  font-size: 12px;
  color: #b9bbbe;
  align-self: center;
`;

const ActionButtons = styled.div`
  display: flex;
  padding: 16px;
  gap: 8px;
`;

const Button = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.2s;

  background: ${(props) => (props.primary ? colors.primary : '#4f545c')};
  color: white;

  &:hover {
    background: ${(props) => (props.primary ? '#4752c4' : '#686d73')};
  }

  i {
    font-size: 14px;
  }

    /* Text transition effect */
  .default-text, .hover-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
    transition: opacity 0.2s, transform 0.2s;
  }

  .hover-text {
    position: absolute;
    opacity: 0;
    transform: translateY(5px);
  }

  &:hover {
    .default-text {
      opacity: 0;
      transform: translateY(-5px);
    }
    .hover-text {
      opacity: 1;
      transform: translateY(0);
    }
  }

`;

export default UserProfilePopup;