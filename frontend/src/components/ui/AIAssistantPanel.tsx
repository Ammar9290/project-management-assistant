import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BotMessageSquare, X, Send, Loader2, Wrench, Sparkles } from 'lucide-react';
import { aiApi } from '../../api/ai';
import { cn } from '../../utils/cn';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolsUsed?: string[];
  isError?: boolean;
}

export function AIAssistantPanel() {
  const { id: projectId } = useParams<{ id: string }>();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your AI Project Assistant. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiApi.query({ message: userMessage.content, projectId });
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        toolsUsed: response.toolsUsed,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-8 right-8 p-4 bg-gradient-to-tr from-primary-600 to-indigo-500 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary-500/40 hover:scale-110 hover:shadow-primary-500/50 transition-all duration-300 z-40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 group",
          isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <Sparkles className="absolute top-2 right-2 w-3 h-3 text-white/70 animate-pulse" />
        <BotMessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
      </button>

      {/* Slide-over Panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white/95 backdrop-blur-xl shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border-l border-white/50 transform transition-transform duration-500 ease-out z-50 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-white/80 backdrop-blur">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 text-primary-600 rounded-xl mr-3 relative">
              <BotMessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500 border-2 border-white"></span>
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 leading-tight">AI Assistant</h2>
              <p className="text-xs font-medium text-slate-500">Always here to help</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex w-full animate-fade-in-up",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] shadow-sm relative",
                  msg.role === 'user'
                    ? "bg-gradient-to-br from-primary-600 to-indigo-600 text-white rounded-br-sm shadow-primary-500/20 border border-white/10"
                    : msg.isError 
                      ? "bg-rose-50 text-rose-900 rounded-bl-sm border border-rose-200"
                      : "bg-white text-slate-700 rounded-bl-sm border border-slate-200/60"
                )}
              >
                <div className="whitespace-pre-wrap leading-relaxed font-medium">{msg.content}</div>
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-200/50 text-[11px] font-semibold text-slate-400 flex flex-wrap gap-1.5 items-center">
                    <Wrench className="w-3 h-3"/> <span>Tools:</span>
                    {msg.toolsUsed.map(t => (
                      <span key={t} className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white rounded-2xl rounded-bl-sm border border-slate-200/60 shadow-sm px-5 py-4 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-200/60 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <form onSubmit={handleSend} className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full pr-14 py-4 pl-5 bg-slate-100/50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-2xl text-sm font-medium text-slate-700 transition-all shadow-inner placeholder:text-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-primary-600 text-white rounded-xl hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:shadow-md hover:shadow-primary-500/20"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] font-medium text-slate-400">AI can make mistakes. Verify important information.</p>
          </div>
        </div>
      </div>
    </>
  );
}
