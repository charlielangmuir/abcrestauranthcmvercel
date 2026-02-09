import axios from 'axios';
import { supabase } from './supabaseClient';

// Create axios instance for Spring Boot API calls
const api = axios.create({
  baseURL: import.meta.env.VITE_SPRING_BOOT_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds for complex operations like scheduling
});

// Request interceptor - add Supabase JWT token to Spring Boot requests
api.interceptors.request.use(
  async (config) => {
    // Get current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - refresh or redirect to login
      console.error('Unauthorized request to Spring Boot');
      // Supabase auto-refreshes tokens, but if it fails, logout
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;