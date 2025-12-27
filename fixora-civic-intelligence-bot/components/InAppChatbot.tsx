
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, User, Bot, Loader2, MessageCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const InAppChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hi! I am Fixora AI. How can I help you improve our city today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "You are the Fixora Civic Assistant. Help users report problems, verify issues, or understand city policies. Keep it brief and professional. Use markdown if necessary for clarity."
        }
      });
      setMessages(prev => [...prev, { role: 'bot', text: response.text || "I'm processing city data, ask again soon." }]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "Signal lost. Check your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-28 right-8 z-50 flex flex-col gap-4">
        <a 
          href="https://t.me/fixit_civic_assistant_bot" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-4 bg-[#229ED9] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group relative"
        >
          <MessageCircle size={24} />
          <span className="absolute right-full mr-4 bg-slate-800 text-white text-[10px] px-3 py-1 rounded-lg font-bold opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all pointer-events-none">REPORT VIA TELEGRAM</span>
        </a>
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group relative"
        >
          <Sparkles size={24} />
          <span className="absolute right-full mr-4 bg-slate-800 text-white text-[10px] px-3 py-1 rounded-lg font-bold opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all pointer-events-none">FIXORA AI</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-32 right-8 z-[60] w-80 h-[500px] glass-card border border-white/10 rounded-3xl flex flex-col shadow-2xl animate-in slide-in-from-bottom-8">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-indigo-600/20 rounded-t-3xl">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-400"/>
              <span className="text-xs font-black tracking-widest text-white">CITY ASSIST</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X size={18}/>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/10">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                  {m.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
                </div>
                <div className={`text-[11px] p-3 rounded-2xl max-w-[80%] leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg' : 'bg-white/5 text-slate-300 rounded-tl-none border border-white/5'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center"><Loader2 size={12} className="animate-spin text-indigo-400"/></div>
                <div className="bg-white/5 text-slate-500 text-[11px] p-3 rounded-2xl italic">Synthesizing...</div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex gap-2">
            <input
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none"
              placeholder="Query the grid..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="bg-indigo-600 text-white p-2.5 rounded-xl"><Send size={14}/></button>
          </form>
        </div>
      )}
    </>
  );
};

export default InAppChatbot;
