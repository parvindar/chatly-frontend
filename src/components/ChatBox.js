import React, { useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import colors from '../styles/colors';
import { IoMdSend } from 'react-icons/io';
import { BsThreeDots } from 'react-icons/bs';
import { MdEdit } from 'react-icons/md';
import { deleteChatMessage, editChatMessage } from '../api/sdk';

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0px;
  position: relative;
  height: 100%;
`;

const MessageList = styled.div`
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  padding-right: 10px;
  margin-bottom: 60px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #2c2f33;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #4A7BCC;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #3a66a1;
  }
`;

const MessageItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  padding: 10px;
  background-color: ${(props) =>
    props.isEditing ? '#2c2f33' : (props.isCurrentUser ? colors.primary : '#2c2f33')};
  border-radius: 8px;
  color: ${(props) => (props.isCurrentUser && !props.isEditing ? colors.textPrimary : colors.textSecondary)};
  align-self: ${(props) => (props.isCurrentUser ? 'flex-end' : 'flex-start')};
  max-width: 100%;
  word-wrap: break-word;
  flex-direction: row;
`;

const ProfilePic = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: ${(props) => (props.isCurrentUser ? '0 0 0 10px' : '0 10px 0 0')};
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  flex: 1;
`;

const SenderName = styled.span`
  font-size: 12px;
  font-weight: bold;
  color: ${(props) => (props.isCurrentUser ? '#ffffff' : '#7289da')};
  margin-bottom: 5px;
`;

const MessageContainer = styled.div`
  position: relative;
  width: 100%;
`;

const OtherUserTimeStamp = styled.span`
  font-size: 0.6rem;
  color: #999;
  margin-left: 8px;
`;

const CurrentUserTimeStamp = styled.span`
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 0.6rem;
  color: #eee;
  background-color: #2c2f33;
  padding: 2px 4px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${MessageContainer}:hover & {
    opacity: 0.9;
  }
`;

const MessageText = styled.span`
  font-size: 14px;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
`;

// New component for the persistent 'edited' indicator for the current user
const EditedIndicator = styled.span`
  position: absolute;
  top: 0px;
  right: 4px; // Adjust if needed to not overlap timestamp on hover
  font-size: 0.6rem;
  color: #ddd;
  padding: 1px 3px;
  border-radius: 3px;
  opacity: 1;
  transition: opacity 0.2s;

  ${MessageContainer}:hover & {
    opacity: 0;
  }
`;

const InputContainer = styled.div`
  display: flex;
  padding: 10px;
  background-color: #36393f;
  border-top: 0px solid #1e2124;
  position: absolute;
  z-index: 1;
  bottom: 0;
  left: 0;
  right: 0;
`;

const Input = styled.input`
  padding: 12px;
  border: none;
  border-radius: 4px;
  background-color: #23272a;
  color: white;
  width: 100%;
  padding-right: 40px;
  position: relative;
`;

const SendButton = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #4e73df;
  color: white;
  border: none;
  border-radius: 100%;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;

  &:hover {
    background-color: #3d5bb5;
  }

  &:active {
    background-color: #334a91;
  }

  svg {
    color: #F7F7F7;
    font-size: 18px;
    margin-left: 2px;
  }
`;
const TypingIndicator = styled.div`
  position: absolute;
  z-index: 2;
  bottom: 52px;
  left: 12px;
  display: flex;
  height: 20px;
  align-items: center;
  color: #dcddde;
  font-size: 0.8rem;
  gap: 5px;
  border-radius: 4px;
`;

const TypingAnimation = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  
  .dot {
    width: 4px;
    height: 4px;
    background: #dcddde;
    border-radius: 50%;
    animation: typing 1.4s infinite;
    
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
  
  @keyframes typing {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-4px); }
  }
`;

const MessageMenu = styled.div`
  position: absolute;
  right: 8px;
  bottom: -2px;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
  color: ${colors.textSecondary};
  
  ${MessageContainer}:hover & {
    opacity: 1;
  }
`;

const MessageMenuOptions = styled.div`
  position: absolute;
  right: 0;
  bottom: 24px;
  background-color: #2c2f33;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 10;
  min-width: 120px;
  overflow: hidden;
`;

const MenuOption = styled.div`
  padding: 8px 8px;
  color: ${colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 12px;
  gap: 8px;
  
  &:hover {
    background-color: #36393f;
  }
`;

// New styled components for editing
const EditContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const EditTextArea = styled.textarea`
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #23272a;
  color: white;
  min-height: 50px;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  margin-bottom: 8px;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 1px ${colors.primary};
  }
`;

const EditActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const EditButton = styled.button`
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  background-color: #36393f;
  color: ${colors.textSecondary};
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #40444b;
  }

  &:first-of-type {
    // Example: background-color: ${colors.primary}; color: white;
    // &:hover { background-color: #3a66a1; }
  }
`;

const ChatBox = ({ group, messages, onSendMessage, typingUsers = {}, onTyping, groupMembers = [], userMap = {}, fetchMessages = () => {}, hasMoreMessages = true }) => {
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageContent, setEditingMessageContent] = useState('');
  const [showMenuForMessage, setShowMenuForMessage] = useState(null);
  const currentUserId = localStorage.getItem('user_id');
  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageListRef = useRef(null);
  const isUserScrolling = useRef(false);
  const menuRef = useRef(null);
  const menuOptionsRef = useRef(null);

  const scrollToBottom = () => {
    if (!isUserScrolling.current) {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      if (messageListRef.current) {
        const { scrollTop } = messageListRef.current;
        if (scrollTop === 0 && messages.length > 0 && hasMoreMessages) {
          isUserScrolling.current = true;
          fetchMessages(group.id, messages[0].id);
        }
      }
    };

    const messageList = messageListRef.current;
    if (messageList) {
      messageList.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (messageList) {
        messageList.removeEventListener('scroll', handleScroll);
      }
    };
  }, [messages, group.id, fetchMessages]);

  useEffect(() => {
    isUserScrolling.current = false;
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (input.trim()) {
      try {
        const newMessage = {
          sender_id: currentUserId,
          sender_info: {
            name: 'You',
          },
          content: input.trim(),
          chat_id: group.id,
          timestamp: new Date().toISOString(),
        };
        onSendMessage(newMessage);

        if (typing) {
          setTyping(false);
          
          if(typingTimeoutRef.current){
            clearTimeout(typingTimeoutRef.current);
            onTyping(false);
          }
        }

        setInput('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTimestamp = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    if (now.toDateString() === messageDate.toDateString()) {
      return messageDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else {
      return messageDate.toLocaleDateString([], {month: 'short', day: 'numeric'}) + ', ' + 
             messageDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if(!typing){
      setTyping(true);
      onTyping(true);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      onTyping(false);
    }, 2000);
  };

  const checkUsersTyping = () => {
    const typingUserIds = Object.entries(typingUsers)
      .filter(([userId, isTyping]) => isTyping && userId !== currentUserId)
      .map(([userId]) => userId);
   
    return typingUserIds.length > 0 ? true : false;
  }

  const getTypingUsersText = () => {
    const typingUserIds = Object.entries(typingUsers)
      .filter(([userId, isTyping]) => isTyping && userId !== currentUserId)
      .map(([userId]) => userId);

    if (typingUserIds.length === 0) return null;

    if(group.type === 'private'){
      return '';
    }

    const typingUserNames = typingUserIds
      .map(userId => {
        const member = userMap[userId];
        return member ? member.name?.split(' ')[0] : 'Someone';
      });

    if (typingUserNames.length === 1) {
      return `${typingUserNames[0]} is typing`;
    } else if (typingUserNames.length === 2) {
      return `${typingUserNames[0]} and ${typingUserNames[1]} are typing`;
    } else {
      return 'Several people are typing';
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      console.log("deleting message", messageId);
      await deleteChatMessage(messageId);
      setShowMenuForMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessageId(message.id);
    setEditingMessageContent(message.content);
    setShowMenuForMessage(null);
  };

  const handleSaveEdit = async (messageId) => {
    if (editingMessageContent.trim()) {
      try {
        await editChatMessage(messageId, editingMessageContent.trim());
        setEditingMessageId(null);
        setEditingMessageContent('');
      } catch (error) {
        console.error('Error editing message:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingMessageContent('');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && 
          !menuRef.current.contains(event.target) && 
          (!menuOptionsRef.current || !menuOptionsRef.current.contains(event.target))) {
        setShowMenuForMessage(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if(!group) return ;

  return (
    <ChatContainer>
      <MessageList ref={messageListRef}>
        {messages.map((message, index) => (
          <MessageContainer key={index}>
            {/* Timestamp appears on hover */} 
            {message.sender_id === currentUserId && editingMessageId !== message.id && (
              <CurrentUserTimeStamp>
                {formatMessageTimestamp(message.timestamp)}
              </CurrentUserTimeStamp>
            )}
            {/* Persistent edited indicator */} 
            {message.sender_id === currentUserId && message.is_edited && (
              <EditedIndicator>
                <span title="edited">
                  <MdEdit />
                </span>
              </EditedIndicator>
            )}
            <MessageItem 
              isCurrentUser={message.sender_id === currentUserId}
              isEditing={editingMessageId === message.id}
            >
              {message.sender_id !== currentUserId && (
                <ProfilePic
                  src={userMap[message.sender_id]?.profile_pic || 'https://i.pravatar.cc/40'}
                  alt={userMap[message.sender_id]?.name.split(' ').map((n) => n[0]).join('')}
                />
              )}
              
              <MessageContent>
                {message.sender_id !== currentUserId && (
                  <SenderName isCurrentUser={message.sender_id === currentUserId}>
                    {userMap[message.sender_id]?.name}
                    <OtherUserTimeStamp>
                      {formatMessageTimestamp(message.timestamp)}
                      {/* Re-add edited indicator for other users */} 
                      {message.is_edited && 
                        <span style={{ fontSize: '0.65rem', marginLeft: '4px', verticalAlign: 'top' }} title="edited">
                          <MdEdit />
                        </span>}
                    </OtherUserTimeStamp>
                  </SenderName>
                )}
                
                {editingMessageId === message.id ? (
                  <EditContainer>
                    <EditTextArea
                      value={editingMessageContent}
                      onChange={(e) => setEditingMessageContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSaveEdit(message.id);
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      autoFocus
                      rows={Math.max(1, Math.min(6, editingMessageContent.split('\n').length))}
                    />
                    <EditActions>
                      <EditButton onClick={() => handleSaveEdit(message.id)}>Save</EditButton>
                      <EditButton onClick={handleCancelEdit}>Cancel</EditButton>
                    </EditActions>
                  </EditContainer>
                ) : (
                  <MessageText>{message.content}</MessageText>
                )}
              </MessageContent>

              {message.sender_id === currentUserId && !editingMessageId && (
                <MessageMenu ref={menuRef}>
                  <BsThreeDots onClick={() => setShowMenuForMessage(showMenuForMessage === message.id ? null : message.id)} />
                  {showMenuForMessage === message.id && (
                    <MessageMenuOptions ref={menuOptionsRef}>
                      {(!message.content.startsWith('/ai') && (Date.now() - new Date(message.timestamp).getTime()) <= 120000) && (
                        <MenuOption onClick={() => handleEditMessage(message)}>Edit</MenuOption>
                      )}
                      <MenuOption onClick={() => handleDeleteMessage(message.id)}>Delete</MenuOption>
                    </MessageMenuOptions>
                  )}
                </MessageMenu>
              )}
            </MessageItem>
          </MessageContainer>
        ))}
        <div ref={messageEndRef} />
      </MessageList>
      
      {checkUsersTyping() && (
        <TypingIndicator>
          <span>{getTypingUsersText()}</span>
          <TypingAnimation>
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </TypingAnimation>
        </TypingIndicator>
      )}

      <InputContainer>
        <Input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown} 
          placeholder="Type a message..."
        />
        <SendButton onClick={handleSendMessage}><IoMdSend></IoMdSend></SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatBox;