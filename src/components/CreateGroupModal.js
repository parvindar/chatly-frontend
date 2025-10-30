import React, { useState } from 'react';
import styled from 'styled-components';
import colors from '../styles/colors';

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

const ModalTextarea = styled.textarea`
  width: auto;
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

const CreateGroupModal = ({ isOpen, onClose, onCreateGroup }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const handleSubmit = () => {
    if (groupName.trim()) {
      onCreateGroup({ name: groupName.trim(), description: groupDescription.trim() });
      handleClose();
    }
  };

  const handleClose = () => {
    setGroupName('');
    setGroupDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <h3>Create New Group</h3>
        <ModalInput
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <ModalTextarea
          placeholder="Group Description"
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
          rows={4}
        />
        <ModalButtonContainer>
          <ModalButton secondary onClick={handleClose}>
            Cancel
          </ModalButton>
          <ModalButton onClick={handleSubmit} disabled={!groupName.trim()}>
            Create
          </ModalButton>
        </ModalButtonContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CreateGroupModal;