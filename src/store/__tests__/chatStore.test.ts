import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChatStore } from '../chatStore';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid'),
  },
});

describe('ChatStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useChatStore.setState({
      messages: [],
      isLoading: false,
      error: null,
    });
  });

  it('should initialize with default state', () => {
    const state = useChatStore.getState();

    expect(state.messages).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should add a message', () => {
    const { addMessage } = useChatStore.getState();

    addMessage({
      role: 'user',
      content: 'Hello, AI!',
    });

    const state = useChatStore.getState();
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0]).toEqual({
      id: 'test-uuid',
      role: 'user',
      content: 'Hello, AI!',
      timestamp: expect.any(Date),
    });
  });

  it('should clear history', () => {
    const { addMessage, clearHistory } = useChatStore.getState();

    // Add some messages first
    addMessage({ role: 'user', content: 'Hello' });
    addMessage({ role: 'assistant', content: 'Hi there!' });

    expect(useChatStore.getState().messages).toHaveLength(2);

    clearHistory();

    expect(useChatStore.getState().messages).toHaveLength(0);
  });

  it('should set loading state', () => {
    const { setLoading } = useChatStore.getState();

    setLoading(true);
    expect(useChatStore.getState().isLoading).toBe(true);

    setLoading(false);
    expect(useChatStore.getState().isLoading).toBe(false);
  });

  it('should set error state', () => {
    const { setError } = useChatStore.getState();

    setError('Something went wrong');
    expect(useChatStore.getState().error).toBe('Something went wrong');

    setError(null);
    expect(useChatStore.getState().error).toBeNull();
  });

  it('should clear error when adding message', () => {
    const { setError, addMessage } = useChatStore.getState();

    setError('Previous error');
    expect(useChatStore.getState().error).toBe('Previous error');

    addMessage({ role: 'user', content: 'New message' });
    expect(useChatStore.getState().error).toBeNull();
  });

  it('should clear error when clearing history', () => {
    const { setError, clearHistory } = useChatStore.getState();

    setError('Some error');
    expect(useChatStore.getState().error).toBe('Some error');

    clearHistory();
    expect(useChatStore.getState().error).toBeNull();
  });

  it('should set loading to false when setting error', () => {
    const { setLoading, setError } = useChatStore.getState();

    setLoading(true);
    expect(useChatStore.getState().isLoading).toBe(true);

    setError('Error occurred');
    expect(useChatStore.getState().isLoading).toBe(false);
  });
});
