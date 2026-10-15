'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const QUICK_PROMPTS = [
  '🚍 Quels sont les trajets disponibles ?',
  '💳 Quels moyens de paiement sont acceptés ?',
  '🏢 Quelles sont les compagnies partenaires ?',
  '🎫 Comment se passe la réservation ?',
];

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Bonjour ! 👋 Je suis l\'assistant intelligent Ticket+, propulsé par Gemini AI. Comment puis-je vous aider aujourd\'hui pour votre voyage au Bénin ?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          messages: history,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la réponse de l\'assistant');
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Je suis désolé, je n\'ai pas pu traiter votre demande.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          'Désolé, une petite perturbation est survenue avec le serveur d\'IA. Veuillez réessayer dans un instant ou contacter notre support.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content:
          'Conversation réinitialisée. Bonjour ! Que puis-je faire pour vous aider à préparer votre voyage ?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 print:hidden font-sans">
      {/* Fenêtre de chat */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Assistant Ticket+ AI"
          className="flex flex-col w-[360px] sm:w-[410px] h-[550px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Entête du chat */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
                <span className="material-symbols-outlined text-[24px]">smart_toy</span>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                  Assistant Ticket+
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded font-medium">
                    Gemini AI
                  </span>
                </h3>
                <p className="text-xs text-slate-300 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  En ligne pour vos trajets au Bénin
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Réinitialiser la conversation"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Fermer le chat"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Corps des messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {m.time}
                </span>
              </div>
            ))}

            {/* Indicateur de chargement / saisie */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
                  <span
                    className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
                    style={{ animationDelay: '0.15s' }}
                  ></span>
                  <span
                    className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
                    style={{ animationDelay: '0.3s' }}
                  ></span>
                  <span className="text-xs text-slate-500 ml-1">L&apos;IA réfléchit...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions de questions rapides */}
          {messages.length <= 2 && (
            <div className="p-2.5 bg-white border-t border-slate-100 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200/70 transition-all text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Formulaire de saisie */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Posez votre question sur vos voyages..."
              disabled={isLoading}
              className="flex-1 bg-slate-100 text-slate-800 text-sm px-3.5 py-2.5 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white flex items-center justify-center transition-all shadow-md active:scale-95 flex-shrink-0"
              title="Envoyer le message"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </form>
        </div>
      )}

      {/* Bouton logo compact flottant */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-600 text-white shadow-xl hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-300 border border-emerald-400/40"
        title={isOpen ? "Fermer l'assistant" : "Assistant Ticket+ IA"}
        aria-label={isOpen ? "Fermer l'assistant IA" : "Ouvrir l'assistant IA Ticket+"}
      >
        <span className="material-symbols-outlined text-[24px] sm:text-[26px] text-emerald-300 group-hover:rotate-6 transition-transform">
          {isOpen ? 'close' : 'smart_toy'}
        </span>

        {/* Badge indicateur discret En ligne / Non lu */}
        {!isOpen && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900"></span>
          </span>
        )}
      </button>
    </div>
  );
}
