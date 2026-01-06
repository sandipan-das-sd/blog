import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                        refreshToken
                    });

                    const { token } = response.data.data;
                    localStorage.setItem('token', token);

                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data)
};

// Blog API
export const blogAPI = {
    getAll: (params) => api.get('/blogs', { params }),
    getById: (id) => api.get(`/blogs/${id}`),
    create: (data) => api.post('/blogs', data),
    update: (id, data) => api.put(`/blogs/${id}`, data),
    delete: (id) => api.delete(`/blogs/${id}`),
    getMyBlogs: (params) => api.get('/blogs/my/posts', { params }),
    getTrending: (params) => api.get('/blogs/trending', { params })
};

// Comment API
export const commentAPI = {
    getByPost: (postId, params) => api.get(`/comments/post/${postId}`, { params }),
    getById: (id) => api.get(`/comments/${id}`),
    create: (postId, data) => api.post(`/comments/post/${postId}`, data),
    update: (id, data) => api.put(`/comments/${id}`, data),
    delete: (id) => api.delete(`/comments/${id}`),
    getMyComments: (params) => api.get('/comments/my/comments', { params })
};

// Admin API
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (params) => api.get('/admin/users', { params }),
    getUserById: (id) => api.get(`/admin/users/${id}`),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getBlogs: (params) => api.get('/admin/blogs', { params }),
    deleteBlogPermanent: (id) => api.delete(`/admin/blogs/${id}/permanent`),
    getComments: (params) => api.get('/admin/comments', { params }),
    getActivityLogs: (params) => api.get('/admin/activity-logs', { params }),
    clearCache: () => api.post('/admin/cache/clear')
};

export default api;
