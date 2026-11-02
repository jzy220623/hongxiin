import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const url = config.url || '';
  // Admin routes: only use admin token, never user token
  if (url.startsWith('/admin/')) {
    const adminToken = useAuthStore.getState().token;
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  } else if (url.startsWith('/members/') || url.startsWith('/registrations') || url.startsWith('/messages') || url.startsWith('/news') || url.startsWith('/events') || url.startsWith('/achievements')) {
    // These are admin-protected routes (POST/PUT/DELETE handled by adminAuth middleware)
    const adminToken = useAuthStore.getState().token;
    const userToken = useUserStore.getState().token;
    // For GET requests that both admin and user can access, use whichever token is available
    const token = adminToken || userToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else if (url.startsWith('/auth/')) {
    // User auth routes always use user token
    const userToken = useUserStore.getState().token;
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
  } else {
    // Default: use user token first, then admin token
    const userToken = useUserStore.getState().token;
    const adminToken = useAuthStore.getState().token;
    const token = userToken || adminToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Check if the request was for admin routes
      const url = error.config?.url || '';
      if (url.startsWith('/auth/')) {
        // User auth routes - clear user state and redirect to user login
        useUserStore.getState().logout();
        // Don't force redirect, let the page component handle it
      } else if (url.startsWith('/admin/') || error.response?.status === 403) {
        // Admin routes or 403 — clear admin state and redirect to admin login
        useAuthStore.getState().logout();
        window.location.href = '/admin/login';
      } else {
        // Admin routes - clear admin state and redirect to admin login
        useAuthStore.getState().logout();
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// News APIs
export const getNews = (params?: Record<string, unknown>) => api.get('/news', { params });
export const getNewsDetail = (id: number) => api.get(`/news/${id}`);
export const createNews = (data: FormData | Record<string, unknown>) => api.post('/news', data);
export const updateNews = (id: number, data: FormData | Record<string, unknown>) => api.put(`/news/${id}`, data);
export const deleteNews = (id: number) => api.delete(`/news/${id}`);
export const batchDeleteNews = (ids: number[]) => api.post('/news/batch-delete', { ids });

// Event APIs
export const getEvents = (params?: Record<string, unknown>) => api.get('/events', { params });
export const getEventDetail = (id: number) => api.get(`/events/${id}`);
export const createEvent = (data: FormData | Record<string, unknown>) => api.post('/events', data);
export const updateEvent = (id: number, data: FormData | Record<string, unknown>) => api.put(`/events/${id}`, data);
export const deleteEvent = (id: number) => api.delete(`/events/${id}`);
export const batchDeleteEvents = (ids: number[]) => api.post('/events/batch-delete', { ids });

// Achievement APIs
export const getAchievements = (params?: Record<string, unknown>) => api.get('/achievements', { params });
export const createAchievement = (data: FormData | Record<string, unknown>) => api.post('/achievements', data);
export const updateAchievement = (id: number, data: FormData | Record<string, unknown>) => api.put(`/achievements/${id}`, data);
export const deleteAchievement = (id: number) => api.delete(`/achievements/${id}`);

// Registration APIs
export const submitRegistration = (data: Record<string, unknown>) => api.post('/registrations', data);
export const submitJoin = (data: Record<string, unknown>) => api.post('/registrations/join', data);
export const checkinEvent = (eventId: number, data: Record<string, unknown>) => api.post(`/events/${eventId}/checkin`, data);
export const getRegistrations = (params?: Record<string, unknown>) => api.get('/registrations', { params });
export const updateRegistration = (id: number, data: Record<string, unknown>) => api.put(`/registrations/${id}`, data);
export const batchUpdateRegistrationStatus = (ids: number[], status: string) => api.post('/registrations/batch-status', { ids, status });
export const batchDeleteRegistrations = (ids: number[]) => api.post('/registrations/batch-delete', { ids });
export const getRegistrationFilters = () => api.get('/registrations/filters');

// Message APIs
export const getMessages = (params?: Record<string, unknown>) => api.get('/messages', { params });
export const createMessage = (data: Record<string, unknown>) => api.post('/messages', data);
export const replyMessage = (id: number, data: Record<string, unknown>) => api.put(`/messages/${id}`, data);
export const deleteMessage = (id: number) => api.delete(`/messages/${id}`);
export const batchDeleteMessages = (ids: number[]) => api.post('/messages/batch-delete', { ids });

// User Auth APIs
export const userRegister = (data: Record<string, unknown>) => api.post('/auth/register', data);
export const userLogin = (data: { username: string; password: string }) => api.post('/auth/login', data);
export const getUserProfile = () => api.get('/auth/me');
export const updateUserProfile = (data: Record<string, unknown>) => api.put('/auth/me', data);
export const changePassword = (data: { oldPassword: string; newPassword: string }) => api.put('/auth/password', data);
export const uploadAvatar = (data: FormData) => api.post('/auth/avatar', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const forgotPassword = (data: { username: string }) => api.post('/auth/forgot-password', data);
export const verifyAnswer = (data: { username: string; answer: string }) => api.post('/auth/verify-answer', data);
export const resetPassword = (data: { resetToken: string; newPassword: string }) => api.post('/auth/reset-password', data);
export const getRegistrationStatus = () => api.get('/auth/registration-status');

// Club Info & Dashboard APIs
export const getMembers = (params?: Record<string, unknown>) => api.get('/members', { params });
export const createCoreMember = (data: Record<string, unknown>) => api.post('/members', data);
export const updateCoreMember = (id: number, data: Record<string, unknown>) => api.put(`/members/${id}`, data);
export const deleteCoreMember = (id: number) => api.delete(`/members/${id}`);
export const batchDeleteCoreMembers = (ids: number[]) => api.post('/members/batch-delete', { ids });
export const getTimeline = () => api.get('/members/timeline');
export const getClubInfo = () => api.get('/members/club-info');
export const updateClubInfo = (data: FormData | Record<string, unknown>) => api.put('/members/club-info', data);
export const adminLogin = (data: { username: string; password: string }) => api.post('/admin/login', data);
export const getDashboard = () => api.get('/admin/dashboard');

// Member Import/Export APIs
export const importMembers = (data: FormData) =>
  api.post('/admin/members/import', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
export const exportMembers = () =>
  api.get('/admin/members/export', { responseType: 'blob' });

// Member Account APIs
export const getMemberAccount = (id: number) => api.get(`/admin/members/${id}/account`);
export const createMemberAccount = (id: number) => api.post(`/admin/members/${id}/create-account`);

// Image Upload API
export const uploadImage = (data: FormData) =>
  api.post('/admin/upload', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });

// Website Users API (admin)
export const getUsers = (params?: Record<string, unknown>) => api.get('/admin/users', { params });
export const updateUser = (id: number, data: Record<string, unknown>) => api.put(`/admin/users/${id}`, data);
export const deleteUser = (id: number) => api.delete(`/admin/users/${id}`);
export const batchDeleteUsers = (ids: number[]) => api.post('/admin/users/batch-delete', { ids });

// Club Members API (admin)
export const getClubMembers = (params?: Record<string, unknown>) => api.get('/admin/club-members', { params });
export const updateClubMember = (id: number, data: Record<string, unknown>) => api.put(`/admin/club-members/${id}`, data);
export const deleteClubMember = (id: number) => api.delete(`/admin/club-members/${id}`);
export const batchDeleteClubMembers = (ids: number[]) => api.post('/admin/club-members/batch-delete', { ids });
export const createClubMemberAccount = (id: number) => api.post(`/admin/club-members/${id}/create-account`);
export const getClubMemberFilters = () => api.get('/admin/club-members/filters');

// Honor Wall APIs
export const getHonorWall = () => api.get('/honor-wall');
export const getHonorWallAdmin = (params?: Record<string, unknown>) => api.get('/honor-wall/admin', { params });
export const createHonorMember = (data: Record<string, unknown>) => api.post('/honor-wall/admin', data);
export const updateHonorMember = (id: number, data: Record<string, unknown>) => api.put(`/honor-wall/admin/${id}`, data);
export const deleteHonorMember = (id: number) => api.delete(`/honor-wall/admin/${id}`);
export const batchDeleteHonorMembers = (ids: number[]) => api.post('/honor-wall/admin/batch-delete', { ids });
export const importHonorMembers = (data: FormData) =>
  api.post('/honor-wall/admin/import', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
export const batchSortHonorMembers = (items: { id: number; sort_order: number }[]) =>
  api.put('/honor-wall/admin/batch-sort', { items });

export default api;