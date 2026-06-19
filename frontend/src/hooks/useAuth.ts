import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

interface UseAuthReturn {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export function useAuth(): UseAuthReturn {
  const store = useAuthStore();

  return {
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    isAdmin: store.isAdmin,
    login: store.setAuth,
    logout: store.logout,
    setUser: store.setUser,
  };
}
