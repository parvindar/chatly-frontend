import React from 'react';
import styled from 'styled-components';

const UserItemContainer = styled.div`
  position: relative;
  padding: 10px 0px;
  border-radius: 12px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  margin-bottom: 6px;
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: ${props => props.disabled ? 'transparent' : 'rgba(99, 140, 245, 0.12)'};
      border-color: ${props => props.disabled ? 'transparent' : 'rgba(99, 140, 245, 0.2)'};
      transform: ${props => props.disabled ? 'none' : 'translateX(4px)'};
    }
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'scale(0.98) translateX(4px)'};
    background: ${props => props.disabled ? 'transparent' : 'rgba(99, 140, 245, 0.15)'};
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(99, 140, 245, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const OnlineStatusIndicator = styled.div`
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(26, 29, 34, 0.95);
  background-color: ${(props) => {
    if (props.status === 'online') return '#43b581';
    if (props.status === 'idle') return '#faa61a';
    return '#747f8d';
  }};
  box-shadow: 0 0 8px ${(props) => {
    if (props.status === 'online') return 'rgba(67, 181, 129, 0.6)';
    if (props.status === 'idle') return 'rgba(250, 166, 26, 0.6)';
    return 'rgba(116, 127, 141, 0.6)';
  }};
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 4px;
  min-width: 0;
`;

const UserName = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserSecondaryText = styled.span`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserBadge = styled.div`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    if (props.variant === 'admin') return 'linear-gradient(135deg, rgba(99, 140, 245, 0.25) 0%, rgba(78, 115, 223, 0.2) 100%)';
    if (props.variant === 'member') return 'rgba(255, 255, 255, 0.05)';
    if (props.variant === 'already-member') return 'rgba(255, 255, 255, 0.05)';
    return 'rgba(255, 255, 255, 0.05)';
  }};
  color: ${props => {
    if (props.variant === 'admin') return 'rgba(99, 140, 245, 1)';
    if (props.variant === 'already-member') return 'rgba(255, 255, 255, 0.4)';
    return 'rgba(255, 255, 255, 0.6)';
  }};
  border: 1px solid ${props => {
    if (props.variant === 'admin') return 'rgba(99, 140, 245, 0.3)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  flex-shrink: 0;
`;

const UserItem = ({ 
  user, 
  onClick, 
  disabled = false,
  showStatus = false,
  secondaryText,
  badge,
  children 
}) => {
  return (
    <UserItemContainer 
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <AvatarContainer>
        <Avatar
          src={user.profile_pic || 'https://i.pravatar.cc/44'}
          alt={user.name}
          referrerPolicy="no-referrer"
        />
        {showStatus && user.status && user.status !== 'offline' && (
          <OnlineStatusIndicator status={user.status} />
        )}
      </AvatarContainer>
      <UserDetails>
        <UserName>{user.name}</UserName>
        <UserSecondaryText>
          {secondaryText || `@${user.user_id || user.id}`}
        </UserSecondaryText>
      </UserDetails>
      {badge && (
        <UserBadge variant={badge.variant}>
          {badge.text}
        </UserBadge>
      )}
      {children}
    </UserItemContainer>
  );
};

export default UserItem;
