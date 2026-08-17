import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// We point to the local network or VPS URL
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor to attach token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token for request', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: async (pin) => {
    // Replace with real endpoint later
    // return api.post('/auth/pos-login', { pin });
    
    // Mock login for now
    if (pin === '1234') {
      await SecureStore.setItemAsync('userToken', 'mock-token-1234');
      return { success: true, token: 'mock-token-1234' };
    }
    throw new Error('Invalid PIN');
  },
  
  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
  }
};
