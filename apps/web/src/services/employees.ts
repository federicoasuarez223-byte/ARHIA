import apiClient from './api';

export interface EmployeeListItem {
  id: string;
  legajo: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  position: string;
  seniority?: string;
  employmentStatus: string;
  contractType: string;
  hireDate: string;
  salary: number;
  currency: string;
  department: { id: string; name: string };
  riskScores: { level: string; overallScore: number }[];
}

export interface EmployeeStats {
  total: number;
  active: number;
  onLeave: number;
  terminated: number;
  newThisMonth: number;
  riskCritical: number;
  riskHigh: number;
  byDepartment: { name: string; count: number }[];
  byContractType: { type: string; count: number }[];
}

export interface ListEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: string;
  contractType?: string;
  riskLevel?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const employeesService = {
  async list(params: ListEmployeesParams = {}): Promise<ApiListResponse<EmployeeListItem>> {
    const { data } = await apiClient.get('/api/employees', { params });
    return data;
  },

  async getStats(): Promise<ApiResponse<EmployeeStats>> {
    const { data } = await apiClient.get('/api/employees/stats');
    return data;
  },

  async get(id: string) {
    const { data } = await apiClient.get(`/api/employees/${id}`);
    return data;
  },

  async delete(id: string) {
    const { data } = await apiClient.delete(`/api/employees/${id}`);
    return data;
  },
};
