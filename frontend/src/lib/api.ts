import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true, // Crucial for sending/receiving httpOnly cookies
});

// Intercept responses to handle 401 Unauthorized for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If we get a 401 and haven't retried yet, and the error isn't coming from the refresh endpoint or login endpoint
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh' && originalRequest.url !== '/auth/login') {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh');
        // Once refreshed, retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is expired or invalid, user needs to login again.
        // The frontend AuthProvider will catch this by watching for global state or /me failing
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
