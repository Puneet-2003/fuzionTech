

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  AuthResponse,
  PaginatedResponse,
  Project,
  Task,
  Activity,
  ApiError
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token ? 'Present' : 'Missing');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization header set:', config.headers.Authorization);
  } else {
    console.warn('No token found in localStorage');
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      console.log('Unauthorized - clearing token and redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const projectsAPI = {
  create: (data: { name: string; description?: string }) =>
    api.post<Project>('/projects', data),
  getAll: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<Project>>(`/projects?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get<Project>(`/projects/${id}`),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.patch<Project>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  inviteMember: (projectId: string, email: string) =>
    api.post<Project>(`/projects/${projectId}/members`, { email }),
  removeMember: (projectId: string, memberId: string) =>
    api.delete<Project>(`/projects/${projectId}/members/${memberId}`)
};


export const tasksAPI = {
  create: (projectId: string, data: { title: string; description?: string; priority?: string }) =>
    api.post<Task>(`/projects/${projectId}/tasks`, data),
  
  getByProject: (projectId: string, page = 1, limit = 20) =>
    api.get<PaginatedResponse<Task>>(`/projects/${projectId}/tasks?page=${page}&limit=${limit}`),
  
  getById: (id: string) => api.get<Task>(`/tasks/${id}`),
  
  update: (id: string, data: Partial<Task>) =>
    api.patch<Task>(`/tasks/${id}`, data),
  
  delete: (id: string) => api.delete(`/tasks/${id}`),
  
  getActivity: (taskId: string) => api.get<Activity[]>(`/tasks/${taskId}/activity`)
};

export default api;