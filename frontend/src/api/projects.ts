import { apiClient } from './client';
import { Project, PaginatedResponse, ProjectStatus } from '../types';

export const projectsApi = {
  findAll: async (params?: { status?: ProjectStatus; page?: number; limit?: number }) => {
    const { data } = await apiClient.get<PaginatedResponse<Project>>('/projects', { params });
    return data;
  },

  findOne: async (id: string) => {
    const { data } = await apiClient.get<Project>(`/projects/${id}`);
    return data;
  },

  create: async (projectData: Partial<Project>) => {
    const { data } = await apiClient.post<Project>('/projects', projectData);
    return data;
  },

  update: async (id: string, projectData: Partial<Project>) => {
    const { data } = await apiClient.patch<Project>(`/projects/${id}`, projectData);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/projects/${id}`);
  },
};
