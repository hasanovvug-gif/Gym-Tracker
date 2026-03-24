/// <reference types="vite/client" />
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { WORKOUT_DAYS } from '../data/workoutData';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

export default function AIAssistant() {
  const { t } = useTranslation();
  const { 
    activeWorkout, 
    history, 
    aiMessages, 
    addAiMessage, 
    isAiAssistantOpen, 
    setAiAssistantOpen 
  } = useWorkoutStore();
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, isAiAssistantOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addAiMessage({ role: 'user', text: userMessage });
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });
      
      let context = `${t('ai_context_base')}\n`;
      
      if (activeWorkout) {
        const day = WORKOUT_DAYS.find(d => d.id === activeWorkout.dayId);
        context += `${t('ai_context_active_workout', { name: day ? t(day.name) : '' })}\n`;
        context += `${t('ai_context_current_weights', { weights: JSON.stringify(activeWorkout.logs) })}\n`;
      } else {
        context += `${t('ai_context_no_active_workout')}\n`;
      }

      if (history.length > 0) {
        context += `${t('ai_context_last_workout', { date: new Date(history[0].date).toLocaleDateString() })}\n`;
      }

      context += `${t('ai_context_instructions')}\n\n`;

      const prompt = context + `${t('ai_context_user_question')} ${userMessage}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      addAiMessage({ role: 'model', text: response.text || t('ai_error_response') });
    } catch (error) {
      console.error('AI Error:', error);
      addAiMessage({ role: 'model', text: t('ai_error_network') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setAiAssistantOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all z-40",
          isAiAssistantOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )}
      >
        <Sparkles className="w-6 h-6" />
      </button>

      <div
        className={cn(
          "fixed bottom-0 right-0 w-full md:w-[400px] md:bottom-6 md:right-6 md:rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-50",
          isAiAssistantOpen ? "h-[80vh] md:h-[600px] opacity-100 translate-y-0" : "h-0 opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{t('ai_coach')}</h3>
              <p className="text-xs text-blue-600 font-medium">Online</p>
            </div>
          </div>
          <button
            onClick={() => setAiAssistantOpen(false)}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {aiMessages.length === 0 && (
            <div className="text-center text-slate-500 mt-10">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-20 text-blue-600" />
              <p className="text-sm">{t('ai_welcome_message')}</p>
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                <button onClick={() => setInput(t('ai_suggestion_1'))} className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50 text-slate-700 shadow-sm transition-colors">{t('ai_suggestion_1_short')}</button>
                <button onClick={() => setInput(t('ai_suggestion_2'))} className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50 text-slate-700 shadow-sm transition-colors">{t('ai_suggestion_2_short')}</button>
                <button onClick={() => setInput(t('ai_suggestion_3'))} className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50 text-slate-700 shadow-sm transition-colors">{t('ai_suggestion_3_short')}</button>
              </div>
            </div>
          )}
          {aiMessages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                msg.role === 'user'
                  ? "bg-blue-600 text-white ml-auto rounded-br-sm font-medium"
                  : "bg-white border border-slate-200 text-slate-800 mr-auto rounded-bl-sm"
              )}
            >
              {msg.text}
            </div>
          ))}
          {isLoading && (
            <div className="bg-white border border-slate-200 text-slate-800 mr-auto rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%] shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('ask_coach')}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-4 pr-12 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
