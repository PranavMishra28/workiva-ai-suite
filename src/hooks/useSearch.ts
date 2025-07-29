import { useState, useMemo } from 'react';
import { ChatSession } from '../types';

export function useSearch(sessions: ChatSession[]) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) {
      return sessions;
    }

    const query = searchQuery.toLowerCase();
    return sessions.filter(
      session =>
        session.title.toLowerCase().includes(query) ||
        session.messages.some(message =>
          message.content.toLowerCase().includes(query)
        )
    );
  }, [sessions, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredSessions,
  };
}
