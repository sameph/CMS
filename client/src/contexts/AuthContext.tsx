import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/clinic';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  React.useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error('unauthorized');
        const data = await r.json();
        setUser(data as User);
      })
      .catch(() => {
        localStorage.removeItem('auth_token');
        setUser(null);
      });
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data?.token && data?.user) {
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
