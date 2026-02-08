import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'chef';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      login: (email: string, password: string) => {
        // Mock login - просто создаём демо-пользователя
        const mockUser: User = {
          id: 1,
          name: 'Demo User',
          email: email,
          role: 'owner',
        };
        set({ user: mockUser, isAuthenticated: true });
      },
      
      register: (name: string, email: string, password: string) => {
        // Mock register
        const mockUser: User = {
          id: Date.now(),
          name: name,
          email: email,
          role: 'owner',
        };
        set({ user: mockUser, isAuthenticated: true });
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
