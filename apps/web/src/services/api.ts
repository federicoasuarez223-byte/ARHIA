import axios, { type AxiosError } from 'axios';

import { useAuthStore } from '@/store/auth.store';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

// Attach access token to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;

      if (!refreshPromise) {
        const { refreshToken, setAccessToken, logout } = useAuthStore.getState();

        refreshPromise = apiClient
          .post<{ accessToken: string }>('/api/auth/refresh', { refreshToken })
          .then((res) => {
            setAccessToken(res.data.accessToken);
            return res.data.accessToken;
          })
          .catch(() => {
            logout();
            return Promise.reject(new Error('Session expired'));
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;
      if (original) {
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      }
      return apiClient(original!);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
