import { http } from './http';

export const registerUser = async ({ name, email, password, isCreator = false }) => {
  const response = await http.post('/auth/register', {
    name,
    email,
    password,
    isCreator,
  });
  return response.data;
};

export const loginUser = async ({ email, password }) => {
  const response = await http.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};
