import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, getToken, setToken, removeToken } from './api';
import { User } from '../types';

const USER_KEY = '@maktab_user_profile';

interface AuthContextType {
  user: User | null;
  role: string | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = await getToken();
      const storedUser = await AsyncStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        setTokenState(storedToken);
        setUser(JSON.parse(storedUser));
        // Refresh profile in background
        api.auth
          .getProfile()
          .then((freshUser) => {
            setUser(freshUser);
            AsyncStorage.setItem(USER_KEY, JSON.stringify(freshUser));
          })
          .catch(() => {});
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { username: string; password: string }): Promise<User> => {
    const response = await api.auth.login(credentials);
    setTokenState(response.token);
    setUser(response.user);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
    return response.user;
  };

  const logout = async () => {
    await api.auth.logout();
    setTokenState(null);
    setUser(null);
    await AsyncStorage.removeItem(USER_KEY);
  };

  const refreshProfile = async () => {
    try {
      const freshUser = await api.auth.getProfile();
      setUser(freshUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(freshUser));
    } catch {
      // Ignore
    }
  };

  const role = user?.roles && user.roles.length > 0 ? user.roles[0] : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
