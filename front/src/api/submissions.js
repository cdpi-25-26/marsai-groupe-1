import api from './config.js';

export const createSubmission = async (formData) => {
  const { data } = await api.post('/submissions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
  return data;
};

export const getSubmissions = async () => {
  const { data } = await api.get('/submissions');
  return data;
};
