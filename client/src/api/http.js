import axios from 'axios';
import { API_BASE_URL } from '../config/env';

export const http = axios.create({
  baseURL: API_BASE_URL,
});

export const getAuthHeaders = (token) => {
  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getErrorMessage = (
  error,
  fallback = 'Something went wrong. Please try again.'
) => {
  return error?.response?.data?.message || error?.message || fallback;
};
