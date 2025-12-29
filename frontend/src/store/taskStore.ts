import { create } from 'zustand';
import type { Task, Activity, PaginatedResponse } from '../types';
import { tasksAPI } from '../services/api';

interface TaskPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface TaskStore {
  tasks: Task[];
  currentTask: Task | null;
  activities: Activity[];
  loading: boolean;
  error: string | null;
  pagination: TaskPagination;
  fetchTasks: (projectId: string, page?: number) => Promise<void>;
  createTask: (projectId: string, data: { title: string; description?: string; priority?: string }) => Promise<Task>;
  updateTask: (taskId: string, data: Partial<Task>) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  fetchActivities: (taskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  currentTask: null,
  activities: [],
  loading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },

  fetchTasks: async (projectId, page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await tasksAPI.getByProject(projectId, page, 20);
      set({
        tasks: response.data.data,
        pagination: response.data.pagination,
        loading: false
      });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch tasks', loading: false });
    }
  },

  createTask: async (projectId, data) => {
    try {
      const response = await tasksAPI.create(projectId, data);
      set((state) => ({
        tasks: [response.data, ...state.tasks]
      }));
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to create task' });
      throw error;
    }
  },

  updateTask: async (taskId, data) => {
    try {
    
      set((state) => ({
        tasks: state.tasks.map(t => t._id === taskId ? { ...t, ...data } : t),
        currentTask: state.currentTask?._id === taskId
          ? { ...state.currentTask, ...data }
          : state.currentTask
      }));

      const response = await tasksAPI.update(taskId, data);

      set((state) => ({
        tasks: state.tasks.map(t => t._id === taskId ? response.data : t),
        currentTask: state.currentTask?._id === taskId ? response.data : state.currentTask
      }));

      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to update task' });
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    try {
      await tasksAPI.delete(taskId);
      set((state) => ({
        tasks: state.tasks.filter(t => t._id !== taskId)
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to delete task' });
      throw error;
    }
  },

  fetchActivities: async (taskId) => {
    try {
      const response = await tasksAPI.getActivity(taskId);
      set({ activities: response.data });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch activities' });
    }
  }
}));