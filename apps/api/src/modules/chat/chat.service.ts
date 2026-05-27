import Anthropic from '@anthropic-ai/sdk';
import type { Prisma } from '@prisma/client';
import type { Response } from 'express';

import type {
  CreateThreadDto,
  SendMessageDto,
  ListThreadsDto,
  ListMessagesDto,
} from './chat.schemas';

import { prisma } from '@/config/database';
import { env } from '@/config/env';

export class ChatError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY || '' });

const MODE_SYSTEM_PROMPTS: Record<string, string> = {
  ASSISTANT: `Sos el asistente de ARHIA, una plataforma de gestión de recursos humanos para empresas argentinas.
Ayudás a los equipos de HR con consultas sobre empleados, políticas laborales, legislación laboral argentina (LCT, convenios colectivos), y buenas prácticas de RRHH.
Respondé siempre en español rioplatense, de forma clara y profesional.
Si no conocés la respuesta con certeza, indicalo claramente.`,

  ANALYTICS: `Sos un analista de datos de RRHH en ARHIA. Tu especialidad es interpretar métricas de empleados, identificar tendencias, y generar insights sobre la fuerza laboral.
Ayudás con análisis de rotación, ausentismo, performance, costos laborales y benchmarking.
Respondé en español rioplatense, con datos precisos y recomendaciones accionables.`,

  CONTRACTS: `Sos un experto en contratos laborales argentinos en ARHIA. Conocés en detalle la LCT (Ley de Contrato de Trabajo), los convenios colectivos, y las modalidades contractuales vigentes.
Ayudás a redactar, revisar e interpretar contratos de trabajo, adendas, y documentación laboral.
Respondé en español rioplatense. Aclará siempre que tus respuestas son orientativas y no reemplazan el asesoramiento legal profesional.`,

  RECRUITMENT: `Sos un especialista en reclutamiento y selección de personal en ARHIA. Dominás técnicas de sourcing, entrevistas por competencias, evaluación de candidatos y employer branding.
Ayudás con la creación de descripciones de puestos, preguntas de entrevista, evaluación de CVs y estrategias de atracción de talento.
Respondé en español rioplatense, con enfoque práctico y orientado a resultados.`,

  PERFORMANCE: `Sos un experto en gestión del desempeño y desarrollo organizacional en ARHIA. Conocés metodologías como OKRs, KPIs, feedback 360°, y planes de desarrollo individual.
Ayudás a diseñar evaluaciones de desempeño, identificar empleados en riesgo de burnout, y crear planes de mejora.
Respondé en español rioplatense, con enfoque constructivo y orientado al desarrollo.`,
};

const threadSelect = {
  id: true,
  title: true,
  mode: true,
  employeeId: true,
  metadata: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  messages: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    select: { content: true, role: true, createdAt: true },
  },
} satisfies Prisma.ChatThreadSelect;

export async function listThreads(companyId: string, userId: string, query: ListThreadsDto) {
  const { page, limit, mode } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ChatThreadWhereInput = { companyId, userId, isActive: true };
  if (mode) where.mode = mode;

  const [threads, total] = await Promise.all([
    prisma.chatThread.findMany({
      where,
      select: threadSelect,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.chatThread.count({ where }),
  ]);

  return { threads, total };
}

export async function createThread(companyId: string, userId: string, dto: CreateThreadDto) {
  const thread = await prisma.chatThread.create({
    data: {
      companyId,
      userId,
      title: dto.title,
      mode: dto.mode,
      employeeId: dto.employeeId,
      metadata: (dto.metadata ?? {}) as object,
    },
    select: threadSelect,
  });

  return thread;
}

export async function getThread(companyId: string, userId: string, threadId: string) {
  const thread = await prisma.chatThread.findFirst({
    where: { id: threadId, companyId, userId, isActive: true },
    select: threadSelect,
  });

  if (!thread) throw new ChatError('NOT_FOUND', 'Conversación no encontrada', 404);
  return thread;
}

export async function deleteThread(companyId: string, userId: string, threadId: string) {
  const thread = await prisma.chatThread.findFirst({
    where: { id: threadId, companyId, userId, isActive: true },
    select: { id: true },
  });

  if (!thread) throw new ChatError('NOT_FOUND', 'Conversación no encontrada', 404);

  await prisma.chatThread.update({
    where: { id: threadId },
    data: { isActive: false },
  });
}

export async function listMessages(
  companyId: string,
  userId: string,
  threadId: string,
  query: ListMessagesDto,
) {
  const thread = await prisma.chatThread.findFirst({
    where: { id: threadId, companyId, userId, isActive: true },
    select: { id: true },
  });
  if (!thread) throw new ChatError('NOT_FOUND', 'Conversación no encontrada', 404);

  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    prisma.chatMessage.findMany({
      where: { threadId, companyId },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
      select: {
        id: true,
        role: true,
        content: true,
        inputTokens: true,
        outputTokens: true,
        createdAt: true,
      },
    }),
    prisma.chatMessage.count({ where: { threadId, companyId } }),
  ]);

  return { messages, total };
}

export async function sendMessage(
  companyId: string,
  userId: string,
  threadId: string,
  dto: SendMessageDto,
  res: Response,
) {
  if (!env.ANTHROPIC_API_KEY) {
    throw new ChatError('AI_UNAVAILABLE', 'Servicio de IA no configurado', 503);
  }

  const thread = await prisma.chatThread.findFirst({
    where: { id: threadId, companyId, userId, isActive: true },
    select: { id: true, mode: true },
  });
  if (!thread) throw new ChatError('NOT_FOUND', 'Conversación no encontrada', 404);

  // Save user message
  await prisma.chatMessage.create({
    data: { companyId, threadId, role: 'USER', content: dto.content },
  });

  // Build conversation history for Claude
  const history = await prisma.chatMessage.findMany({
    where: { threadId, companyId, role: { in: ['USER', 'ASSISTANT'] } },
    orderBy: { createdAt: 'asc' },
    select: { role: true, content: true },
  });

  const messages: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role === 'USER' ? 'user' : 'assistant',
    content: m.content,
  }));

  const systemPrompt = MODE_SYSTEM_PROMPTS[thread.mode] ?? MODE_SYSTEM_PROMPTS['ASSISTANT'];

  if (dto.stream) {
    return streamResponse(companyId, threadId, systemPrompt, messages, res);
  }

  return regularResponse(companyId, threadId, systemPrompt, messages);
}

async function regularResponse(
  companyId: string,
  threadId: string,
  systemPrompt: string,
  messages: Anthropic.MessageParam[],
) {
  const response = await anthropic.messages.create({
    model: env.ANTHROPIC_MODEL,
    max_tokens: env.ANTHROPIC_MAX_TOKENS,
    system: systemPrompt,
    messages,
  });

  const assistantContent = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as Anthropic.TextBlock).text)
    .join('');

  const saved = await prisma.chatMessage.create({
    data: {
      companyId,
      threadId,
      role: 'ASSISTANT',
      content: assistantContent,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
    select: {
      id: true,
      role: true,
      content: true,
      inputTokens: true,
      outputTokens: true,
      createdAt: true,
    },
  });

  // Touch thread updatedAt
  await prisma.chatThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });

  return saved;
}

async function streamResponse(
  companyId: string,
  threadId: string,
  systemPrompt: string,
  messages: Anthropic.MessageParam[],
  res: Response,
) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const stream = anthropic.messages.stream({
    model: env.ANTHROPIC_MODEL,
    max_tokens: env.ANTHROPIC_MAX_TOKENS,
    system: systemPrompt,
    messages,
  });

  let fullContent = '';
  let inputTokens = 0;
  let outputTokens = 0;

  stream.on('text', (text) => {
    fullContent += text;
    res.write(`data: ${JSON.stringify({ type: 'delta', text })}\n\n`);
  });

  stream.on('finalMessage', async (msg) => {
    inputTokens = msg.usage.input_tokens;
    outputTokens = msg.usage.output_tokens;

    const saved = await prisma.chatMessage.create({
      data: {
        companyId,
        threadId,
        role: 'ASSISTANT',
        content: fullContent,
        inputTokens,
        outputTokens,
      },
      select: { id: true, createdAt: true },
    });

    await prisma.chatThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });

    res.write(
      `data: ${JSON.stringify({ type: 'done', messageId: saved.id, inputTokens, outputTokens })}\n\n`,
    );
    res.end();
  });

  stream.on('error', (err) => {
    res.write(
      `data: ${JSON.stringify({ type: 'error', message: 'Error al procesar la respuesta' })}\n\n`,
    );
    res.end();
    console.error('Anthropic stream error:', err);
  });

  // Return a sentinel so the controller knows streaming was initiated
  return null;
}
