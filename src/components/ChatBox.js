import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import colors from '../styles/colors';
import { IoMdSend } from 'react-icons/io';
import { BsThreeDots } from 'react-icons/bs';

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

const ChatBox = ({ group, messages, onSendMessage, typingUsers = {}, onTyping, groupMembers = [] }) => {
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const currentUserId = localStorage.getItem('user_id');
  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
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
        const member = groupMembers.find(m => m.id === userId);
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

  if(!group) return ;

  return (
    <ChatContainer>
      <MessageList>
        {messages.map((message, index) => (<MessageContainer key = {index}>
         
         {message.sender_id === currentUserId && (
           <CurrentUserTimeStamp>
             {formatMessageTimestamp(message.timestamp)}
           </CurrentUserTimeStamp>
         )}
          <MessageItem
            isCurrentUser={message.sender_id === currentUserId}
          >
            {message.sender_id !== currentUserId && (
              <ProfilePic
                src={message.sender_info.profile_pic || 'https://i.pravatar.cc/40'}
                alt={message.sender_info.name.split(' ').map((n) => n[0]).join('')}
              />
            )}
            
            <MessageContent>
         
              {message.sender_id !== currentUserId && (
                <SenderName isCurrentUser={message.sender_id === currentUserId}>
                  {message.sender_info.name}
                  <OtherUserTimeStamp>
                    {formatMessageTimestamp(message.timestamp)}
                  </OtherUserTimeStamp>
                </SenderName>
              )}
              
              <MessageText>{message.content}</MessageText>
              
            </MessageContent>
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