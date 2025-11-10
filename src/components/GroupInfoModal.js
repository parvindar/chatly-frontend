import React, { useState, useEffect, useRef, forwardRef } from 'react';
import styled from 'styled-components';
import { FiX, FiUsers, FiMoreVertical } from 'react-icons/fi';
import { getGroupMembers, removeMemberFromGroup, makeMemberGroupAdmin } from '../api/sdk';
import UserItem from './common/UserItem';
import colors from '../styles/colors';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1005;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(26, 29, 34, 0.95) 0%, rgba(36, 40, 48, 0.95) 100%);
  backdrop-filter: blur(25px) saturate(200%);
  -webkit-backdrop-filter: blur(25px) saturate(200%);
  padding: 28px;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  max-height: 80vh;
  margin: 0 16px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
              0 0 0 1px rgba(255, 255, 255, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const GroupInfoSection = styled.div`
  margin-bottom: 8px;
`;

const GroupName = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const GroupDescription = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin: 0 0 8px 0;
  word-wrap: break-word;
  white-space: pre-wrap;
  max-height: 80px;
  overflow: auto;
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
`;

const SectionLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const MemberList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin: 0 -8px;
  padding: 0 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
    }
  }
`;



const LoadingState = styled.div`
  text-align: center;
  padding: 32px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding: 32px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
`;

const EmptyStateText = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
`;

const ThreeDotsMenu = styled.div`
  cursor: pointer;
  font-size: 18px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
  margin-left: 2px;
  flex-shrink: 0;
  width: 26px;
  height: 26px;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  &:active {
    background-color: rgba(255, 255, 255, 0.15);
  }
`;

const ThreeDotsPlaceholder = styled.div`
  width: 26px;
  height: 26px;
  margin-left: 2px;
  flex-shrink: 0;
`;

const DropdownMenuContainer = styled.div`
  position: absolute;
  top: 30px;
  right: 10px;
  background: rgba(30, 33, 38, 0.95);
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  border: 1.2px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  z-index: 1010;
  padding: 6px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3), 
              inset 0 1px 0 rgba(255, 255, 255, 0.08);
  min-width: 140px;
  animation: dropdownFadeIn 0.2s ease-out;

  @keyframes dropdownFadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MenuItem = styled.div`
  padding: 10px 14px;
  color: white;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-bottom: 2px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: rgba(99, 140, 245, 0.25);
      border: 1px solid rgba(99, 140, 245, 0.3);
      transform: translateX(2px);
    }
  }

  &:active {
    background: rgba(99, 140, 245, 0.35);
    transform: scale(0.98);
  }
`;

const UserItemWrapper = styled.div`
  position: relative;
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

const GroupInfoModal = ({ isOpen, onClose, group, onMemberClick, currentUser }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleMemberDropdown, setVisibleMemberDropdown] = useState(null);
  const memberDropdownRef = useRef(null);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target)) {
        setVisibleMemberDropdown(null);
      }
    };

    if (visibleMemberDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visibleMemberDropdown]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!group?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await getGroupMembers(group.id);
        setMembers(response.list || []);
      } catch (err) {
        console.error('Error fetching group members:', err);
        setError('Failed to load members');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && group?.id) {
      fetchMembers();
    }
  }, [isOpen, group?.id]);

  if (!isOpen || !group) return null;

  const handleMemberClick = (member) => {
    if (onMemberClick) {
      onMemberClick(member);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await removeMemberFromGroup(group.id, memberId);
      console.log('Member removed successfully!');
      setMembers((prevMembers) =>
        prevMembers.filter((member) => member.id !== memberId)
      );
      setVisibleMemberDropdown(null);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleMakeAdmin = async (memberId) => {
    try {
      await makeMemberGroupAdmin(group.id, memberId);
      console.log('Member promoted to admin successfully!');
      setMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === memberId ? { ...member, role: 'admin' } : member
        )
      );
      setVisibleMemberDropdown(null);
    } catch (error) {
      console.error('Error promoting member to admin:', error);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FiUsers size={20} style={{ color: 'rgba(99, 140, 245, 0.8)' }} />
            Group Info
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FiX size={18} />
          </CloseButton>
        </ModalHeader>

        <GroupInfoSection>
          <GroupName>{group.name}</GroupName>
          {group.description && (
            <GroupDescription>{group.description}</GroupDescription>
          )}
        </GroupInfoSection>

        <Divider />

        <SectionLabel>
          {loading ? 'Loading Members...' : `Members (${members.length})`}
        </SectionLabel>

        <MemberList>
          {loading ? (
            <LoadingState>Loading members...</LoadingState>
          ) : error ? (
            <EmptyState>{error}</EmptyState>
          ) : members.length === 0 ? (
            <EmptyState>
              <FiUsers size={48} />
              <EmptyStateText>No members found</EmptyStateText>
            </EmptyState>
          ) : (
            members.map((member) => {
              const showThreeDots = group.role === 'admin' &&
                member.id !== group.created_by &&
                currentUser && member.id !== currentUser.id;
              
              return (
              <UserItemWrapper key={member.id}>
                <UserItem
                  user={member}
                  onClick={() => handleMemberClick(member)}
                  showStatus={true}
                  badge={member.role === 'admin' ? {
                    variant: 'admin',
                    text: 'Admin'
                  } : null}
                >
                  {showThreeDots ? (
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
                  ) : member.role === 'admin' ? (
                    <ThreeDotsPlaceholder />
                  ) : null}
                </UserItem>
                {visibleMemberDropdown === member.id && (
                  <DropdownMenu
                    ref={memberDropdownRef}
                    items={[
                      { label: 'Remove', action: () => handleRemoveMember(member.id) },
                      ...(member.role !== 'admin'
                        ? [{ label: 'Make Admin', action: () => handleMakeAdmin(member.id) }]
                        : []),
                    ]}
                    onItemClick={(action) => action()}
                  />
                )}
              </UserItemWrapper>
            );
            })
          )}
        </MemberList>
      </ModalContent>
    </ModalOverlay>
  );
};

export default GroupInfoModal;
