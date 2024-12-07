import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,

  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        set({ isAuthenticated: true, user: response.data.user });
      }
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    localStorage.removeItem('token');
    set({ isAuthenticated: false, user: null });
  },

  signup: async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        name,
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        set({ isAuthenticated: true, user: response.data.user });
      }
    } catch (error) {
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      if (response.data.valid) {
        set({ isAuthenticated: true, user: response.data.user, isLoading: false });
      } else {
        localStorage.removeItem('token');
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('An error occurred:', error);
      localStorage.removeItem('token');
      set({ isAuthenticated: false, isLoading: false });
    }
  },
}));
