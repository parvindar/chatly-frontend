import { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { getUserProfile } from '../api/sdk';

import styled from 'styled-components';
import colors from '../styles/colors';
import { useApiAction } from './useAPIAction';
import { CustomScrollbar } from '../styles/styles';

const CurrentUserProfilePopup = ({ user_id, onClose, onSave }) => {

  const [user, setUser] = useState({
    name: '',
    bio: '',
    profile_pic: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name || '');
  const [editedBio, setEditedBio] = useState(user.bio || '');

  const { runAction, isLoading } = useApiAction();

  useEffect(() => {
    if (user_id) {
      getUserProfile(user_id)
        .then(response => {
          setUser(response);
          setEditedName(response.name);
          setEditedBio(response.bio);
        })
        .catch(error => {
          console.error("Error fetching user profile:", error);
        });
    }

  }, [user_id]);

  const handleSave = async () => {
    if (editedName.length > 30) {
      alert("Name cannot be more than 30 characters.");
      return;
    }
    if (editedBio.length > 150) {
      alert("Bio cannot be more than 150 characters.");
      return;
    }
    const res = await onSave({ name: editedName.trim(), bio: editedBio.trim() });
    if (res) {
      setUser(prevUser => (res));
    }
    setIsEditing(false);
  };

  if (!user?.id) {
    return null;
  }

  if (isEditing) {
    return (
      <PopupOverlay onClick={onClose}>
        <PopupContainer onClick={(e) => e.stopPropagation()}>
          <Header>
            <Avatar src={user.profile_pic || 'https://i.pravatar.cc/80'} alt={user.user_id} />
            <Username>
              <ModalInput value={editedName} onChange={(e) => {
                if (e.target.value.length <= 30) {
                  setEditedName(e.target.value)
                }
              }} />
              <Tag>@{user.user_id}</Tag>
            </Username>

          </Header>

          <Section>
            <SectionTitle>Edit Bio</SectionTitle>
            <ModalTextarea rows={4} value={editedBio} onChange={(e) => {
              if (e.target.value.length <= 150) {
                setEditedBio(e.target.value)
              }
            }} />
          </Section>

          <Divider />

          <ActionButtons>
            <Button onClick={onClose}>Cancel</Button>
            <Button primary onClick={handleSave}>Save</Button>
          </ActionButtons>
        </PopupContainer>
      </PopupOverlay>
    );
  }

  return (
    <PopupOverlay onClick={onClose}>
      <PopupContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <Avatar src={user.profile_pic || 'https://i.pravatar.cc/80'} alt={user.user_id} />
          <Username>
            {isEditing ? (
              <input value={editedName} onChange={(e) => setEditedName(e.target.value)} />
            ) : (
              <DisplayName>{user.name}</DisplayName>
            )}
            <Tag>@{user.user_id}</Tag>
          </Username>
          {!isEditing && (
            <EditButton title="Edit Profile" onClick={() => setIsEditing(true)}>
              <FaEdit />
            </EditButton>
          )}
        </Header>

        <ContentContainer>
          <Section>
            <SectionTitle>Bio</SectionTitle>
            {isEditing ? (
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                rows={3}
              />
            ) : (
              <Bio>{user.bio || 'No bio available.'}</Bio>
            )}
          </Section>
        </ContentContainer>

        {isEditing && (
          <ActionButtons>
            <Button primary onClick={handleSave}><FaSave /> Save</Button>
            <Button onClick={() => setIsEditing(false)}><FaTimes /> Cancel</Button>
          </ActionButtons>
        )}
      </PopupContainer>
    </PopupOverlay>
  );
};

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
  z-index: 5000;
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

export const EditButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: #555;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    color: #eee;
  }
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

  ${CustomScrollbar}

`;

export default CurrentUserProfilePopup;