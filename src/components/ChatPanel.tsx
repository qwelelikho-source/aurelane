'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, month: currentMonth }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'AI_NOT_ENABLED') {
          setError('AI insights must be enabled in settings');
        } else if (data.error === 'RATE_LIMITED') {
          setError('Too many requests. Please try again later.');
        } else {
          setError('Failed to get response. Please try again.');
        }
        return;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch {
      setError('Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-[#C9A24B] text-[#0B1220] px-4 py-3 rounded-full shadow-lg hover:bg-[#A78A3F] transition-colors flex items-center gap-2"
        aria-label="Open financial chat"
      >
        <span className="text-xl">💬</span>
        <span className="font-medium">Ask AI</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] bg-[#121B2D] border border-[#243049] rounded-2xl shadow-2xl flex flex-col" style={{ height: '500px' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#243049]">
        <h3 className="text-lg font-serif text-[#E8E4DA]">Financial Chat</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-[#8B95A8] hover:text-[#E8E4DA] transition-colors"
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-[#8B95A8] text-[14px] py-8">
            <p className="mb-2">Ask about your finances:</p>
            <p className="text-sm">&ldquo;How much did I spend this month?&rdquo;</p>
            <p className="text-sm">&ldquo;Which category is over budget?&rdquo;</p>
            <p className="text-sm">&ldquo;Compare my spending to last month&rdquo;</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-[#C9A24B] text-[#0B1220] ml-8'
                : 'bg-[#0B1220] text-[#E8E4DA] mr-8'
            }`}
          >
            <p className="text-[14px] whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}

        {loading && (
          <div className="bg-[#0B1220] text-[#E8E4DA] p-3 rounded-lg mr-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#C9A24B] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[#C9A24B] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-[#C9A24B] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-[#D9746B] text-[#0B1220] p-3 rounded-lg">
            <p className="text-[14px]">{error}</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#243049]">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your finances..."
            className="flex-1 bg-[#0B1220] border border-[#243049] rounded-lg px-3 py-2 text-[#E8E4DA] text-[14px] resize-none focus:outline-none focus:border-[#C9A24B]"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-[#C9A24B] text-[#0B1220] px-4 py-2 rounded-lg hover:bg-[#A78A3F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-[#8B95A8] mt-2">
          General information based on your recorded transactions, not financial advice.
        </p>
      </div>
    </div>
  );
}
