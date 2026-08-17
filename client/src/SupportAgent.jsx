import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '/datacenter-api';

const SupportAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Obtener tenantId de la sesión para persistencia aislada
  const sessionData = JSON.parse(localStorage.getItem('bantos_session') || '{}');
  const tenantId = sessionData.tenantId || 'default';
  const STORAGE_KEY = `bantos_chat_history_${tenantId}`;

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [
      { role: 'assistant', content: '¡Hola! Soy tu Agente de Soporte de Bantos. ¿En qué puedo ayudarte hoy?' }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Guardar mensajes en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API}/support/chat`, {
        messages: [...messages, userMessage],
        tenantId: tenantId
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.content }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error al conectar con el servidor de soporte.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('¿Estás seguro de que deseas borrar el historial de chat?')) {
      const initialMessage = [{ role: 'assistant', content: '¡Hola! Soy tu Agente de Soporte de Bantos. ¿En qué puedo ayudarte hoy?' }];
      setMessages(initialMessage);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[400px] h-[600px] bg-[#0D1829] border border-[#1E3A5F] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-[#152540] border-b border-[#1E3A5F] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0D1829] rounded-xl border border-[#1A6DCC] flex items-center justify-center p-2">
                   {/* Mini Logo Bantos */}
                   <svg viewBox="0 0 100 100" className="w-full h-full">
                      <rect x="15" y="25" width="70" height="10" rx="3" fill="#0FA8E0" />
                      <rect x="15" y="45" width="70" height="10" rx="3" fill="#1A6DCC" />
                      <rect x="15" y="65" width="70" height="10" rx="3" fill="#0FA8E0" opacity="0.6" />
                   </svg>
                </div>
                <div>
                  <h3 className="text-[#E8F2FF] font-black text-sm uppercase tracking-widest">Bantos AI Support</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#3BEBA0] rounded-full animate-pulse" />
                    <span className="text-[#6B9ACC] text-[10px] font-bold uppercase tracking-widest">En línea · Powered by AI</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleClear} className="p-2 text-[#4A6A8A] hover:text-red-400 transition-all" title="Borrar historial">
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-[#4A6A8A] hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-[#0D1829] to-[#0A121F]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-[#1A6DCC] text-white rounded-tr-none' 
                      : 'bg-[#152540] text-[#E8F2FF] border border-[#1E3A5F] rounded-tl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#152540] p-4 rounded-2xl rounded-tl-none border border-[#1E3A5F] flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[#0FA8E0] rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-[#0FA8E0] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-[#0FA8E0] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-[#152540] border-t border-[#1E3A5F]">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe tu duda técnica..."
                  className="w-full bg-[#0D1829] border border-[#1E3A5F] rounded-2xl py-4 pl-5 pr-14 text-[#E8F2FF] placeholder-[#4A6A8A] focus:outline-none focus:border-[#1A6DCC] transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-2 p-3 bg-[#1A6DCC] text-white rounded-xl hover:bg-[#0FA8E0] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[10px] text-center text-[#4A6A8A] mt-4 font-bold uppercase tracking-widest">Responde instantáneamente sobre la plataforma</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center transition-all overflow-hidden border ${
          isOpen ? 'bg-[#0D1829] border-[#1E3A5F]' : 'bg-[#1A6DCC] border-white/20 shadow-blue-600/40'
        }`}
      >
        {isOpen ? <X size={28} className="text-[#6B9ACC]" /> : (
          <div className="w-full h-full p-2.5">
            <svg viewBox="320 245 100 100" className="w-full h-full">
              <rect x="336" y="261" width="68" height="68" rx="14" fill="#152540" stroke="#1A6DCC" strokeWidth="1.5"/>
              <rect x="350" y="272" width="40" height="10" rx="3" fill="#0FA8E0" opacity="0.9"/>
              <rect x="350" y="286" width="40" height="10" rx="3" fill="#1A6DCC" opacity="0.8"/>
              <rect x="350" y="300" width="40" height="10" rx="3" fill="#0FA8E0" opacity="0.5"/>
              <circle cx="356" cy="277" r="2" fill="#3BEBA0"/>
              <circle cx="356" cy="291" r="2" fill="#3BEBA0"/>
              <circle cx="356" cy="305" r="2" fill="#FFA833"/>
              <path d="M376 270 Q390 264 390 277" fill="none" stroke="#0FA8E0" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="390" cy="281" r="4" fill="#0FA8E0"/>
              <path d="M350 269 Q356 263 362 269" fill="none" stroke="#3BEBA0" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M347 266 Q356 258 365 266" fill="none" stroke="#3BEBA0" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
        )}
      </motion.button>
    </div>
  );
};

export default SupportAgent;
