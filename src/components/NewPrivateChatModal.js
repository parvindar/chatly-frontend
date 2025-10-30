import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import colors from '../styles/colors';
import { getUsersList } from '../api/sdk';
import { useApiAction } from './useAPIAction';

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
  width: 85%;
  max-width: 350px;
  max-height: 75vh;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalInput = styled.input`
  width: auto;
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
    <ModalOverlay>
      <ModalContent>
        <h3>Start New Chat</h3>
        <ModalInput
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <UserList>
          {searchResults.map((user) => (
            <UserItem key={user.id} onClick={() => handleUserSelect(user)}>
              {user.name || user.username}
              {isLoading('createChat') && <span> Loading...</span>}
            </UserItem>
          ))}
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