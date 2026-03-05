import api from './config.js';

export const getCategories = async () => {
  const { data } = await api.get('/categories');
  return data;
};
