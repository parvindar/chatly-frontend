import { useState } from "react";
import styled from "styled-components";
import colors from "../styles/colors";
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
  z-index: 1000;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #23272a;
  padding: 20px;
  border-radius: 8px;
  width: 350px;
  max-height : 75vh;
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

const EditGroupComponent = ({ group, handleEditGroup, setIsModalOpen }) => {
    if (!group) return null;

    const { runAction, isLoading } = useApiAction();
    const [groupName, setGroupName] = useState(group.name);
    const [groupDescription, setGroupDescription] = useState(group.description);

    return <ModalOverlay>
        <ModalContent>
            <h3>Edit Group</h3>
            <ModalInput
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter Group Name"
            />
            <ModalTextarea
                rows="3"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Enter Description"
            />
            <ModalButtonContainer>
                <ModalButton secondary onClick={() => setIsModalOpen(false)}>Cancel</ModalButton>
                <ModalButton onClick={() => runAction("editGroup", () => handleEditGroup(group.id, { name: groupName, description: groupDescription }))} disabled={!groupName || isLoading("editGroup")}>Save</ModalButton>
            </ModalButtonContainer>
        </ModalContent>
    </ModalOverlay>
}

export default EditGroupComponent;