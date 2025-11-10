import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import colors from '../styles/colors';
import { getUsersList } from '../api/sdk';
import { useApiAction } from './useAPIAction';
import { getInitials } from '../utils/common';
import { FiSearch, FiX } from 'react-icons/fi';
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

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
  pointer-events: none;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 14px 14px 14px 44px;
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



const EmptyState = styled.div`
  text-align: center;
  padding: 48px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 32px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
`;

const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 14px 24px;
  background: ${props => props.secondary 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%)' 
    : 'linear-gradient(135deg, rgba(99, 140, 245, 0.3) 0%, rgba(78, 115, 223, 0.2) 100%)'};
  color: white;
  border: 1px solid ${props => props.secondary 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(99, 140, 245, 0.3)'};
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: ${props => props.secondary 
    ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
    : '0 4px 12px rgba(99, 140, 245, 0.2)'};

  &:hover {
    background: ${props => props.secondary 
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)' 
      : 'linear-gradient(135deg, rgba(99, 140, 245, 0.4) 0%, rgba(78, 115, 223, 0.3) 100%)'};
    transform: translateY(-1px);
    box-shadow: ${props => props.secondary 
      ? '0 6px 16px rgba(0, 0, 0, 0.3)' 
      : '0 6px 16px rgba(99, 140, 245, 0.3)'};
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const NewPrivateChatModal = ({ isOpen, onClose, onCreateChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { runAction, isLoading } = useApiAction();

  const fetchUsers = async () => {
      if (searchTerm.trim()) {
        console.log('here')
        try {
          const results = await getUsersList(searchTerm);
          console.log('Fetched users:', results);
          if (results) {
            console.log('User search results:', results);
            setSearchResults(results);
          }
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      } else {
        setSearchResults([]);
      }
};

  useEffect(() => {
    const timeoutId = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, runAction]);

  const handleUserSelect = (user) => {
    onCreateChat(user.id);
    handleClose();
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
        <ModalHeader>
          <ModalTitle>Start New Chat</ModalTitle>
          <CloseButton onClick={handleClose}>
            <FiX size={18} />
          </CloseButton>
        </ModalHeader>
        <SearchContainer>
          <SearchIcon />
          <ModalInput
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </SearchContainer>
        <UserList>
          {isLoading('searchUsers') ? (
            <LoadingState>Searching...</LoadingState>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
              <UserItem 
                key={user.id} 
                user={user}
                onClick={() => handleUserSelect(user)}
              />
            ))
          ) : searchTerm.trim() ? (
            <EmptyState>No users found</EmptyState>
          ) : (
            <EmptyState>Start typing to search users</EmptyState>
          )}
        </UserList>
        <ModalButtonContainer>
          <ModalButton secondary onClick={handleClose} disabled={isLoading('createChat')}>
            Cancel
          </ModalButton>
        </ModalButtonContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default NewPrivateChatModal;