import { useEffect, useState } from 'react';
import { chatHistoryService } from '../services/ChatHistoryService';
import type { ChatSession } from '../services/ChatHistoryService';
import './ChatSidebar.css';

interface ChatSidebarProps {
  userId: string;
  activeSessionId: string | null;
  onSessionSelect: (sessionId: string, messages: ChatSession['messages']) => void;
  onNewChat: () => void;
}

export function ChatSidebar({ userId, activeSessionId, onSessionSelect, onNewChat }: ChatSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = chatHistoryService.watchUserSessions(
      userId,
      (updatedSessions) => {
        setSessions(updatedSessions);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const handleSessionClick = (session: ChatSession) => {
    if (session.id === activeSessionId) return;
    onSessionSelect(session.id, session.messages);
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <h2>Chat History</h2>
        <button 
          className="new-chat-button" 
          onClick={onNewChat}
          aria-label="Start new chat"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Chat
        </button>
      </div>

      <div className="sessions-list">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading history...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <p>No chat history yet</p>
            <p className="empty-subtitle">Start a conversation to see your history here</p>
          </div>
        ) : (
          sessions.map((session) => (
            <button
              key={session.id}
              className={`session-item ${session.id === activeSessionId ? 'active' : ''}`}
              onClick={() => handleSessionClick(session)}
            >
              <div className="session-title">{session.title}</div>
              <div className="session-date">{formatDate(session.updatedAt)}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
