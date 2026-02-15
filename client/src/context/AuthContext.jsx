import React, { createContext, useContext, useState } from 'react';
import { loginUser, registerUser } from '../api/auth.api';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'bellcorp_auth';

const readAuthFromStorage = () => {
  try {
    const rawValue = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawValue) {
      const legacyUser = localStorage.getItem('user');
      const legacyToken = localStorage.getItem('token');
      if (legacyUser && legacyToken) {
        return {
          user: JSON.parse(legacyUser),
          token: legacyToken,
        };
      }
      return { user: null, token: '' };
    }

    const parsedValue = JSON.parse(rawValue);
    if (!parsedValue?.token || !parsedValue?.user) {
      return { user: null, token: '' };
    }

    return parsedValue;
  } catch {
    return { user: null, token: '' };
  }
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(readAuthFromStorage);

  const setSession = ({ user, token }) => {
    const nextAuthState = { user, token };
    setAuthState(nextAuthState);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuthState));
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  };

  const clearSession = () => {
    setAuthState({ user: null, token: '' });
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    setSession({
      user: response.user,
      token: response.token,
    });
    return response;
  };

  const register = async (payload) => {
    return registerUser(payload);
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        token: authState.token,
        isAuthenticated: Boolean(authState.token),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
