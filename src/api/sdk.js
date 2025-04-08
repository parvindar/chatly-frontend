import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const APP_ID = process.env.REACT_APP_CHATLY_APP_ID || 'default-app-id';

// Axios client for /auth APIs
const authClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-app-id': APP_ID, // Add x-app-id header for auth APIs
  },
});

// Axios client for other APIs
const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// WebSocket setup
let socket = null;
const listeners = { chat: null, video_call: null };
let retryAttempts = 0; // Track the number of retry attempts
const maxRetryAttempts = 10; // Maximum number of retries
const retryInterval = 2000; // Initial retry interval in milliseconds

// Initialize WebSocket connection
export const initializeWebSocket = () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');

  socket = new WebSocket(`${API_URL.replace('http', 'ws')}/livechat?x-user-id=${userId}&x-token=${token}`);

  socket.onopen = () => {
    console.log('WebSocket connection established');
    retryAttempts = 0; // Reset retry attempts on successful connection
  };

  socket.onmessage = (event) => {
    let wsmessage;

    const messages = event.data.split('\n');

    for (const message of messages) {
      try {
        wsmessage = JSON.parse(message);
      } catch (e) {
        console.log('WebSocket message received:', message);
        console.log(e);
      }

      if (listeners[wsmessage.type]) {
        listeners[wsmessage.type](wsmessage.message);
      }
  }
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed');
    if (retryAttempts < maxRetryAttempts) {
      const delay = retryInterval * Math.pow(1.2, retryAttempts); // Exponential backoff
      console.log(`Retrying WebSocket connection in ${delay / 1000} seconds...`);
      setTimeout(() => {
        retryAttempts++;
        initializeWebSocket(); // Retry connection
      }, delay);
    } else {
      console.error('Max retry attempts reached. WebSocket connection failed.');
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
};

// Add a listener for incoming messages
export const addMessageListener = (type,listener) => {
  listeners[type] = listener;
};

// Remove a listener
export const removeMessageListener = (type,listener) => {
  listeners[type] = null;
  // const index = listeners.indexOf(listener);
  // if (index !== -1) {
  //   listeners.splice(index, 1);
  // }
};

// Send a message through WebSocket
export const sendMessageWebSocket = (message) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error('WebSocket is not connected');
  }
};

// Add interceptors to dynamically set headers for other APIs
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');

  if (token && userId) {
    config.headers['x-user-id'] = userId;
    config.headers['x-token'] = token;
    config.headers['x-app-id'] = APP_ID;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Login API
export const login = async (username, password) => {
  const response = await authClient.post('/auth/login', { user_id: username, password });
  // Save token and user_id to localStorage after login

  console.log('Login response:', response.data);
  console.log(response.data)
  localStorage.setItem('token', response.data.data.access_token);
  localStorage.setItem('user_id', response.data.data.id);
  localStorage.setItem('user', JSON.stringify(response.data.data));
  return response.data;
};

export const loginViaGoogle = async (idToken) => {
  const response = await authClient.post('/auth/login/g', { id_token: idToken });
  // Save token and user_id to localStorage after login

  console.log('Login response:', response.data);
  console.log(response.data)
  localStorage.setItem('token', response.data.data.access_token);
  localStorage.setItem('user_id', response.data.data.id);
  localStorage.setItem('user', JSON.stringify(response.data.data));
  return response.data;
};

// Register API
export const register = async ({ user_id, name, password }) => {
  const response = await authClient.post('/auth/register', { user_id, name, password });
  console.log('Register response:', response.data);

  return response.data;
};

export const getUsersList = async (searchQuery) => {
  const response = await apiClient.get(`/user/list?search=${searchQuery}`);
  return response.data.data;
};

export const createPrivateChat = async (userId) => {
  const response = await apiClient.post('/channel/dm', { user_id: userId });
  return response.data.data;
};

export const fetchPrivateChats = async (currentUserId) => {
  const response = await apiClient.get(`/channel/user-channels/dm?user_id=${currentUserId}`);
  return response.data.data;
};

export const getGroupMemberOptions = async (groupId,searchQuery) => {
  const response = await apiClient.get(`/user/options/${groupId}?search=${searchQuery}`);
  return response.data.data;
};

// Fetch Groups API
export const fetchGroups = async () => {
  const userId = localStorage.getItem('user_id');
  const response = await apiClient.get(`/channel/user-channels?user_id=${userId}`);
  return response.data.data;
};

export const fetchAllGroups = async () => {
  const userId = localStorage.getItem('user_id');
  const response = await apiClient.get(`/channel/all?user_id=${userId}`);
  return response.data.data;
};

export const createGroup = async (name, description, type = 'open') => {
  const response = await apiClient.post('/channel', { name, description, type });
  return response.data;
};

export const deleteChat = async (chatId) => {
  const response = await apiClient.delete(`/channel/${chatId}`);
  return response.data;
};

export const getGroupMembers = async (groupId) => {
  const response = await apiClient.get(`/channel/${groupId}/members`);
  return response.data.data;
};

export const addMemberInGroup = async (groupId, userId) => {
  const response = await apiClient.post(`/channel/${groupId}/members`, {
    chat_id: groupId,
    user_id: userId,
  });
  return response.data;
};

export const removeMemberFromGroup = async (groupId, userId) => {
  const response = await apiClient.delete(`/channel/${groupId}/members/${userId}`);
  return response.data;
};

export const makeMemberGroupAdmin = async (groupId, userId) => {
  const response = await apiClient.patch(`/channel/${groupId}/members/${userId}/make-admin`);
  return response.data;
};


// Send Message API
export const sendMessage = async (chatId, message) => {
  const response = await apiClient.post(`/chats/${chatId}/messages`, { message });
  return response.data;
};

// Receive Messages API
export const receiveMessages = async (chatId) => {
  try {
    const response = await apiClient.get(`/chats/${chatId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};