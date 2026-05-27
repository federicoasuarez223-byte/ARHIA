import apiClient from './api';

export interface Department {
  id: string;
  name: string;
  code?: string;
  headCount?: number;
}

export const departmentsService = {
  async list(): Promise<{ success: boolean; data: Department[] }> {
    const { data } = await apiClient.get('/api/departments', { params: { limit: 100 } });
    return data;
  },
};
