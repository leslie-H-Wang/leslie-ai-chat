import React, { useState } from 'react';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import { ChatProvider } from './contexts/ChatContext';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ChatProvider>
      <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
        <Header 
          onThemeToggle={() => setDarkMode(!darkMode)}
        />
        <ChatArea />
        <InputArea />
      </div>
    </ChatProvider>
  );
}

export default App;