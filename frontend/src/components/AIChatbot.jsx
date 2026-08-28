import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  X, 
  RotateCcw, 
  User, 
  Lightbulb, 
  Sprout, 
  UserCheck
} from 'lucide-react';
import api from '../utils/api';

const INITIAL_SUGGESTIONS = [
  "Which crops survive high drought risk?",
  "How do I set up drip irrigation for low soil moisture?",
  "What does SPEI index score mean?",
  "Show drought model accuracy and stats"
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "👋 **Hello! Welcome to the Agri Advisory & Drought Support Desk.**\n\nAsk me anything about drought risk forecasting, optimal crop selection, irrigation planning, or soil moisture management!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input.trim();
    if (!query || loading) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsgId = Date.now();

    const userMessage = {
      id: newMsgId,
      sender: 'user',
      text: query,
      time: userTime
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await api.post('/api/chat', { message: query });
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const aiReply = {
        id: newMsgId + 1,
        sender: 'ai',
        text: response.data.reply || "I've analyzed your query against our drought and climate models.",
        time: aiTime
      };

      setMessages((prev) => [...prev, aiReply]);
      if (response.data.suggestions && response.data.suggestions.length > 0) {
        setSuggestions(response.data.suggestions);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const aiError = {
        id: newMsgId + 1,
        sender: 'ai',
        text: "⚠️ **Notice**: Service temporarily unavailable. Please check backend connection.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiError]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: "Conversation reset. How else can I assist your farming strategy today?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setSuggestions(INITIAL_SUGGESTIONS);
  };

  const formatText = (content) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Bold text formatting
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} className="flex items-start space-x-1.5 my-1 pl-1">
            <span className="text-emerald-400 font-bold">•</span>
            <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[\•\-]\s*/, '') }} />
          </div>
        );
      }
      return (
        <p key={idx} className="my-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative flex items-center space-x-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-3.5 rounded-full shadow-2xl hover:shadow-emerald-500/20 transition-all border border-emerald-400/30"
          id="ai-chatbot-toggle-btn"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </span>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-emerald-200" />
            <span className="font-semibold text-sm tracking-wide">Agri Advisor</span>
          </div>
        </motion.button>
      )}

      {/* Floating Chat Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-[90vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
            id="ai-chatbot-window"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 px-4 py-3.5 border-b border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    Agri Advisor Desk
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                      v2.1 Active
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">SPEI & Climate Analytics Support</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleReset}
                  title="Reset conversation"
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize assistant"
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-700">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none shadow-md'
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 opacity-75 text-[10px]">
                      <span className="font-semibold flex items-center gap-1">
                        {msg.sender === 'user' ? (
                          <>
                            <User className="w-3 h-3" /> You
                          </>
                        ) : (
                          <>
                            <Sprout className="w-3 h-3 text-emerald-400" /> Agri Advisor
                          </>
                        )}
                      </span>
                      <span>{msg.time}</span>
                    </div>
                    <div className="text-xs leading-relaxed">{formatText(msg.text)}</div>
                  </div>
                </div>
              ))}

              {/* Typing loader */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl rounded-tl-none p-3 max-w-[80%] flex items-center space-x-2">
                    <Sprout className="w-4 h-4 text-emerald-400 animate-spin" />
                    <span className="text-slate-400 text-xs">Fetching agricultural recommendations...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            {suggestions.length > 0 && (
              <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800 flex gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
                {suggestions.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    disabled={loading}
                    className="whitespace-nowrap bg-emerald-950/40 hover:bg-emerald-800/40 text-emerald-300 border border-emerald-500/30 rounded-full px-2.5 py-1 flex items-center gap-1 transition-colors hover:border-emerald-400"
                  >
                    <Lightbulb className="w-3 h-3 text-emerald-400" />
                    <span>{chip}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-slate-900 border-t border-emerald-500/20 flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about crops, SPEI, or irrigation..."
                disabled={loading}
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                id="ai-chatbot-input"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white p-2.5 rounded-xl transition-all shadow-md flex items-center justify-center"
                id="ai-chatbot-send-btn"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
