import { apiClient } from './client';
import { Task, PaginatedResponse, TaskStatus, Priority } from '../types';

export const tasksApi = {
  findAll: async (params?: { 
    projectId?: string; 
    assigneeId?: string; 
    status?: TaskStatus; 
    priority?: Priority;
    page?: number; 
    limit?: number;
  }) => {
    const { data } = await apiClient.get<PaginatedResponse<Task>>('/tasks', { params });
    return data;
  },

  findOne: async (id: string) => {
    const { data } = await apiClient.get<Task>(`/tasks/${id}`);
    return data;
  },

  create: async (taskData: Partial<Task>) => {
    const { data } = await apiClient.post<Task>('/tasks', taskData);
    return data;
  },

  update: async (id: string, taskData: Partial<Task>) => {
    const { data } = await apiClient.patch<Task>(`/tasks/${id}`, taskData);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
