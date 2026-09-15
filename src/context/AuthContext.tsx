import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api, getStoredToken, setStoredToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  quickLoginAs: (role: Role) => Promise<void>;
  hasPermission: (module: string, action?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadMe() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get<{ user: User }>('/auth/me');
        setUser(res.user);
      } catch (err) {
        console.warn('Failed to restore session:', err);
        setStoredToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadMe();
  }, [token]);

  const login = async (username: string, password: string): Promise<User> => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { username, password });
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    try {
      api.post('/auth/logout');
    } catch (_) {}
    setStoredToken(null);
    setToken(null);
    setUser(null);
  };

  const quickLoginAs = async (role: Role) => {
    const credentialsMap: Record<Role, { u: string; p: string }> = {
      'SUPER ADMIN': { u: 'admin', p: 'admin123' },
      'HR / ADMIN': { u: 'priya_hr', p: 'hr123' },
      'ACCOUNTS': { u: 'kavitha_accounts', p: 'accounts123' },
      'MANAGER': { u: 'arun_lead', p: 'manager123' },
      'EMPLOYEE': { u: 'rahul_dev', p: 'emp123' },
    };
    const cred = credentialsMap[role];
    if (cred) {
      await login(cred.u, cred.p);
    }
  };

  const hasPermission = (module: string, action: string = 'view'): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER ADMIN') return true;

    if (user.role === 'HR / ADMIN') {
      return ['Dashboard', 'Employees', 'Attendance', 'Leave', 'Reports', 'Settings'].includes(module);
    }
    if (user.role === 'ACCOUNTS') {
      return ['Dashboard', 'Accounts', 'Salary', 'Expenses', 'Payments', 'Invoices', 'Reports'].includes(module);
    }
    if (user.role === 'MANAGER') {
      return ['Dashboard', 'Employees', 'Attendance', 'Leave', 'Reports'].includes(module);
    }
    if (user.role === 'EMPLOYEE') {
      return ['Dashboard', 'Attendance', 'Leave', 'Salary'].includes(module);
    }

    return false;
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, quickLoginAs, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
