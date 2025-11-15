import { useState, useRef, useEffect } from 'react';
import { Auth, Chatbot } from '@shockproofai/shockproof-components';
import { app } from '../firebase';
import { ChatSidebar } from '../components/ChatSidebar';
import type { ChatMessage } from '../services/ChatHistoryService';
import './ChatTestPage.css';

export function ChatTestPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[] | undefined>(undefined);
  const [chatKey, setChatKey] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const userId = "anand.sathe@fidocs.ai";

  const handleSessionSelect = (sessionId: string, messages: ChatMessage[]) => {
    setActiveSessionId(sessionId);
    setInitialMessages(messages);
    setChatKey(prev => prev + 1);
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setInitialMessages(undefined);
    setChatKey(prev => prev + 1);
  };

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <Auth firebaseApp={app} autoSignInAnonymously={true} enableGoogle={false} enableEmailLink={false}>
      <div className={`chat-test-page ${isResizing ? 'resizing' : ''}`}>
        <div 
          ref={sidebarRef}
          className="sidebar-wrapper" 
          style={{ width: `${sidebarWidth}px` }}
        >
          <ChatSidebar
            userId={userId}
            activeSessionId={activeSessionId}
            onSessionSelect={handleSessionSelect}
            onNewChat={handleNewChat}
          />
          <div 
            className={`resize-handle ${isResizing ? 'resizing' : ''}`}
            onMouseDown={handleMouseDown}
          />
        </div>
        <div className="chat-main">
          <Chatbot 
            key={chatKey}
            firebaseApp={app}
            showTimingInfo={true}
            enableDynamicQuestions={true}
            maxInitialQuestions={3}
            userId={userId}
            saveSessionHistory={true}
            loadSessionId={activeSessionId || undefined}
            initialMessages={initialMessages}
            showNewChatButton={false}
            showHeader={false}
            uiVariant="rex"
            hideShowMoreButton={true}
            welcomeGreeting="Hello, Anand"
          />
        </div>
      </div>
    </Auth>
  );
}

