
import React, { useState, useEffect, useRef } from 'react';
import { NexusStatus } from '../types';
import { NexusClient } from '../services/nexusClient';
import { socketService } from '../services/socketService';
import { Send, Mic, MicOff, Volume2, VolumeX, Sparkles, FileCode, Terminal, AlertOctagon, CheckCircle, Zap, BrainCircuit, Eye, X, ScanEye } from 'lucide-react';

// Fix for missing ImageCapture type definition
declare class ImageCapture {
  constructor(track: MediaStreamTrack);
  grabFrame(): Promise<ImageBitmap>;
}

interface OmniShellProps {
  status: NexusStatus;
}

const OmniShell: React.FC<OmniShellProps> = ({ status }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{role: string, content: string, meta?: any, image?: string}[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [ghostText, setGhostText] = useState(''); // TACHYON PREDICTION
  
  // PROTOCOL OCULUS (VISION)
  const [visionImage, setVisionImage] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- SYMBIOSIS LINK ---
  useEffect(() => {
      const socket = socketService.getSocket();
      if (socket) {
          // Listen for Tachyon Predictions
          socket.on('tachyon_prediction', (data: any) => {
              if (data.original === input && data.prediction.startsWith(input)) {
                  setGhostText(data.prediction);
              } else {
                  setGhostText('');
              }
          });
      }
      return () => {
          socket?.off('tachyon_prediction');
      };
  }, [input]);

  const speak = (text: string) => { 
      if(!isMuted) {
          try {
              // Synthetic Voice of Ciel
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.rate = 1.1; 
              utterance.pitch = 0.9;
              window.speechSynthesis.speak(utterance);
          } catch(e) { /* ignore */ }
      } 
  };

  const toggleListening = () => { setIsListening(!isListening); };

  // --- PROTOCOL OCULUS: SCREEN CAPTURE ---
  const handleOculusCapture = async () => {
      try {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const videoTrack = stream.getVideoTracks()[0];
          
          const imageCapture = new ImageCapture(videoTrack);
          const bitmap = await imageCapture.grabFrame();
          
          // Draw to canvas to convert to base64
          const canvas = document.createElement('canvas');
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(bitmap, 0, 0);
          
          const base64Image = canvas.toDataURL('image/png');
          
          // Stop stream immediately to close browser warning
          videoTrack.stop();
          
          setVisionImage(base64Image);
          
      } catch (e) {
          console.error("Oculus Capture Failed:", e);
      }
  };

  const clearVision = () => {
      setVisionImage(null);
  };

  const handleCommand = async () => {
    const cmd = ghostText || input; // Allow sending ghost text even if not fully typed
    if (!cmd.trim() && !visionImage) return;
    
    setInput('');
    setGhostText('');
    setHistory(prev => [...prev, { role: 'user', content: cmd, image: visionImage || undefined }]);
    const currentImage = visionImage;
    setVisionImage(null); // Clear buffer
    setIsThinking(true);
    
    // Play SFX
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.m4a'); // Sci-fi click
    audio.volume = 0.2;
    audio.play().catch(() => {});

    const response = await NexusClient.sendCommand(cmd, history, currentImage);
    
    setHistory(prev => [...prev, { role: response.role, content: response.content, meta: response.meta }]);
    setIsThinking(false);
    
    if (response.role === 'model' && response.content) {
        // Only speak short summaries or crucial info
        if (response.content.length < 200) speak(response.content);
        else speak("Directive executed.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Tab' && ghostText) {
          e.preventDefault();
          setInput(ghostText); // Accept prophecy
          setGhostText('');
      }
      if (e.key === 'Enter') {
          handleCommand();
      }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // RENDER ACTION CARDS
  const renderActionCard = (meta: any) => {
      if (!meta) return null;

      if (meta.files && meta.files.length > 0) {
          return (
              <div className="mt-4 bg-emerald-900/10 border border-emerald-500/30 rounded-r-lg border-l-4 border-l-emerald-500 p-4 animate-in slide-in-from-left-4">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <FileCode className="w-4 h-4" />
                      <span className="text-xs font-bold font-mono tracking-widest">REALITY FORGED</span>
                  </div>
                  <div className="space-y-1">
                      {meta.files.map((file: string, i: number) => (
                          <div key={i} className="text-[10px] font-mono text-emerald-200/80 px-2 py-1 flex items-center justify-between">
                              <span>{file}</span>
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                          </div>
                      ))}
                  </div>
              </div>
          );
      }

      if (meta.intent === 'EXECUTION_STARTED' || meta.intervention) {
           return (
              <div className="mt-4 bg-purple-900/10 border border-purple-500/30 rounded-r-lg border-l-4 border-l-purple-500 p-4 animate-pulse">
                  <div className="flex items-center gap-2 text-purple-400 mb-2">
                      <Terminal className="w-4 h-4" />
                      <span className="text-xs font-bold font-mono tracking-widest">SYSTEM OVERRIDE</span>
                  </div>
                  <div className="text-xs font-mono text-purple-200/70">
                      Orchestrator has seized control of local resources.
                  </div>
              </div>
           );
      }
      return null;
  };

  return (
    <div className="w-full h-full flex flex-col relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
      
      {/* BACKGROUND PULSE (Contextual) */}
      {isThinking && (
          <div className="absolute inset-0 bg-cyan-500/5 animate-pulse pointer-events-none z-0"></div>
      )}

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 z-10">
        {history.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-40 select-none pointer-events-none">
                <div className="w-32 h-32 rounded-full border border-cyan-500/10 flex items-center justify-center mb-6 animate-[spin-slow_20s_linear_infinite]">
                    <div className="w-24 h-24 rounded-full border border-cyan-500/20 flex items-center justify-center animate-[spin-slow_15s_linear_infinite_reverse]">
                        <BrainCircuit className="w-10 h-10 text-cyan-400 animate-pulse" />
                    </div>
                </div>
                <h2 className="text-4xl font-[Rajdhani] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent tracking-[0.5em]">CIEL</h2>
                <p className="text-xs font-mono text-cyan-500/50 mt-4 tracking-[0.8em]">AWAITING NEURAL INPUT</p>
            </div>
        )}

        {history.map((msg, idx) => (
            <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`relative max-w-[80%] p-6 backdrop-blur-md border transition-all duration-500 group ${
                    msg.role === 'user' 
                    ? 'bg-slate-900/60 border-slate-700/50 text-slate-200 rounded-2xl rounded-tr-none' 
                    : 'bg-[#050a14]/80 border-cyan-500/20 text-cyan-100 rounded-2xl rounded-tl-none shadow-[0_0_30px_rgba(0,243,255,0.02)]'
                }`}>
                    {/* Decorative Elements */}
                    <div className={`absolute top-0 w-4 h-1 ${msg.role === 'user' ? 'right-0 bg-slate-500' : 'left-0 bg-cyan-500'}`}></div>

                    <div className="text-[9px] font-bold mb-3 opacity-40 tracking-[0.2em] font-mono flex items-center gap-2">
                        {msg.role === 'user' ? 'SHADOW // ORIGIN' : 'CIEL // RESPONSE'}
                    </div>
                    
                    {msg.image && (
                        <div className="mb-4 rounded-lg overflow-hidden border border-slate-700/50">
                            <img src={msg.image} alt="Oculus Capture" className="max-w-full h-auto opacity-80" />
                        </div>
                    )}

                    <div className="font-mono text-sm leading-7 whitespace-pre-wrap selection:bg-cyan-500/30 selection:text-white">
                        {msg.content}
                    </div>

                    {renderActionCard(msg.meta)}
                </div>
            </div>
        ))}

        {isThinking && (
            <div className="flex justify-start w-full">
                <div className="px-6 py-4 rounded-full border border-cyan-500/20 bg-cyan-950/10 flex items-center gap-4">
                    <div className="flex gap-1 h-3 items-end">
                        <div className="w-1 bg-cyan-400 animate-[bounce_1s_infinite] h-full"></div>
                        <div className="w-1 bg-cyan-400 animate-[bounce_1s_infinite_0.2s] h-2"></div>
                        <div className="w-1 bg-cyan-400 animate-[bounce_1s_infinite_0.4s] h-full"></div>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-500 tracking-widest animate-pulse">
                        {visionImage ? 'ANALYZING VISUAL SPECTRUM...' : 'COMPUTING OUTCOME...'}
                    </span>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT HUD */}
      <div className="p-6 z-20 relative">
        {/* Ghost Text Overlay (Visual only, behind input) */}
        {ghostText && input && ghostText.startsWith(input) && (
            <div className="absolute left-[88px] top-[42px] text-slate-600 font-mono text-sm pointer-events-none z-30 select-none flex items-center">
                <span className="opacity-0">{input}</span>
                <span className="opacity-50">{ghostText.substring(input.length)}</span>
                <span className="ml-4 text-[9px] text-cyan-500/50 border border-cyan-500/20 px-1 rounded animate-pulse">TAB</span>
            </div>
        )}

        {/* VISION PREVIEW */}
        {visionImage && (
            <div className="absolute bottom-24 left-10 w-32 h-24 bg-black border border-cyan-500/50 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(0,243,255,0.2)] animate-appear group">
                <img src={visionImage} className="w-full h-full object-cover opacity-80" />
                <button onClick={clearVision} className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 w-full bg-cyan-900/80 text-[8px] text-center text-cyan-300 font-mono py-0.5 flex items-center justify-center gap-1">
                    <ScanEye className="w-3 h-3" /> OCULUS
                </div>
            </div>
        )}

        <div className={`glass-panel rounded-full p-2 flex items-center gap-4 px-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-t border-white/10 transition-all duration-300 ${isThinking ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(0,243,255,0.1)]' : ''}`}>
            
            {/* TOOLKIT */}
            <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                <button onClick={() => setIsMuted(!isMuted)} className="text-slate-500 hover:text-cyan-400 transition-colors">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                
                {/* OCULUS BUTTON */}
                <button onClick={handleOculusCapture} className={`text-slate-500 hover:text-purple-400 transition-colors ${visionImage ? 'text-purple-400 animate-pulse' : ''}`} title="PROTOCOL: OCULUS (Screen Capture)">
                    <Eye className="w-5 h-5" />
                </button>
            </div>

            <input 
                ref={inputRef}
                type="text" 
                className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder-slate-600 z-40 relative"
                placeholder={isThinking ? "SYSTEM BUSY..." : visionImage ? "DESCRIBE TARGET..." : "ENTER DIRECTIVE //"}
                value={input}
                onChange={(e) => {
                    setInput(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                autoFocus
                disabled={isThinking}
            />

            <button onClick={toggleListening} className={`${isListening ? 'text-red-500 animate-pulse shadow-[0_0_10px_red]' : 'text-slate-500 hover:text-cyan-400'} rounded-full p-1 transition-all`}>
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button 
                onClick={handleCommand} 
                disabled={isThinking || (!input && !ghostText && !visionImage)} 
                className={`w-12 h-12 -mr-2 rounded-full flex items-center justify-center transition-all duration-300 ${input || ghostText || visionImage ? 'bg-cyan-500 text-black shadow-[0_0_20px_#00f3ff] scale-105' : 'bg-white/5 text-slate-500'}`}
            >
                {isThinking ? <Zap className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
        </div>
      </div>

    </div>
  );
};

export default OmniShell;
