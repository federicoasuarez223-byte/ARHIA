import type { ChatMode } from './enums';

export interface ChatMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  mode: ChatMode;
  attachments?: ChatAttachment[];
  actions?: ChatAction[];
  isConfidential: boolean;
  createdAt: Date;
}

export interface ChatThread {
  id: string;
  userId: string;
  employeeId?: string;
  title?: string;
  mode: ChatMode;
  isConfidential: boolean;
  messageCount: number;
  lastMessageAt: Date;
  createdAt: Date;
}

export interface ChatAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  classification?: string;
}

export interface ChatAction {
  id: string;
  type: ChatActionType;
  label: string;
  description: string;
  requiresConfirmation: boolean;
  payload: Record<string, unknown>;
  status: 'pending' | 'confirmed' | 'rejected' | 'executed';
}

export type ChatActionType =
  | 'CREATE_CONTRACT'
  | 'APPROVE_VACATION'
  | 'REJECT_VACATION'
  | 'GENERATE_PAYSLIP'
  | 'SEND_NOTIFICATION'
  | 'UPDATE_RISK_SCORE'
  | 'SCHEDULE_INTERVIEW'
  | 'AFIP_REGISTRATION'
  | 'DOCUSIGN_SEND';

export interface ChatStreamRequest {
  message: string;
  threadId?: string;
  employeeId?: string;
  mode?: ChatMode;
  isConfidential?: boolean;
  attachmentIds?: string[];
}

export interface ChatStreamChunk {
  type: 'text' | 'action' | 'done' | 'error';
  content?: string;
  action?: ChatAction;
  threadId?: string;
  messageId?: string;
  error?: string;
}
