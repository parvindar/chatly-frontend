import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import styled, { css } from 'styled-components';
import colors from '../styles/colors';
import { IoMdSend } from 'react-icons/io';
import { BsThreeDots, BsEmojiSmile } from 'react-icons/bs';
import { MdEdit, MdOutlineAddReaction, MdAttachFile, MdClose } from 'react-icons/md';
import { deleteChatMessage, editChatMessage, addMessageReaction, deleteMessageReaction, uploadMedia, getMedia } from '../api/sdk';
import EmojiPicker, { Theme } from 'emoji-picker-react';

// Reusable CSS mixin for Emoji Picker styles (scrollbar, theme vars)
const emojiPickerStyles = css`
  /* Custom Scrollbar Styles & Theme Vars for Emoji Picker */
  .EmojiPickerReact {
    --epr-scrollbar-thumb-bg-color: #4A7BCC;
    --epr-scrollbar-track-bg-color: #2c2f33;
    --epr-search-input-bg-color: #23272a;
    --epr-search-input-placeholder-color: #72767d;
    --epr-search-input-color: #dcddde;
    --epr-category-label-bg-color: #36393f;

    --epr-emoji-size: 18px;
    --epr-emoji-gap: 4px;

    padding: 0px;
    height: 28px;
    border: none;
  }
  
  /* Fallback for browsers that don't support the CSS variables or for more specific styling if needed */
  .EmojiPickerReact ::-webkit-scrollbar {
    width: 8px;
  }

  .EmojiPickerReact ::-webkit-scrollbar-track {
    background: #2c2f33;
    border-radius: 4px;
  }

  .EmojiPickerReact ::-webkit-scrollbar-thumb {
    background: #4A7BCC;
    border-radius: 4px;
  }

  .EmojiPickerReact ::-webkit-scrollbar-thumb:hover {
    background: #3a66a1;
  }
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0px;
  position: relative;
  height: 100%;
`;

const CustomScrollbar = css`
  &::-webkit-scrollbar {
    height: 4px; /* Added height for horizontal scrollbars */
    width: 4px;
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

const MessageList = styled.div`
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  padding-right: 10px;
  margin-bottom: 60px;
  margin-bottom: ${(props) => (props.isAttachment ? '90px' : '60px')};
  &::-webkit-scrollbar {
    width: 4px;
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
  margin-bottom: ${(props) => (props.hasReactions ? '25px' : '10px')};
  padding: 10px;
  background-color: ${(props) =>
    props.isEditing ? '#2c2f33' : (props.isCurrentUser ?  colors.currentUserMessage : '#2c2f33')};
  border-radius: 8px;
  color: ${(props) => (props.isCurrentUser && !props.isEditing ? '#cccccc' : colors.textSecondary)};
  align-self: ${(props) => (props.isCurrentUser ? 'flex-end' : 'flex-start')};
  max-width: 100%;
  word-wrap: break-word;
  flex-direction: row;
  position: relative;

  &:hover {
    background-color: #16181C;
  }
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
  top: -6px;
  right: 32px;
  font-size: 0.6rem;
  color: #eee;
  background-color: #2c2f33;
  padding: 2px 4px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 2;
  
  ${MessageContainer}:hover & {
    opacity: 1;
  }
`;

const EditedIndicator = styled.span`
  position: absolute;
  top: 0px;
  right: 4px;
  font-size: 0.6rem;
  color: #ddd;
  padding: 1px 3px;
  border-radius: 3px;
  opacity: 1;
  transition: opacity 0.2s;
  z-index: 1;

  ${MessageContainer}:hover & {
    opacity: 0;
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
  padding-right: 80px;
  padding-left: 28px;
  position: relative;

  &:focus {
    outline: none;
  }
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

  &:disabled {
    background-color: #4e73df;
    opacity: 0.5;
    cursor: not-allowed;
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
  z-index: 3;
  
  ${MessageContainer}:hover & {
    opacity: 1;
  }
`;

const MessageMenuOptions = styled.div`
  position: absolute;
  right: 0;
  top: 32px;
  background-color: #2c2f33;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 50;
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

// New component for the emoji picker button
const EmojiButton = styled.button`
  position: absolute;
  right: 56px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  display: flex;
  align-items: center;

  &:hover {
    color: #dcddde;
  }
`;

// New styled component for the emoji picker container
const EmojiPickerContainer = styled.div`
  position: absolute;
  bottom: 65px;
  right: 10px;
  z-index: 100;
  // transform-origin: bottom right;

  ${emojiPickerStyles}
`;

// Styled component for the reaction trigger button
const ReactionButton = styled.button`
  position: absolute;
  top: -10px;
  right: ${(props) => (props.isCurrentUser ? '5px' : '5px')};
  left: ${(props) => (props.isCurrentUser ? 'auto' : 'auto')};
  background-color: #36393f;
  border: 1px solid #2c2f33;
  border-radius: 50%;
  color:rgb(226, 226, 226);
  cursor: pointer;
  font-size: 16px;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  z-index: 4;

  ${MessageItem}:hover & {
    opacity: 1;
  }

  &:hover {
    background-color: #40444b;
    color: #dcddde;
  }
`;

// Styled component to wrap and position the reaction emoji picker
const ReactionPickerWrapper = styled.div`
  position: absolute;
  bottom: 80%;
  margin-bottom: 0px;
  top: -8px;
  right: 5px;
  z-index: 20;
  // transform: scale(0.8); // Removed scaling to improve sharpness
  // transform-origin: ${(props) => (props.isCurrentUser ? 'bottom left' : 'bottom right')}; // Removed associated origin

  ${emojiPickerStyles} // Apply the mixin
`;

// Container for displaying reactions below the message content
const ReactionsContainer = styled.div`
  position: absolute;
  bottom: -18px;
  left: 8px;
  z-index: 5;
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  background-color: #23272a;
  padding: 3px 5px;
  border-radius: 15px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
`;

// Individual reaction chip (emoji + count)
const ReactionChip = styled.div`
  background-color: ${(props) => (props.reactedByMe ? '#4A7BCC' : '#36393f')};
  border: none;
  color: ${(props) => (props.reactedByMe ? '#ffffff' : '#dcddde')};
  border-radius: 10px;
  padding: 1px 5px;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.reactedByMe ? '#3a66a1' : '#40444b')};
  }

  span:first-child {
    font-size: 13px;
  }
`;

// Add a new styled component for the attachment button
const AttachmentButton = styled.label`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  font-size: 18px;
  padding: 2px;
  display: flex;
  align-items: center;
  z-index: 100;
  &:hover {
    color: #dcddde;
  }

  input {
    display: none; // Hide the file input
  }
`;

// Styled component for the attachment list
const AttachmentList = styled.div`
  position: absolute;
  bottom: 46px;
  display: flex;
  overflow-x: auto; /* Enable horizontal scrolling */
  background-color: #23272a;
  border-radius: 8px 8px 0 0;
  padding: 10px;
  align-self: center;
  width: auto;
  left : 10px;
  right: 10px;
  z-index: 10;
  white-space: nowrap; /* Prevent line breaks */
  padding-bottom: 10px;
  gap: 8px;
  ${CustomScrollbar}
`;

// Add a styled component for the loader
const Loader = styled.div`
  border: 2px solid #c1c1c1; /* Light grey */
  border-top: 2px solid ${colors.primary}; /* Blue */
  border-radius: 50%;
  width: 12px;
  height: 12px;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Styled component for each attachment item
const AttachmentInputItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-radius: 8px;
  // margin: 10px;
  cursor: pointer;
  background-color:rgb(62, 67, 71);
  font-size: 12px;
  &:hover {
    background-color: #40444b;
  }

  span {
    color: #dcddde;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: ${(props) => (props.loading ? '0.5' : '1')};
  }

  button {
    background: none;
    border: none;
    color: #dddddd;
    cursor: pointer;
    font-size: 12px;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    margin-left: 2px;
    margin-right: -6px;
    &:hover {
      color: #ff3b3b;
    }
  }
`;

// New styled component for message attachments
const MessageAttachments = styled.div`    
  display: flex;
  flex-direction: column; /* Stack attachments vertically */
  margin-top: 4px; /* Add some space above the attachments */
`;

const ImageAttachmentItem = styled.div`
  // display: flex;
  // align-items: center;
  // justify-content: center;
  margin-top: 8px;
   
  img {
    max-width: 250px;
    max-height: 250px;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  }
`;

const AttachmentItem = styled.div`
  // display: flex;
  // justify-content: space-between;
  // align-items: center;
  padding: 8px 10px;
  margin-top: 10px;
  border-radius: 8px;
  cursor: pointer;
  width: fit-content;
  white-space: nowrap;
  max-width: 100%;
  background-color:rgb(62, 67, 71);
  font-size: 12px;
  &:hover {
    // background-color: #40444b;
  }

  span {
    color: #dcddde;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  img {
    max-width: 250px;
    max-height: 250px;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  }
`;


const ImagePlaceholder = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 4px;
  background: #23272a; // Blurry background color
  backdrop-filter: blur(10px); // Apply blur effect
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dcddde; // Optional text color
  font-size: 16px; // Optional text size
`;

// Utility function to format file size
const formatFileSize = (size) => {
  if (size < 1024) return `${size} bytes`;
  else if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`; // 1024^1
  else return `${(size / 1048576).toFixed(2)} MB`; // 1024^2
};

const ChatBox = ({ group, messages, onSendMessage, typingUsers = {}, onTyping, groupMembers = [], userMap = {}, fetchMessages = () => {}, hasMoreMessages = true, handleNewMessage, handleReaction, newMessageCount }) => {
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageContent, setEditingMessageContent] = useState('');
  const [showMenuForMessage, setShowMenuForMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPickerForMessage, setShowReactionPickerForMessage] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const currentUserId = localStorage.getItem('user_id');
  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageListRef = useRef(null);
  const isUserScrolling = useRef(false);
  const menuRef = useRef(null);
  const menuOptionsRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const reactionPickerRef = useRef(null);
  const reactionButtonRef = useRef(null);

  const scrollToBottom = () => {
    if (!isUserScrolling.current) {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    console.log("newMessageCount", newMessageCount);
    scrollToBottom();
  }, [newMessageCount]);

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
  }, [messages, group]);



  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(async () => {
    const fetchImageUrls = async () => {
      const urls = {...imageUrls};
      for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i];
        if (message.attachments?.length > 0) {
          for (let j = 0; j < message.attachments.length; j++) {
            const attachment = message.attachments[j];
            if (attachment.type.startsWith('image/')) {
              if (urls[attachment.key]) {
                continue;
              }
              const response = await getMedia(attachment.key);
              const blob = new Blob([response], { type: attachment.type });
              urls[attachment.key] = URL.createObjectURL(blob);
              setImageUrls(prev => ({ ...prev, [attachment.key]: URL.createObjectURL(blob) }));
            }
          }
        }
      }
    };
    const _isUserScrolling = isUserScrolling?.current;
    await fetchImageUrls();
    if(!_isUserScrolling){
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    isUserScrolling.current = false;
  }, [newMessageCount]);

  const checkValidAttachments = () => {
    for(const attachment of attachments){
      if(!attachment.key){
        return false;
      }
    }
    return true;
  }

  const handleSendMessage = async () => {
    if (input.trim()) {
      try {
        if(!checkValidAttachments()){
          return;
        }
        const newMessage = {
          sender_id: currentUserId,
          sender_info: {
            name: '',
          },
          content: input.trim(),
          attachments: attachments,
          chat_id: group.id,
          timestamp: new Date().toISOString(),
        };
        onSendMessage(newMessage);
        handleNewMessage(newMessage, true);
        setAttachments([]);
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

      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }

      if (
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(event.target) &&
        !event.target.closest('[data-reaction-button="true"]') 
      ) {
          setShowReactionPickerForMessage(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  

  const handleEmojiClick = (emojiObject) => {
    setInput(prevInput => prevInput + emojiObject.emoji);
  };

  const toggleReactionPicker = (messageId) => {
    setShowReactionPickerForMessage(current => (current === messageId ? null : messageId));
  };

  const handleSelectReaction = async (messageId, emoji, isDelete = false) => {
    // Call the prop function passed from parent with chat_id, message_id, emoji
    handleReaction({chat_id: group.id, message_id: messageId, emoji, user_id: currentUserId, is_deleted: isDelete},true);

    if(isDelete){
      const res = await deleteMessageReaction(messageId, emoji); 
      if(!res.ok){
        handleReaction({chat_id: group.id, message_id: messageId, emoji, user_id: currentUserId, is_deleted: !isDelete},true);
      }
    }else{
      const res = await addMessageReaction(messageId, emoji); 
      if(!res.ok){
        handleReaction({chat_id: group.id, message_id: messageId, emoji, user_id: currentUserId, is_deleted: !isDelete},true);
      }
    }

    setShowReactionPickerForMessage(null); // Close the picker
  };

  const handleFileUpload = async (event) => {
    // handle multiple files
    const files = event.target.files;

    if(files.length + attachments.length > 10){
      alert("You can only upload up to 10 files at a time");
      return;
    }

    if (files.length > 0) {
      try {

        for(const file of files){
          if(file.size > 1024 * 1024 * 25){
            alert("File size must be less than 25MB");
            return;
          }
        }

        const oldAttachments = [...attachments];

        setAttachments(prev => [...prev, ...Array.from(files).map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
        }))]);

        const uploadedFiles = await Promise.all(Array.from(files).map(async (file) => {
          const uploadedFile = await uploadMedia(file);
          return uploadedFile;
        }));

        // attachment format : {key: 'file_key', name: 'file_name', type: 'file_type'}
        const _attachments = uploadedFiles.map((file) => ({
          key: file.file_key,
          name: file.file_name,
          type: file.file_type,
          size: file.file_size,
        }));
        setAttachments([...oldAttachments, ..._attachments]);
        // remove the files from the input
        event.target.value = '';
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleAttachmentClick = async (attachment) => {
    // download attachment through api
    if(imageUrls[attachment.key]){
      window.open(imageUrls[attachment.key], '_blank');
    }else{
      const response = await getMedia(attachment.key);
      const blob = new Blob([response], { type: attachment.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name; // Set the file name for download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    // remove the blob from the url
  };

  if(!group) return ;

  return (
    <ChatContainer>
      <MessageList ref={messageListRef} isAttachment={attachments.length > 0}>
        {messages.map((message, index) => (
          <MessageContainer key={index}>
            {message.sender_id === currentUserId && editingMessageId !== message.id && (
              <CurrentUserTimeStamp>
                {formatMessageTimestamp(message.timestamp)}
              </CurrentUserTimeStamp>
            )}
            {message.sender_id === currentUserId && message.is_edited && (
              <EditedIndicator>
                <span title="edited">
                  <MdEdit />
                </span>
              </EditedIndicator>
            )}


            {(showReactionPickerForMessage === message.id) && (
                <ReactionPickerWrapper 
                  ref={reactionPickerRef} 
                  isCurrentUser={message.sender_id === currentUserId}
                >
                  <EmojiPicker 
                    onEmojiClick={(emojiObject) => handleSelectReaction(message.id, emojiObject.emoji, message.reactions?.[emojiObject.emoji]?.me)}
                    theme={Theme.DARK}
                    emojiSize={12}
                    height={300}
                    width={250}
                    searchDisabled
                    previewConfig={{ showPreview: false }}
                    reactionsDefaultOpen={true}
                    lazyLoadEmojis={true}
                  />
                </ReactionPickerWrapper>
              )}

            <MessageItem 
              isCurrentUser={message.sender_id === currentUserId}
              isEditing={editingMessageId === message.id}
              hasReactions={message.reactions && Object.keys(message.reactions).length > 0}
              isLocal={!message.id}
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

                {/* Display Attachments Vertically */}
                {message.attachments && message.attachments.length > 0 && (
                  <MessageAttachments>
                    {message.attachments.map((attachment, index) => (
                      attachment.type.startsWith('image/') ? (
                  
                        <ImageAttachmentItem key={index}>
                          {imageUrls[attachment.key] ? (
                          <img
                            src={imageUrls[attachment.key]}
                            alt={attachment.name}
                            style={{ maxWidth: '250px', maxHeight: '250px', borderRadius: '4px' }}
                          />
                          ) : (
                            <ImagePlaceholder>
                              <Loader/>              
                            </ImagePlaceholder>
                          )}
                        </ImageAttachmentItem>
                        
                        ) : (
                          <AttachmentItem key={index} onClick={() => handleAttachmentClick(attachment)} >
                            <span 
                              title={attachment.name}
                          >
                            {attachment.name.length > 30 ? `${attachment.name.slice(0, 30)}...` : attachment.name}
                          </span>
                          <span style={{marginLeft: '4px'}}>{`(${formatFileSize(attachment.size)})`}</span>
                        </AttachmentItem>
                      )
                    ))}
                  </MessageAttachments>
                )}

                {/* Display Reactions - Handles object structure */} 
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                  <ReactionsContainer>
                    {Object.entries(message.reactions).map(([emoji, reactionData]) => (
                      <ReactionChip 
                        key={emoji} 
                        title={reactionData.users?.join('\n') || ''}
                        reactedByMe={reactionData.me}
                        onClick={() => handleSelectReaction(message.id, emoji, reactionData?.me)}
                      >
                        <span>{emoji}</span>
                        <span>{reactionData.count}</span>
                      </ReactionChip>
                    ))}
                  </ReactionsContainer>
                )}
              </MessageContent>

              {message.sender_id === currentUserId && !editingMessageId && (<>
                <MessageMenu ref={menuRef}>
                  <BsThreeDots onClick={() => setShowMenuForMessage(showMenuForMessage === message.id ? null : message.id)} />
                </MessageMenu>
                {showMenuForMessage === message.id && (
                  <MessageMenuOptions ref={menuOptionsRef}>
                    {(!message.content.startsWith('/ai') && (Date.now() - new Date(message.timestamp).getTime()) <= 120000) && (
                      <MenuOption onClick={() => handleEditMessage(message)}>Edit</MenuOption>
                    )}
                    <MenuOption onClick={() => handleDeleteMessage(message.id)}>Delete</MenuOption>
                  </MessageMenuOptions>
                )}
              </>)}

              {!editingMessageId && !showReactionPickerForMessage && (
                <ReactionButton 
                  onClick={(e) => { 
                    e.stopPropagation();
                    toggleReactionPicker(message.id);
                  }}
                  isCurrentUser={message.sender_id === currentUserId}
                  title="Add reaction"
                  data-reaction-button="true"
                  ref={reactionButtonRef}
                >
                  <MdOutlineAddReaction />
                </ReactionButton>
              )}

            </MessageItem>
          </MessageContainer>
        ))}
        <div ref={messageEndRef} />
      </MessageList>
      
      { checkUsersTyping() && (
        <TypingIndicator isAttachment = {attachments?.length > 0}>
          <span>{getTypingUsersText()}</span>
          <TypingAnimation>
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </TypingAnimation>
        </TypingIndicator>
      )}

      {attachments.length > 0 && (
        <AttachmentList>
          {attachments.map((attachment, index) => (
            <AttachmentInputItem loading={attachment.key ? false : true} key={index}>
              {!attachment.key && <Loader style={{ marginRight: '8px' }} />}
              <span onClick={() => handleAttachmentClick(attachment)}>{attachment.name}</span>
              <span style={{marginLeft: '4px'}}>{`(${formatFileSize(attachment.size)})`}</span>
              <button onClick={() => removeAttachment(index)}>
                <MdClose />
              </button>
            </AttachmentInputItem>
          ))}
        </AttachmentList>
      )}

      <InputContainer>
        <AttachmentButton>
          <MdAttachFile />
          <input type="file" accept="*" onChange={handleFileUpload} multiple />
        </AttachmentButton>
        {showEmojiPicker && (
          <EmojiPickerContainer ref={emojiPickerRef}>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={Theme.DARK}
              lazyLoadEmojis={true}
              height={300}
              width={250}
              searchDisabled
              previewConfig={{ showPreview: false }}
            />
          </EmojiPickerContainer>
        )}
        <Input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown} 
          placeholder="Type a message..."
        />
        <EmojiButton ref={emojiButtonRef} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          <BsEmojiSmile />
        </EmojiButton>
        <SendButton onClick={handleSendMessage} disabled={!checkValidAttachments() || !group?.id}><IoMdSend /></SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatBox;