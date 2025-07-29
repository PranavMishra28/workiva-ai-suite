import axios, { AxiosError } from 'axios';
import { DeepSeekRequest, DeepSeekResponse, ApiError } from '../types';

const API_BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL = 'deepseek/deepseek-r1-0528:free';

class DeepSeekAPI {
  private apiKey: string | null = null;

  private getApiKey(): string {
    if (!this.apiKey) {
      this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!this.apiKey) {
        console.error(
          'Environment variable VITE_OPENROUTER_API_KEY is not set.'
        );
        console.error(
          'Available environment variables:',
          Object.keys(import.meta.env)
        );
        throw new Error(
          'OPENROUTER_API_KEY environment variable is required. Please check your .env.local file and restart the development server.'
        );
      }
      console.log(
        'API key loaded successfully:',
        `${this.apiKey.substring(0, 10)}...`
      );
    }
    return this.apiKey;
  }

  private createHeaders() {
    return {
      Authorization: `Bearer ${this.getApiKey()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Workiva AI Suite',
    };
  }

  async streamChatCompletion(
    messages: DeepSeekRequest['messages'],
    onChunk: (content: string) => void,
    onComplete: () => void,
    onError: (error: string) => void,
    abortController?: AbortController
  ): Promise<void> {
    try {
      const requestBody: DeepSeekRequest = {
        model: MODEL,
        messages,
        stream: true,
      };

      const headers = this.createHeaders();
      console.log('Making request to:', `${API_BASE_URL}/chat/completions`);
      console.log('Request body:', requestBody);
      console.log('Making request with headers:', {
        Authorization: `${headers.Authorization.substring(0, 20)}...`,
        'HTTP-Referer': headers['HTTP-Referer'],
        'X-Title': headers['X-Title'],
        'Content-Type': headers['Content-Type'],
      });

      const response = await fetch(`${API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: abortController?.signal || null,
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        console.error('API Error Response:', errorData);
        console.error('Response Status:', response.status);
        console.error(
          'Response Headers:',
          Object.fromEntries(response.headers.entries())
        );
        throw new Error(
          errorData.error?.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        // eslint-disable-next-line no-restricted-syntax
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete();
              return;
            }

            try {
              const parsed: DeepSeekResponse = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (parseError) {
              // Skip malformed JSON
              // eslint-disable-next-line no-continue
              continue;
            }
          }
        }
      }

      onComplete();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return; // Request was aborted
        }
        onError(error.message);
      } else {
        onError('An unknown error occurred');
      }
    }
  }

  async chatCompletion(messages: DeepSeekRequest['messages']): Promise<string> {
    try {
      const requestBody: DeepSeekRequest = {
        model: MODEL,
        messages,
        stream: false,
      };

      const response = await axios.post<DeepSeekResponse>(
        `${API_BASE_URL}/chat/completions`,
        requestBody,
        {
          headers: this.createHeaders(),
          timeout: 30000,
        }
      );

      return response.data.choices[0]?.delta?.content || '';
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;
        const errorMessage =
          axiosError.response?.data?.error?.message ||
          axiosError.message ||
          'Failed to get response from DeepSeek';
        throw new Error(errorMessage);
      }
      throw error;
    }
  }
}

export const deepSeekAPI = new DeepSeekAPI();
