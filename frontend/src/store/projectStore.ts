import { create } from 'zustand';
import type { Project, PaginatedResponse } from '../types';
import { projectsAPI } from '../services/api';

interface ProjectPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  pagination: ProjectPagination;
  fetchProjects: (page?: number) => Promise<void>;
  createProject: (data: { name: string; description?: string }) => Promise<Project>;
  setCurrentProject: (project: Project | null) => void;
  inviteMember: (projectId: string, email: string) => Promise<Project>;
  removeMember: (projectId: string, memberId: string) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },

  fetchProjects: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await projectsAPI.getAll(page, 10);
      set({
        projects: response.data.data,
        pagination: response.data.pagination,
        loading: false
      });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch projects', loading: false });
    }
  },

  createProject: async (data) => {
    try {
      const response = await projectsAPI.create(data);
      set((state) => ({
        projects: [response.data, ...state.projects]
      }));
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to create project' });
      throw error;
    }
  },

  setCurrentProject: (project) => set({ currentProject: project }),

  inviteMember: async (projectId, email) => {
    try {
      const response = await projectsAPI.inviteMember(projectId, email);
      set({ currentProject: response.data });
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to invite member' });
      throw error;
    }
  },

  removeMember: async (projectId, memberId) => {
    try {
      const response = await projectsAPI.removeMember(projectId, memberId);
      set({ currentProject: response.data });
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to remove member' });
      throw error;
    }
  }

,
  deleteProject: async (projectId: string) => {
  await projectsAPI.delete(projectId);
  set((state) => ({
    projects: state.projects.filter(p => p._id !== projectId),
    currentProject: null,
  }));
},

}));
