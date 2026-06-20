import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Inject JWT token into headers if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle auth failures globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the user gets 401 Unauthorized
    if (error.response && error.response.status === 401) {
      const isLoginOrRegister = 
        error.config.url.includes('/auth/login') || 
        error.config.url.includes('/auth/register');
        
      if (!isLoginOrRegister) {
        console.warn('Unauthorized request, logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login if window exists
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  async register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.data.id,
        name: response.data.data.name,
        email: response.data.data.email
      }));
    }
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.data.id,
        name: response.data.data.name,
        email: response.data.data.email
      }));
    }
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

// Task management services
export const taskService = {
  async getTasks({ status = '', search = '', sortBy = 'newest', page = 1, limit = 6 }) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  async createTask(title, description, status) {
    const response = await api.post('/tasks', { title, description, status });
    return response.data;
  },

  async updateTaskStatus(id, status) {
    const response = await api.put(`/tasks/${id}`, { status });
    return response.data;
  },

  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/tasks/stats');
    return response.data;
  }
};

export default api;
