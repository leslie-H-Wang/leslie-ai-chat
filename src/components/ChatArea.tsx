import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import { useChatContext } from '../contexts/ChatContext';

export default function ChatArea() {
  const { messages, isLoading, error, suggestions, sendMessage } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
      {messages.length === 1 && (
        <div className="max-w-4xl mx-auto mt-8 mb-12">
          <div className="grid grid-cols-2 gap-6">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => sendMessage(suggestion)}
                className="p-6 text-left rounded-xl border dark:border-gray-700 
                         hover:bg-gray-100 dark:hover:bg-gray-800 
                         transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <p className="text-gray-900 dark:text-gray-100 text-lg">{suggestion}</p>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
      
      {isLoading && (
        <div className="flex justify-center py-6">
          <LoadingIndicator />
        </div>
      )}
      
      {error && (
        <div className="max-w-4xl mx-auto mt-4">
          <div className="text-red-500 text-center py-3 px-4 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm">
            {error}
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
} 