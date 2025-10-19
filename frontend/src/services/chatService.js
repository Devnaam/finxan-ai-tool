import api from './api';

export const sendMessage = async (message, sessionId) => {
  return api.post('/chat/message', { message, sessionId });
};

export const createNewSession = async () => {
  return api.post('/chat/session');
};

export const getChatHistory = async (sessionId) => {
  return api.get(`/chat/history/${sessionId}`);
};

export const deleteSession = async (sessionId) => {
  return api.delete(`/chat/session/${sessionId}`);
};
