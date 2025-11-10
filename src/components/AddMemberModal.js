import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import colors from '../styles/colors';
import { getGroupMemberOptions } from '../api/sdk';
import { useApiAction } from './useAPIAction';
import _ from 'lodash';
import UserItem from './common/UserItem';

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

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 24px 0;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 15px;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    border-color: rgba(99, 140, 245, 0.5);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(99, 140, 245, 0.1);
  }
`;

const UserList = styled.div`
  max-height: 380px;
  overflow-y: auto;
  margin: 0 -8px 20px -8px;
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



const ModalButton = styled.button`
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  &:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const AddMemberModal = ({ isOpen, onClose, selectedGroup, onAddMember }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { runAction, isLoading } = useApiAction();

  const fetchGroupMemberOptions = useCallback(
    _.throttle(async (term) => {
      if (selectedGroup?.id && term.trim()) {
        try {
          const results = await getGroupMemberOptions(selectedGroup.id, term);
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

  const handleSearch = (term) => {
    setSearchTerm(term);
    fetchGroupMemberOptions(term);
  };

  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Add Member</ModalTitle>
        <ModalInput
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for a user..."
          autoFocus
        />
        <UserList>
          {searchResults.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              disabled={user.is_member || isLoading("addMember")}
              onClick={() => {
                if (!user.is_member && !isLoading("addMember")) {
                  runAction("addMember", () => onAddMember(user.id));
                }
              }}
              badge={user.is_member ? {
                variant: 'already-member',
                text: 'Already in group'
              } : null}
            />
          ))}
        </UserList>
        <ModalButton onClick={handleClose}>
          Close
        </ModalButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AddMemberModal;
