import { z } from 'zod';

const chatModeEnum = z.enum(['ASSISTANT', 'ANALYTICS', 'CONTRACTS', 'RECRUITMENT', 'PERFORMANCE']);

export const createThreadSchema = z.object({
  title: z.string().max(200).optional(),
  mode: chatModeEnum.default('ASSISTANT'),
  employeeId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Mensaje requerido').max(10000, 'Mensaje demasiado largo'),
  stream: z.boolean().default(false),
});

export const listThreadsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  mode: chatModeEnum.optional(),
});

export const listMessagesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type CreateThreadDto = z.infer<typeof createThreadSchema>;
export type SendMessageDto = z.infer<typeof sendMessageSchema>;
export type ListThreadsDto = z.infer<typeof listThreadsSchema>;
export type ListMessagesDto = z.infer<typeof listMessagesSchema>;
