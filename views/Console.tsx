import React, { useState, useEffect, useRef } from 'react';
import { NexusModule, ChatMessage } from '../types';
import { queryNexusModule } from '../services/geminiService';
import { Send, Terminal as TerminalIcon, Minimize2, Trash2 } from 'lucide-react';

interface ConsoleProps {
  activeModule: NexusModule | null;
}

const Console: React.FC<ConsoleProps> = ({ activeModule }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (activeModule) {
      setHistory([{
        id: 'init',
        role: 'model',
        text: `Uplink established with ${activeModule.name}. Status: ONLINE. Awaiting directive.`,
        timestamp: new Date(),
        sender: activeModule.name
      }]);
    }
  }, [activeModule]);

  const handleSend = async () => {
    if (!input.trim() || !activeModule) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Prepare history for API (exclude init message usually, but keep context if needed)
    const apiHistory = history
      .filter(h => h.id !== 'init')
      .map(h => ({ role: h.role, text: h.text }));

    const responseText = await queryNexusModule(activeModule, apiHistory, userMsg.text);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date(),
      sender: activeModule.name
    };

    setHistory(prev => [...prev, modelMsg]);
    setIsLoading(false);
  };

  if (!activeModule) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
        <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center animate-pulse">
            <TerminalIcon className="w-8 h-8 opacity-50" />
        </div>
        <p className="font-mono text-sm tracking-widest">NO MODULE SELECTED</p>
        <p className="text-xs max-w-xs text-center">Navigate to Hierarchy and select an agent to begin neural uplink.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
      {/* Terminal Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
          <span className="ml-4 font-mono text-sm text-slate-300">
            root@nexus:~/{activeModule.name.toLowerCase()}
          </span>
        </div>
        <button onClick={() => setHistory([])} className="text-slate-600 hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Output Area */}
      <div className="flex-1 overflow-y-auto p-6 font-mono space-y-6" ref={scrollRef}>
        {history.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-indigo-900/20 border border-indigo-500/30' : 'bg-slate-800/50 border border-slate-700'} p-4 rounded-md`}>
              <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2">
                <span className={`text-xs font-bold ${msg.role === 'user' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                  {msg.role === 'user' ? 'OPERATOR' : msg.sender}
                </span>
                <span className="text-[10px] text-slate-500">{msg.timestamp.toLocaleTimeString()}</span>
              </div>
              <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-md flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200"></span>
                 </div>
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-md px-4 py-3 focus-within:border-indigo-500 transition-colors">
          <span className="text-emerald-500 font-mono">{'>'}</span>
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none font-mono text-slate-200 placeholder-slate-600"
            placeholder="Execute command or query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            autoFocus
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="text-indigo-500 hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Console;
