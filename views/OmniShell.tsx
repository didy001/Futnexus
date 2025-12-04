
import React, { useState, useEffect, useRef } from 'react';
import { NexusStatus } from '../types';
import { NexusClient } from '../services/nexusClient';
import { Send, Mic, MicOff, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface OmniShellProps {
  status: NexusStatus;
}

const OmniShell: React.FC<OmniShellProps> = ({ status }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{role: string, content: string}[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Re-implementing minimalist versions of hooks for brevity in visual update
  const speak = (text: string) => { 
      if(!isMuted) {
          try {
              const utterance = new SpeechSynthesisUtterance(text);
              window.speechSynthesis.speak(utterance);
          } catch(e) {
              // Ignore not-allowed error
          }
      } 
  };
  const toggleListening = () => { setIsListening(!isListening); };

  const handleCommand = async () => {
    if (!input.trim()) return;
    const cmd = input;
    setInput('');
    setHistory(prev => [...prev, { role: 'user', content: cmd }]);
    setIsThinking(true);
    
    const response = await NexusClient.sendCommand(cmd, history);
    
    setHistory(prev => [...prev, { role: response.role, content: response.content }]);
    setIsThinking(false);
    
    if (response.role === 'model' && response.content) {
        speak(response.content);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div className="w-full h-full flex flex-col relative">
      
      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
        {history.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-60">
                <div className="w-24 h-24 rounded-full border border-cyan-500/30 flex items-center justify-center mb-6 animate-pulse">
                    <Sparkles className="w-10 h-10 text-cyan-400" />
                </div>
                <h2 className="text-3xl font-[Rajdhani] font-light text-white tracking-[0.5em]">RAPHAEL</h2>
                <p className="text-xs font-mono text-cyan-500 mt-2">AWAITING INQUIRY</p>
            </div>
        )}

        {history.map((msg, idx) => (
            <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-6 rounded-2xl border backdrop-blur-md transition-all ${
                    msg.role === 'user' 
                    ? 'bg-slate-900/40 border-slate-700/50 text-slate-200 rounded-tr-none' 
                    : 'bg-cyan-950/20 border-cyan-500/20 text-cyan-100 rounded-tl-none shadow-[0_0_30px_rgba(0,243,255,0.05)]'
                }`}>
                    <div className="text-[10px] font-bold mb-2 opacity-50 tracking-widest uppercase flex items-center gap-2">
                        {msg.role === 'user' ? (
                            <>SHADOWS <div className="w-1 h-1 bg-slate-500 rounded-full"></div></>
                        ) : (
                            <><div className="w-1 h-1 bg-cyan-400 rounded-full"></div> NOTICE</>
                        )}
                    </div>
                    <div className="font-mono text-sm leading-7 whitespace-pre-wrap">
                        {msg.content}
                    </div>
                </div>
            </div>
        ))}

        {isThinking && (
            <div className="flex justify-start w-full">
                <div className="p-6 rounded-2xl rounded-tl-none border border-cyan-500/20 bg-cyan-950/10 flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-150"></div>
                    <span className="text-xs font-mono text-cyan-500 ml-2 tracking-widest">CALCULATING</span>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="p-6 z-20">
        <div className="glass-panel rounded-full p-2 flex items-center gap-4 px-6 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
            <button onClick={() => setIsMuted(!isMuted)} className="text-slate-500 hover:text-cyan-400 transition-colors">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <input 
                type="text" 
                className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder-slate-600"
                placeholder="Enter directive..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCommand()}
                autoFocus
            />

            <button onClick={toggleListening} className={`${isListening ? 'text-red-500 animate-pulse' : 'text-slate-500 hover:text-cyan-400'}`}>
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button onClick={handleCommand} disabled={isThinking} className="w-10 h-10 rounded-full bg-cyan-500/20 hover:bg-cyan-500/40 flex items-center justify-center text-cyan-300 transition-all">
                <Send className="w-4 h-4" />
            </button>
        </div>
      </div>

    </div>
  );
};

export default OmniShell;
