import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Profile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; fullName: string; college?: string; targetRoleId?: string }) => Promise<void>;
  demoLogin: (role?: 'student' | 'admin') => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('smart_competency_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile);
    } catch (err) {
      console.warn('[AuthContext] Session expired or invalid token');
      api.clearToken();
      setToken(null);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [token, fetchCurrentUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      setProfile(res.profile);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: { email: string; password: string; fullName: string; college?: string; targetRoleId?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      setUser(res.user);
      setProfile(res.profile);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: 'student' | 'admin' = 'student') => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(role);
      setUser(res.user);
      setProfile(res.profile);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.clearToken();
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const p = await api.getProfile();
      setProfile(p);
    } catch (err) {
      console.error('[AuthContext] Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
