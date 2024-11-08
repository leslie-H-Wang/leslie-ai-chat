import React, { createContext, useContext } from 'react';
import { useChat } from '../hooks/useChat';
import { ChatState } from '../types';

interface ChatContextType extends ChatState {
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  suggestions: string[];
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const chat = useChat();

  const contextValue: ChatContextType = {
    ...chat,
    suggestions: [
      "你能做什么？",
      "如何使用React Hooks？",
      "解释一下Promise",
      "写一个快速排序算法",
    ],
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
} 