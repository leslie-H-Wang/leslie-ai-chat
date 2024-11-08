import React, { useState } from 'react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';

type PrismStyleType = any;

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const [showCopyTip, setShowCopyTip] = useState(false);
  
  const handleCopy = () => {
    setShowCopyTip(true);
    setTimeout(() => setShowCopyTip(false), 2000);
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3 shrink-0 shadow-md">
          AI
        </div>
      )}
      <div className={`max-w-[80%] rounded-lg p-4 ${
        isUser 
          ? 'bg-blue-500 text-white shadow-md' 
          : 'bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700'
      }`}>
        <ReactMarkdown 
          className={`prose ${isUser ? 'prose-invert' : 'dark:prose-invert'} max-w-none prose-p:my-2 prose-pre:my-2`}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              
              if (!inline && language) {
                return (
                  <div className="relative group/code mt-2 mb-2">
                    <CopyToClipboard text={String(children)} onCopy={handleCopy}>
                      <button className="absolute right-2 top-2 px-2 py-1 rounded bg-gray-700/50 text-gray-300 
                                     opacity-0 group-hover/code:opacity-100 transition-opacity
                                     hover:bg-gray-700/70">
                        复制代码
                      </button>
                    </CopyToClipboard>
                    <SyntaxHighlighter
                      style={oneDark as PrismStyleType}
                      language={language}
                      PreTag="div"
                      className="rounded-md !my-0"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                );
              }
              return <code className={`${className} px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700`} {...props}>{children}</code>;
            }
          }}
        >
          {message.content}
        </ReactMarkdown>
        <div className={`text-xs mt-2 flex justify-between items-center ${
          isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          <div className="relative">
            <CopyToClipboard text={message.content} onCopy={handleCopy}>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded
                               hover:bg-gray-100 dark:hover:bg-gray-700">
                复制内容
              </button>
            </CopyToClipboard>
            {showCopyTip && (
              <div className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg">
                已复制
              </div>
            )}
          </div>
        </div>
      </div>
      {isUser && (
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 ml-3 shrink-0 shadow-md">
          你
        </div>
      )}
    </div>
  );
} 