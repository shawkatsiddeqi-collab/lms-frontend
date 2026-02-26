import api from './axiosInstance';

export const authApi = {
  // Auth routes - note the /auth prefix
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  
  // Profile routes (if you have them)
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  changePassword: (data) => api.patch('/auth/change-password', data),
};

export default authApi;