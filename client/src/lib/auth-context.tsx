'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginResponse } from '../types';
import { api } from './api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          // Attempt to fetch profile to verify token
          const profile = await api.auth.getProfile();
          setUser(profile);
        } catch (error) {
          console.error('Failed to verify token:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (data: LoginResponse) => {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    const roles = data.user?.roles || [];
    if (roles.includes('student')) {
      router.push('/portal/student');
    } else if (roles.includes('parent')) {
      router.push('/portal/parent');
    } else if (roles.includes('teacher') && !roles.includes('super_admin') && !roles.includes('admin') && !roles.includes('director') && !roles.includes('zavuch')) {
      router.push('/portal/teacher');
    } else {
      router.push('/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
