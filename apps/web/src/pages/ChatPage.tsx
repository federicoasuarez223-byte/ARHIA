import { Button, cn } from '@arhia/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare, Plus, Send, Trash2, Bot, User, ChevronRight, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

import { chatService, type ChatThread, type ChatMode } from '@/services/chat';

const MODE_CONFIG: Record<
  ChatMode,
  { label: string; description: string; color: string; bg: string }
> = {
  ASSISTANT: {
    label: 'Asistente',
    description: 'Consultas generales de RRHH',
    color: 'text-navy-600',
    bg: 'bg-navy-50',
  },
  ANALYTICS: {
    label: 'Analytics',
    description: 'Análisis de datos y métricas',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  CONTRACTS: {
    label: 'Contratos',
    description: 'Asesoría en contratos laborales',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  RECRUITMENT: {
    label: 'Reclutamiento',
    description: 'Selección y búsqueda de talento',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  PERFORMANCE: {
    label: 'Performance',
    description: 'Gestión del desempeño',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
};

interface LocalMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  streaming?: boolean;
  createdAt: string;
}

function MessageBubble({ msg }: { msg: LocalMessage }) {
  const isUser = msg.role === 'USER';
  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-navy-900 text-white' : 'bg-gold-100 text-gold-700',
        )}
      >
        {isUser ? <User size={15} /> : <Bot size={15} />}
      </div>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-navy-900 rounded-tr-sm text-white'
            : 'border-border text-navy-800 rounded-tl-sm border bg-white shadow-sm',
        )}
      >
        {msg.streaming ? (
          <span>
            {msg.content}
            <span className="bg-gold-500 ml-0.5 inline-block h-3.5 w-0.5 animate-pulse" />
          </span>
        ) : (
          <span className="whitespace-pre-wrap">{msg.content}</span>
        )}
      </div>
    </div>
  );
}

function ThreadItem({
  thread,
  active,
  onClick,
}: {
  thread: ChatThread;
  active: boolean;
  onClick: () => void;
}) {
  const mode = MODE_CONFIG[thread.mode] ?? MODE_CONFIG.ASSISTANT;
  const lastMsg = thread.messages?.[0];

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-xl px-3 py-2.5 text-left transition-colors',
        active ? 'bg-navy-900 text-white' : 'hover:bg-surface-hover text-navy-700',
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            'mt-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium',
            active ? 'bg-white/20 text-white' : `${mode.bg} ${mode.color}`,
          )}
        >
          {mode.label}
        </span>
      </div>
      <p
        className={cn('mt-1 truncate text-sm font-medium', active ? 'text-white' : 'text-navy-800')}
      >
        {thread.title || 'Nueva conversación'}
      </p>
      {lastMsg && (
        <p className={cn('mt-0.5 truncate text-xs', active ? 'text-white/60' : 'text-navy-400')}>
          {lastMsg.content}
        </p>
      )}
      <p className={cn('mt-1 text-xs', active ? 'text-white/40' : 'text-navy-300')}>
        {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true, locale: es })}
      </p>
    </button>
  );
}

export function ChatPage() {
  const qc = useQueryClient();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [newMode, setNewMode] = useState<ChatMode>('ASSISTANT');
  const [showNewThread, setShowNewThread] = useState(false);
  const stopStreamRef = useRef<(() => void) | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load thread list
  const { data: threadsData, isLoading: threadsLoading } = useQuery({
    queryKey: ['chat-threads'],
    queryFn: () => chatService.listThreads({ limit: 30 }),
  });
  const threads = threadsData?.data ?? [];

  // Load messages when thread changes
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', activeThreadId],
    queryFn: () => chatService.listMessages(activeThreadId!, { limit: 100 }),
    enabled: !!activeThreadId,
  });

  useEffect(() => {
    if (messagesData) {
      setMessages(
        messagesData.data.map((m) => ({
          id: m.id,
          role: m.role as 'USER' | 'ASSISTANT',
          content: m.content,
          createdAt: m.createdAt,
        })),
      );
    }
  }, [messagesData]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create new thread
  const createThread = useMutation({
    mutationFn: (mode: ChatMode) => chatService.createThread({ mode }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['chat-threads'] });
      setActiveThreadId(res.data.id);
      setMessages([]);
      setShowNewThread(false);
    },
  });

  // Delete thread
  const deleteThread = useMutation({
    mutationFn: (id: string) => chatService.deleteThread(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['chat-threads'] });
      if (activeThreadId === id) {
        setActiveThreadId(null);
        setMessages([]);
      }
    },
  });

  const sendMessage = useCallback(() => {
    if (!input.trim() || !activeThreadId || isSending) return;

    const content = input.trim();
    setInput('');
    setIsSending(true);

    // Optimistic user message
    const userMsg: LocalMessage = {
      id: `tmp-user-${Date.now()}`,
      role: 'USER',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Streaming assistant placeholder
    const assistantId = `tmp-ai-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'ASSISTANT',
        content: '',
        streaming: true,
        createdAt: new Date().toISOString(),
      },
    ]);

    const stop = chatService.streamMessage(
      activeThreadId,
      content,
      (text) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + text } : m)),
        );
      },
      (messageId) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, id: messageId, streaming: false } : m)),
        );
        setIsSending(false);
        qc.invalidateQueries({ queryKey: ['chat-threads'] });
      },
      (_err) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: 'Error al generar la respuesta. Intentá de nuevo.',
                  streaming: false,
                }
              : m,
          ),
        );
        setIsSending(false);
      },
    );

    stopStreamRef.current = stop;
  }, [input, activeThreadId, isSending, qc]);

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <div className="animate-fade-in border-border flex h-[calc(100vh-112px)] overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* Sidebar — thread list */}
      <div className="border-border flex w-64 shrink-0 flex-col border-r">
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-gold-500" />
            <span className="text-navy-900 text-sm font-semibold">Chat ARHIA</span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowNewThread(true)}
            title="Nueva conversación"
          >
            <Plus size={16} />
          </Button>
        </div>

        {/* New thread form */}
        {showNewThread && (
          <div className="border-border border-b p-3">
            <p className="text-navy-500 mb-2 text-xs font-medium">Modo de asistente</p>
            <div className="space-y-1">
              {(Object.keys(MODE_CONFIG) as ChatMode[]).map((mode) => {
                const cfg = MODE_CONFIG[mode];
                return (
                  <button
                    key={mode}
                    onClick={() => setNewMode(mode)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors',
                      newMode === mode
                        ? 'bg-navy-900 text-white'
                        : 'hover:bg-surface-hover text-navy-700',
                    )}
                  >
                    <span className="font-medium">{cfg.label}</span>
                    <span className={cn('truncate text-xs opacity-60')}>{cfg.description}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex gap-2">
              <Button
                size="xs"
                variant="primary"
                onClick={() => createThread.mutate(newMode)}
                loading={createThread.isPending}
                className="flex-1"
              >
                Crear
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setShowNewThread(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto p-2">
          {threadsLoading ? (
            <div className="space-y-2 p-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface-hover h-16 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <MessageSquare size={24} className="text-navy-300" />
              <p className="text-navy-400 mt-2 text-xs">
                No hay conversaciones.
                <br />
                Creá una nueva.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {threads.map((thread) => (
                <div key={thread.id} className="group relative">
                  <ThreadItem
                    thread={thread}
                    active={thread.id === activeThreadId}
                    onClick={() => setActiveThreadId(thread.id)}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteThread.mutate(thread.id);
                    }}
                    className="text-navy-400 absolute right-2 top-2 hidden rounded p-1 hover:bg-red-50 hover:text-red-500 group-hover:flex"
                    title="Eliminar conversación"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      {!activeThreadId ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="bg-gold-100 flex h-16 w-16 items-center justify-center rounded-2xl">
            <Sparkles size={28} className="text-gold-600" />
          </div>
          <div>
            <h2 className="font-display text-navy-900 text-xl font-bold">Chat ARHIA</h2>
            <p className="text-navy-500 mt-1 max-w-xs text-sm">
              Tu asistente de inteligencia artificial para gestión de RRHH. Seleccioná una
              conversación o creá una nueva.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {(Object.keys(MODE_CONFIG) as ChatMode[]).map((mode) => {
              const cfg = MODE_CONFIG[mode];
              return (
                <button
                  key={mode}
                  onClick={() => {
                    setNewMode(mode);
                    createThread.mutate(mode);
                  }}
                  className={cn(
                    'border-border hover:border-navy-300 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
                    cfg.bg,
                    cfg.color,
                  )}
                >
                  <ChevronRight size={14} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Thread header */}
          <div className="border-border flex items-center gap-3 border-b px-5 py-3">
            {activeThread && (
              <>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    MODE_CONFIG[activeThread.mode]?.bg,
                    MODE_CONFIG[activeThread.mode]?.color,
                  )}
                >
                  {MODE_CONFIG[activeThread.mode]?.label}
                </span>
                <span className="text-navy-700 text-sm font-medium">
                  {activeThread.title || 'Conversación'}
                </span>
              </>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5">
            {messagesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={cn('flex gap-3', i % 2 === 0 && 'flex-row-reverse')}>
                    <div className="bg-surface-hover h-8 w-8 animate-pulse rounded-full" />
                    <div
                      className={cn(
                        'bg-surface-hover h-10 animate-pulse rounded-2xl',
                        i % 2 === 0 ? 'w-48' : 'w-64',
                      )}
                    />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Bot size={32} className="text-navy-200" />
                <p className="text-navy-400 mt-3 text-sm">
                  {activeThread
                    ? `Modo ${MODE_CONFIG[activeThread.mode]?.label} — ${MODE_CONFIG[activeThread.mode]?.description}. ¿En qué te puedo ayudar?`
                    : 'Enviá un mensaje para comenzar.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-border border-t p-4">
            <div className="border-border bg-surface focus-within:border-navy-300 focus-within:ring-navy-200 flex items-end gap-3 rounded-xl border p-3 transition-all focus-within:ring-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Escribí tu consulta... (Enter para enviar, Shift+Enter para nueva línea)"
                rows={1}
                className="text-navy-900 placeholder:text-navy-400 max-h-32 flex-1 resize-none bg-transparent text-sm focus:outline-none"
                style={{ overflowY: 'auto' }}
              />
              <Button
                variant="primary"
                size="icon-sm"
                onClick={sendMessage}
                disabled={!input.trim() || isSending}
                className="shrink-0"
              >
                <Send size={15} />
              </Button>
            </div>
            <p className="text-navy-300 mt-1.5 text-center text-xs">
              Las respuestas son orientativas y no reemplazan el asesoramiento profesional.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
