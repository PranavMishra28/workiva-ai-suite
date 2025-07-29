import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatInput } from '../ChatInput';

describe('ChatInput', () => {
  const mockOnSendMessage = vi.fn();
  const mockOnCancelRequest = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input field and send button', () => {
    render(
      <ChatInput
        onSendMessage={mockOnSendMessage}
        onCancelRequest={mockOnCancelRequest}
        isLoading={false}
      />
    );

    expect(
      screen.getByPlaceholderText(/type your message/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /send message/i })
    ).toBeInTheDocument();
  });

  it('calls onSendMessage when send button is clicked', () => {
    render(
      <ChatInput
        onSendMessage={mockOnSendMessage}
        onCancelRequest={mockOnCancelRequest}
        isLoading={false}
      />
    );

    const input = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send message/i });

    fireEvent.change(input, { target: { value: 'Hello, AI!' } });
    fireEvent.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello, AI!');
  });

  it('calls onSendMessage when Enter is pressed', () => {
    render(
      <ChatInput
        onSendMessage={mockOnSendMessage}
        onCancelRequest={mockOnCancelRequest}
        isLoading={false}
      />
    );

    const input = screen.getByPlaceholderText(/type your message/i);

    fireEvent.change(input, { target: { value: 'Hello, AI!' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello, AI!');
  });

  it('does not send message when Shift+Enter is pressed', () => {
    render(
      <ChatInput
        onSendMessage={mockOnSendMessage}
        onCancelRequest={mockOnCancelRequest}
        isLoading={false}
      />
    );

    const input = screen.getByPlaceholderText(/type your message/i);

    fireEvent.change(input, { target: { value: 'Hello, AI!' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('does not send empty messages', () => {
    render(
      <ChatInput
        onSendMessage={mockOnSendMessage}
        onCancelRequest={mockOnCancelRequest}
        isLoading={false}
      />
    );

    const sendButton = screen.getByRole('button', { name: /send message/i });

    fireEvent.click(sendButton);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('shows cancel button and loading state when isLoading is true', () => {
    render(
      <ChatInput
        onSendMessage={mockOnSendMessage}
        onCancelRequest={mockOnCancelRequest}
        isLoading
      />
    );

    expect(
      screen.getByRole('button', { name: /cancel request/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/ai is thinking/i)).toBeInTheDocument();
  });

  it('calls onCancelRequest when cancel button is clicked', () => {
    render(
      <ChatInput
        onSendMessage={mockOnSendMessage}
        onCancelRequest={mockOnCancelRequest}
        isLoading
      />
    );

    const cancelButton = screen.getByRole('button', {
      name: /cancel request/i,
    });
    fireEvent.click(cancelButton);

    expect(mockOnCancelRequest).toHaveBeenCalled();
  });

  it('disables input when isLoading is true', () => {
    render(
      <ChatInput
        onSendMessage={mockOnSendMessage}
        onCancelRequest={mockOnCancelRequest}
        isLoading
      />
    );

    const input = screen.getByPlaceholderText(/type your message/i);
    expect(input).toBeDisabled();
  });

  it('disables input when disabled prop is true', () => {
    render(
      <ChatInput
        onSendMessage={mockOnSendMessage}
        onCancelRequest={mockOnCancelRequest}
        isLoading={false}
        disabled
      />
    );

    const input = screen.getByPlaceholderText(/type your message/i);
    expect(input).toBeDisabled();
  });

  it('clears input after sending message', () => {
    render(
      <ChatInput
        onSendMessage={mockOnSendMessage}
        onCancelRequest={mockOnCancelRequest}
        isLoading={false}
      />
    );

    const input = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send message/i });

    fireEvent.change(input, { target: { value: 'Hello, AI!' } });
    fireEvent.click(sendButton);

    expect(input).toHaveValue('');
  });

  it('auto-resizes textarea based on content', async () => {
    render(
      <ChatInput
        onSendMessage={mockOnSendMessage}
        onCancelRequest={mockOnCancelRequest}
        isLoading={false}
      />
    );

    const textarea = screen.getByPlaceholderText(/type your message/i);

    // Mock scrollHeight
    Object.defineProperty(textarea, 'scrollHeight', {
      writable: true,
      value: 100,
    });

    fireEvent.change(textarea, {
      target: { value: 'A longer message that should trigger resizing' },
    });

    await waitFor(() => {
      expect(textarea.style.height).toBe('100px');
    });
  });
});
