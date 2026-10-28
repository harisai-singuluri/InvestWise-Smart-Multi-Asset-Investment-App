import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Account } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  account: Account | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccount: () => Promise<void>;
  resetDemoAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('investwise_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshAccount = async () => {
    try {
      const acc = await api.account.get();
      setAccount(acc);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUserData = async () => {
    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      await refreshAccount();
    } catch (err) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadUserData();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    localStorage.setItem('investwise_token', res.token);
    setToken(res.token);
    setUser(res.user);
    await refreshAccount();
  };

  const register = async (fullName: string, email: string, password: string) => {
    const res = await api.auth.register({ fullName, email, password });
    localStorage.setItem('investwise_token', res.token);
    setToken(res.token);
    setUser(res.user);
    await refreshAccount();
  };

  const logout = () => {
    localStorage.removeItem('investwise_token');
    setToken(null);
    setUser(null);
    setAccount(null);
  };

  const resetDemoAccount = async () => {
    const updated = await api.account.resetDemo();
    setAccount(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        account,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshAccount,
        resetDemoAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
