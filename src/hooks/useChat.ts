import { useState, useCallback } from 'react';
import { Message, ChatState } from '../types';
import { sendMessageToAPI } from '../utils/api';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  content: `👋 你好！我是你的AI助手。我可以：

- 回答问题和解释概念
- 帮助编写和审查代码
- 提供建议和解决方案
- 协助学习和研究

有什么我可以帮你的吗？`,
  role: 'assistant',
  timestamp: Date.now(),
};

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [WELCOME_MESSAGE],
    isLoading: false,
    error: null,
  });

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const response = await sendMessageToAPI(content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: Date.now(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error('发送消息失败:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '发送消息失败',
        isLoading: false,
      }));
    }
  }, []);

  const clearMessages = useCallback(() => {
    setState({
      messages: [WELCOME_MESSAGE],
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    sendMessage,
    clearMessages,
  };
} 