import apiClient from './api';

import { useAuthStore } from '@/store/auth.store';

export type ChatMode = 'ASSISTANT' | 'ANALYTICS' | 'CONTRACTS' | 'RECRUITMENT' | 'PERFORMANCE';

export interface ChatThread {
  id: string;
  title?: string;
  mode: ChatMode;
  employeeId?: string;
  metadata: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  messages: { content: string; role: string; createdAt: string }[];
}

export interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  inputTokens?: number;
  outputTokens?: number;
  createdAt: string;
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

export const chatService = {
  async listThreads(params?: { page?: number; limit?: number; mode?: ChatMode }) {
    const { data } = await apiClient.get<ApiListResponse<ChatThread>>('/api/chat/threads', {
      params,
    });
    return data;
  },

  async createThread(body: { title?: string; mode?: ChatMode; employeeId?: string }) {
    const { data } = await apiClient.post<ApiResponse<ChatThread>>('/api/chat/threads', body);
    return data;
  },

  async getThread(threadId: string) {
    const { data } = await apiClient.get<ApiResponse<ChatThread>>(`/api/chat/threads/${threadId}`);
    return data;
  },

  async deleteThread(threadId: string) {
    const { data } = await apiClient.delete(`/api/chat/threads/${threadId}`);
    return data;
  },

  async listMessages(threadId: string, params?: { page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiListResponse<ChatMessage>>(
      `/api/chat/threads/${threadId}/messages`,
      { params },
    );
    return data;
  },

  async sendMessage(threadId: string, content: string) {
    const { data } = await apiClient.post<ApiResponse<ChatMessage>>(
      `/api/chat/threads/${threadId}/messages`,
      { content, stream: false },
    );
    return data;
  },

  streamMessage(
    threadId: string,
    content: string,
    onDelta: (text: string) => void,
    onDone: (messageId: string) => void,
    onError: (msg: string) => void,
  ): () => void {
    const token = useAuthStore.getState().accessToken;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const ctrl = new AbortController();

    fetch(`${baseUrl}/api/chat/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content, stream: true }),
      signal: ctrl.signal,
    })
      .then(async (res) => {
        if (!res.ok || !res.body) {
          onError('Error al conectar con el servidor');
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const evt = JSON.parse(line.slice(6)) as {
                type: string;
                text?: string;
                messageId?: string;
                message?: string;
              };
              if (evt.type === 'delta' && evt.text) onDelta(evt.text);
              else if (evt.type === 'done' && evt.messageId) onDone(evt.messageId);
              else if (evt.type === 'error') onError(evt.message ?? 'Error desconocido');
            } catch {
              // skip malformed lines
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') onError('Conexión interrumpida');
      });

    return () => ctrl.abort();
  },
};
