import React, { useState, useRef, useEffect } from 'react';
import {
  PaperAirplaneIcon,
  StopIcon,
  MicrophoneIcon,
  PaperClipIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useFileUpload } from '../hooks/useFileUpload';
import { FileUploader } from './FileUploader';

import { FileAttachment } from '../types';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: FileAttachment[]) => void;
  onCancelRequest: () => void;
  isLoading: boolean;
  isStreaming?: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSendMessage,
  onCancelRequest,
  isLoading,
  isStreaming = false,
  disabled = false,
}: ChatInputProps): JSX.Element {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { isListening, startListening, stopListening } = useVoiceInput({
    onTranscript: transcript => {
      setMessage(prev => prev + transcript);
    },
  });

  const { uploads, uploadFile, removeUpload } = useFileUpload({
    onUploadComplete: () => {
      // File will be handled when message is sent
    },
  });

  const handleSubmit = () => {
    if (!message.trim() || isLoading || isStreaming || disabled) return;

    // Convert uploads to attachments
    const attachments = uploads
      .filter(upload => upload.status === 'success')
      .map(upload => ({
        id: upload.id,
        name: upload.file.name,
        type: upload.type,
        size: upload.file.size,
        ...(upload.preview && { preview: upload.preview }),
      }));

    onSendMessage(message, attachments);
    setMessage('');
    // Clear uploads after sending
    uploads.forEach(upload => removeUpload(upload.id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleFileUpload = async () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async () => {
    imageInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { files } = event.target;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        await uploadFile(files[i]);
      }
    }
    event.target.value = '';
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { files } = event.target;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        await uploadFile(files[i]);
      }
    }
    event.target.value = '';
  };

  return (
    <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 border border-slate-600/60 rounded-xl bg-white dark:bg-gray-800 p-2 shadow-md dark:shadow-lg">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              className="w-full resize-none border-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 py-2 px-3 rounded-xl min-h-[44px] max-h-[120px] pr-12 font-sans text-sm leading-relaxed"
              rows={1}
              disabled={isLoading || isStreaming || disabled}
              aria-label="Chat message input"
            />

            {isLoading && (
              <div className="absolute right-3 bottom-3">
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Additional Controls */}
          <div className="flex items-center gap-1 flex-wrap">
            {/* Voice Input */}
            <button
              type="button"
              onClick={handleVoiceToggle}
              disabled={isLoading || isStreaming || disabled}
              className={`p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl ${
                isListening ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : ''
              }`}
              aria-label={
                isListening ? 'Stop voice input' : 'Start voice input'
              }
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>

            {/* File Upload */}
            <button
              type="button"
              onClick={handleFileUpload}
              disabled={isLoading || isStreaming || disabled}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl"
              aria-label="Attach file"
            >
              <PaperClipIcon className="w-5 h-5" />
            </button>

            {/* Image Upload */}
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={isLoading || isStreaming || disabled}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl"
              aria-label="Upload image"
            >
              <PhotoIcon className="w-5 h-5" />
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={isLoading ? onCancelRequest : handleSubmit}
              disabled={
                (!message.trim() && !isLoading) || isStreaming || disabled
              }
              className={`btn-primary flex items-center justify-center min-w-[44px] h-[44px] py-2 px-3 rounded-xl shadow-md dark:shadow-lg ${
                isLoading ? 'bg-red-600 hover:bg-red-700' : ''
              }`}
              aria-label={isLoading ? 'Cancel request' : 'Send message'}
            >
              {isLoading ? (
                <StopIcon className="w-5 h-5" />
              ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* File Uploader */}
        <FileUploader
          uploads={uploads}
          onFileSelect={async files => {
            for (let i = 0; i < files.length; i++) {
              await uploadFile(files[i]);
            }
          }}
          onRemoveUpload={removeUpload}
        />

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf"
          multiple
        />
        <input
          ref={imageInputRef}
          type="file"
          onChange={handleImageChange}
          className="hidden"
          accept="image/*"
          multiple
        />

        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          {isLoading
            ? 'AI is thinking...'
            : 'Press Enter to send, Shift+Enter for new line'}
        </div>
      </div>
    </div>
  );
}
