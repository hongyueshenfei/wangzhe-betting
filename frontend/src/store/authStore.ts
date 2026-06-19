import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Try to restore from localStorage
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const token = storedToken || null;
  const user = storedUser ? JSON.parse(storedUser) : null;

  return {
    token,
    user,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ADMIN',

    setAuth: (token: string, user: User) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({
        token,
        user,
        isAuthenticated: true,
        isAdmin: user.role === 'ADMIN',
      });
    },

    setUser: (user: User) => {
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAdmin: user.role === 'ADMIN' });
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isAdmin: false,
      });
    },
  };
});
