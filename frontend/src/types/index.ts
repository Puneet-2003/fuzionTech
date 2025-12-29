export type status = 'BACKLOG' | 'INPROGRESS' | 'REVIEW' | 'DONE';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: User;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'BACKLOG' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignee: User | null;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  projectId: string;
  taskId: string;
  action: 'task_created' | 'status_changed' | 'assignee_changed' | 'priority_changed';
  from?: string;
  to?: string;
  changedBy: User;
  timestamp: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  error: string;
  details?: unknown;
}

