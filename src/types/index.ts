export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessions: ChatSession[];
  currentSessionId: string | null;
}

export interface ChatActions {
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  createSession: (title: string) => void;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
}

export interface DeepSeekRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  stream?: boolean;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export interface ApiError {
  error: {
    message: string;
    type?: string;
    code?: string;
  };
}
