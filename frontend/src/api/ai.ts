import { apiClient } from './client';

export const aiApi = {
  query: async (data: { message: string; projectId?: string }) => {
    const response = await apiClient.post<{ reply: string; toolsUsed: string[]; traceId: string }>('/ai/query', data);
    return response.data;
  },

  getSummary: async (projectId: string) => {
    const response = await apiClient.get<{ reply: string; toolsUsed: string[]; traceId: string }>(`/ai/summary/${projectId}`);
    return response.data;
  },
};
