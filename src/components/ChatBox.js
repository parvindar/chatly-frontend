import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import colors from '../styles/colors';
import { IoMdSend } from 'react-icons/io';

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

const ChatBox = ({ group, messages, addNewMessage }) => {
  const [input, setInput] = useState('');
  const currentUserId = localStorage.getItem('user_id');
  const messageEndRef = useRef(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        addNewMessage(newMessage);
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
      <InputContainer>
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown} 
          placeholder="Type a message..."
        />
        <SendButton onClick={handleSendMessage}><IoMdSend></IoMdSend></SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatBox;