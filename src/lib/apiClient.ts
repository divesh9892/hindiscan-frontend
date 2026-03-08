import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

// Create a base Axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Custom hook that returns an authenticated Axios instance.
 * It automatically grabs your live Clerk JWT and attaches it to every request.
 */
export const useApiClient = () => {
  const { getToken } = useAuth();

  const authClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Intercept every request BEFORE it leaves the browser
  authClient.interceptors.request.use(async (config) => {
    try {
      // Ask Clerk for the cryptographic token
      const token = await getToken();
      
      // If the token exists, attach it as the Bearer lock
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error("Failed to attach Clerk token to request", error);
      return Promise.reject(error);
    }
  });

  return authClient;
};

export default apiClient;