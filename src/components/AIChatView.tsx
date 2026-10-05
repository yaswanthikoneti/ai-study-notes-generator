import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  BookOpen,
  Languages,
  User,
  Bot,
  Zap,
  HelpCircle
} from 'lucide-react';
import { StudyNote, ChatMessage } from '../types/notes';

interface AIChatViewProps {
  savedNotes: StudyNote[];
  activeNote: StudyNote | null;
  onSelectActiveNote: (note: StudyNote) => void;
  selectedLanguage: 'English' | 'Telugu' | 'Hindi';
}

export const AIChatView: React.FC<AIChatViewProps> = ({
  savedNotes,
  activeNote,
  onSelectActiveNote,
  selectedLanguage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem('ai_study_chat_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading chat history:', e);
    }
    return [
      {
        id: 'welcome-1',
        role: 'assistant',
        content: activeNote
          ? `Hello! I am your AI academic tutor for **${activeNote.subject}** (${activeNote.topic}). How can I help you master this topic for your exams today? You can ask for simplified analogies, Telugu/Hindi explanations, 10-mark answer drafts, or practice MCQs!`
          : `Hello! I am your AI study mentor. Select one of your notes from above, or ask any Computer Science exam question!`,
        timestamp: 'Just now',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('ai_study_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.error('Error saving chat history:', e);
    }
  }, [messages]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [chatLanguage, setChatLanguage] = useState<'English' | 'Telugu' | 'Hindi'>(selectedLanguage);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Suggested quick prompt chips (as requested)
  const promptShortcuts = [
    'Explain this topic simply.',
    'Give me an example.',
    'Explain this in Telugu.',
    'Explain this in Hindi.',
    'Give me a 10-mark answer.',
    'Give me 5 MCQs.',
    'What are the most important points?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputPrompt('');
    setIsLoading(true);

    // Prepare note context
    let notesContext = '';
    if (activeNote) {
      notesContext = `Title: ${activeNote.title}\nSubject: ${activeNote.subject}\nTopic: ${activeNote.topic}\nOverview: ${activeNote.overview}\nKey Concepts: ${JSON.stringify(
        activeNote.keyConcepts
      )}\nDefinitions: ${JSON.stringify(activeNote.definitions)}\nImportant Points: ${JSON.stringify(
        activeNote.importantPoints
      )}`;
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          notesContext,
          language: chatLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reach AI chat tutor.');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I am ready to help you with your study notes.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered a temporary connection issue. Please check your internet connection or server status and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-cleared',
        role: 'assistant',
        content: 'Chat history cleared. What would you like to review next?',
        timestamp: 'Just now',
      },
    ]);
  };

  const handleRegenerateLast = () => {
    // Find last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 py-4 pb-20 flex flex-col h-[calc(100vh-6rem)]">
      {/* Header & Active Context Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-gray-900 dark:text-white">AI Study Tutor</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Grounded in your current note context
            </p>
          </div>
        </div>

        {/* Note Switcher & Controls */}
        <div className="flex items-center space-x-2">
          {savedNotes.length > 0 && (
            <select
              value={activeNote?.id || ''}
              onChange={(e) => {
                const found = savedNotes.find((n) => n.id === e.target.value);
                if (found) onSelectActiveNote(found);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-xs font-semibold max-w-[200px] truncate cursor-pointer"
            >
              {savedNotes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.subject}: {n.topic}
                </option>
              ))}
            </select>
          )}

          <select
            value={chatLanguage}
            onChange={(e) => setChatLanguage(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-xs font-semibold cursor-pointer"
          >
            <option value="English">English</option>
            <option value="Telugu">తెలుగు (Telugu)</option>
            <option value="Hindi">हिन्दी (Hindi)</option>
          </select>

          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex overflow-x-auto gap-1.5 pb-1 no-scrollbar shrink-0">
        {promptShortcuts.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800/60 whitespace-nowrap transition-colors flex items-center space-x-1 shrink-0"
          >
            <Zap className="w-3 h-3 text-indigo-500" />
            <span>{chip}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-200/80 dark:border-gray-800 shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                  isUser
                    ? 'bg-indigo-600'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700/80 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line font-sans space-y-2">
                  {msg.content}
                </div>

                {/* Assistant Bubble Actions */}
                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px] text-gray-400">
                    <span>{msg.timestamp}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="hover:text-gray-700 dark:hover:text-gray-200 flex items-center space-x-1"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={handleRegenerateLast}
                        className="hover:text-gray-700 dark:hover:text-gray-200 flex items-center space-x-1"
                        title="Regenerate response"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retry</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-500 flex items-center space-x-2 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Thinking with Gemini using your study notes...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-md shrink-0"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder={`Ask anything about ${activeNote?.topic || 'your notes'}...`}
          className="flex-1 px-4 py-2.5 text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-400"
        />

        <button
          type="submit"
          disabled={!inputPrompt.trim() || isLoading}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-xs transition-transform active:scale-95 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
