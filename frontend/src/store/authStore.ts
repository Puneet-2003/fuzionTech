import { create } from 'zustand';
import { User, AuthResponse } from '../types';
import { authAPI } from '../services/api';

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  signup: (data: { name: string; email: string; password: string }) => Promise<User>;
  login: (data: { email: string; password: string }) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  initializeAuth: () => {
    const token = localStorage.getItem('token');
    console.log('Initializing auth - token from localStorage:', token ? 'Present' : 'Missing');
    if (token) {
      set({ token });
    }
  },

  signup: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.signup(data);
      const { token, user } = response.data;
      
      console.log('Signup successful - storing token');
      localStorage.setItem('token', token);
      
      set({ user, token, loading: false });
      return user;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Signup failed';
      console.error('Signup error:', message);
      set({ error: message, loading: false });
      throw error;
    }
  },

  login: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.login(data);
      const { token, user } = response.data;
      
      console.log('Login successful - storing token');
      localStorage.setItem('token', token);
      
      set({ user, token, loading: false });
      return user;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      console.error('Login error:', message);
      set({ error: message, loading: false });
      throw error;
    }
  },

  logout: () => {
    console.log('Logging out - clearing token');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  setUser: (user) => set({ user })
}));