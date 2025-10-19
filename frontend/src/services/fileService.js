import api from './api';

export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      if (onProgress) onProgress(percentCompleted);
    },
  });
};

export const getUserFiles = async () => {
  return api.get('/files');
};

export const deleteFile = async (fileId) => {
  return api.delete(`/files/${fileId}`);
};

export const getFileById = async (fileId) => {
  return api.get(`/files/${fileId}`);
};
