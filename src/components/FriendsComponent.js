import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import colors from '../styles/colors';
import { FaCheck } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { FaUserClock, FaUserPlus, FaComment, FaUserCheck, FaUserTimes, FaTimes } from 'react-icons/fa';

import { getFriendRequests, getFriendRequestsSent, actOnFriendRequest } from '../api/sdk';
import { CustomScrollbar } from '../styles/styles';

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

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-size: 14px;
  color: white;
`;

const UserId = styled.span`
  font-size: 12px; /* Smaller font size for user_id */
  color: #99aab5; /* Subtle gray color */
  display: block; /* Display on a new line */
  margin-top: 2px; /* Add some spacing above the user_id */
`;

const UserComponent = ({ user }) => (
    <UserItem>
        <UserProfilePic>
            <ProfileImage
                src={user.profile_pic || 'https://i.pravatar.cc/40'}
                alt={user.name || 'User'}
                referrerPolicy="no-referrer"
            />
            {/* <OnlineStatusIndicator status={userStatusMap[user.id]} /> */}
        </UserProfilePic>
        <UserDetails>
            <UserName>{user.name || 'User Name'}</UserName>
            <UserId>{user.user_id || 'user_id'}</UserId>
        </UserDetails>
    </UserItem>)



const OuterContainer = styled.div`
    width : 100%;
    height : 100%;
`

const TabsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  background: rgba(35, 39, 42, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 6px 12px;
  margin: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  box-sizing: border-box;
`;

const Tab = styled.div`
  flex: 1;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  background-color: ${(props) =>
        props.isActive ? 'rgba(78, 115, 223, 0.3)' : 'rgba(255, 255, 255, 0.08)'};
  border: 1px solid ${(props) =>
        props.isActive ? 'rgba(78, 115, 223, 0.6)' : 'rgba(255, 255, 255, 0.12)'};
  color: ${(props) =>
        props.isActive ? colors.textPrimary : colors.textSecondary};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: ${(props) =>
        props.isActive ? '0 2px 8px rgba(78, 115, 223, 0.2)' : 'none'};
  margin: 0 4px;

  &:first-child {
    border-radius: 16px 12px 12px 16px;
  }

  &:last-child {
    border-radius: 12px 16px 16px 12px;
  }

  &:hover {
    background-color: ${(props) =>
        props.isActive ? 'rgba(78, 115, 223, 0.4)' : 'rgba(255, 255, 255, 0.15)'};
    border-color: ${(props) =>
        props.isActive ? 'rgba(78, 115, 223, 0.7)' : 'rgba(255, 255, 255, 0.2)'};
    color: ${colors.textPrimary};
  }
`;


const UserListContainer = styled.div`
  flex: 1; /* Take up available space */
  overflow-y: auto; /* Enable vertical scrolling */
  overflow-x: hidden; /* Disable horizontal scrolling */
  padding: 8px;
  ${CustomScrollbar}
`
const FriendRequestsItem = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: space-between;
//   padding: 8px;
  width: 100%;
  background: rgb(32, 34, 37);
  &:hover {
    background-color:rgb(41, 43, 48);
  }
    // border : 1px solid blue;
    border-radius: 8px;
    margin-bottom: 4px;
    cursor: pointer;
`

const UserInfo = styled.div`
display: flex;
// border: 1px solid red;
width : 70%;
`

const ActionItems = styled.div`
display: flex;
justify-content: flex-end;
align-items: center;
// border : 1px solid red;
width : 30%;


.tick {
    &:hover{
        color:rgb(48, 187, 67);
    }
}

.cross {
    // font-size : 20px;
    // padding: 6px;
    &:hover{
        color:rgb(245, 68, 68);
    }
}
`

const ActionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding : 8px;
  cursor: pointer;
//   border: 1px solid #7289da;
  font-size : 16px;
  
`

const FriendsComponent = ({ currentUser, friendRequests, friendRequestsSent, setFriendRequests, setFriendRequestsSent }) => {
    const [selectedTab, setSelectedTab] = useState('received');


    const handleAcceptFriendRequest = async (requestId) => {
        const res = await actOnFriendRequest(requestId, 'accept');
        if (res) {
            setFriendRequests(friendRequests.filter(request => request.id !== requestId));
        }
    }

    const handleRejectFriendRequest = async (requestId) => {
        const res = await actOnFriendRequest(requestId, 'reject');
        if (res) {
            setFriendRequests(friendRequests.filter(request => request.id !== requestId));
        }
    }

    const handleCancelFriendRequest = async (requestId) => {
        const res = await actOnFriendRequest(requestId, 'cancel');
        if (res) {
            setFriendRequestsSent(friendRequestsSent.filter(request => request.id !== requestId));
        }
    }

    return (
        <OuterContainer>
            <TabsContainer>
                {/* <Tab
                    isActive={selectedTab === 'friends'}
                    onClick={() => setSelectedTab('groups')}
                >
                    Friends
                </Tab> */}
                <Tab
                    isActive={selectedTab === 'received'}
                    onClick={() => setSelectedTab('received')}
                >
                    Friend Requests
                </Tab>
                <Tab
                    isActive={selectedTab === 'sent'}
                    onClick={() => setSelectedTab('sent')}
                >
                    Sent Requests
                </Tab>
            </TabsContainer>
            <UserListContainer>
                {selectedTab == 'received' &&
                    friendRequests.map(fr =>
                        <>
                            <FriendRequestsItem key={fr.id}>
                                <UserInfo> <UserComponent user={fr.user} /> </UserInfo>
                                <ActionItems>
                                    <ActionItem className='tick' onClick={() => handleAcceptFriendRequest(fr.id)}>
                                        <FaUserCheck />
                                    </ActionItem>
                                    <ActionItem className='cross' onClick={() => handleRejectFriendRequest(fr.id)}>
                                        <FaUserTimes />
                                    </ActionItem>

                                </ActionItems>
                            </FriendRequestsItem>
                        </>
                    )
                }
                {selectedTab == 'sent' &&
                    friendRequestsSent.map(fr =>
                        <FriendRequestsItem key={fr.id}>
                            <UserInfo> <UserComponent user={fr.user} /> </UserInfo>
                            <ActionItems>
                                <ActionItem className='cross' onClick={() => handleCancelFriendRequest(fr.id)}>
                                    <FaTimes />
                                </ActionItem>

                            </ActionItems>
                        </FriendRequestsItem>
                    )
                }
            </UserListContainer>

        </OuterContainer>

    );
};

export default FriendsComponent;