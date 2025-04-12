import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import colors from '../styles/colors';
import { IoMdSend } from 'react-icons/io';
import { BsThreeDots } from 'react-icons/bs';
import { deleteChatMessage } from '../api/sdk';

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
  background-color: ${(props) => (props.isCurrentUser ? colors.primary : '#2c2f33')};
  border-radius: 8px;
  color: ${(props) => (props.isCurrentUser ? colors.textPrimary : colors.textSecondary)};
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
  // background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(35,39,42,1) 100%);
  // padding: 8px 12px;
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

  // Reset the user scrolling flag after messages are loaded
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
        const message = {
          type: 'edit_message',
          message: {
            message_id: messageId,
            content: editingMessageContent.trim(),
            chat_id: group.id
          }
        };
        sendMessageWebSocket(message);
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

  // Close menu when clicking outside
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
            {message.sender_id === currentUserId && (
              <CurrentUserTimeStamp>
                {formatMessageTimestamp(message.timestamp)}
              </CurrentUserTimeStamp>
            )}
            <MessageItem isCurrentUser={message.sender_id === currentUserId}>
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
                    </OtherUserTimeStamp>
                  </SenderName>
                )}
                
                {editingMessageId === message.id ? (
                  <div>
                    <Input
                      type="text"
                      value={editingMessageContent}
                      onChange={(e) => setEditingMessageContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(message.id);
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button onClick={() => handleSaveEdit(message.id)}>Save</button>
                      <button onClick={handleCancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <MessageText>{message.content}</MessageText>
                )}
              </MessageContent>

              {message.sender_id === currentUserId && (
                <MessageMenu ref={menuRef}>
                  <BsThreeDots onClick={() => setShowMenuForMessage(showMenuForMessage === message.id ? null : message.id)} />
                  {showMenuForMessage === message.id && (
                    <MessageMenuOptions ref={menuOptionsRef}>
                      {/* <MenuOption onClick={() => handleEditMessage(message)}>Edit</MenuOption> */}
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

      {/* <TypingIndicator>
          <span>{"Cool is typing"}</span>
          <TypingAnimation>
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </TypingAnimation>
        </TypingIndicator> */}
      
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