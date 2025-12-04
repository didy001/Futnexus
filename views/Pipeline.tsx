import React, { useState } from 'react';
import { generateBlueprint } from '../services/geminiService';
import { ArrowRight, CheckCircle, Code, Database, FileText, Play, Loader2 } from 'lucide-react';

const Pipeline: React.FC = () => {
  const [intention, setIntention] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(1);

  const handleGenerate = async () => {
    if (!intention) return;
    setIsGenerating(true);
    try {
        const result = await generateBlueprint(intention);
        const parsed = JSON.parse(result);
        setBlueprint(parsed);
        setActiveStep(2);
    } catch (e) {
        console.error("Failed to parse blueprint", e);
    } finally {
        setIsGenerating(false);
    }
  };

  const steps = [
    { id: 1, label: 'INTENTION', icon: FileText },
    { id: 2, label: 'BLUEPRINT', icon: Code },
    { id: 3, label: 'AGENTS', icon: Database },
    { id: 4, label: 'EXECUTION', icon: Play },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Progress Bar */}
      <div className="flex justify-between items-center relative mb-12">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -z-10 rounded-full"></div>
        {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = activeStep > step.id;
            const isCurrent = activeStep === step.id;
            
            return (
                <div key={step.id} className="flex flex-col items-center bg-slate-950 px-4">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 transition-all ${
                        isCompleted ? 'bg-emerald-900/20 border-emerald-500 text-emerald-500' :
                        isCurrent ? 'bg-indigo-900/20 border-indigo-500 text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' :
                        'bg-slate-900 border-slate-700 text-slate-600'
                    }`}>
                        {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <span className={`font-mono text-xs font-bold tracking-wider ${isCurrent ? 'text-white' : 'text-slate-500'}`}>
                        {step.label}
                    </span>
                </div>
            )
        })}
      </div>

      {/* Step 1: Intention */}
      {activeStep === 1 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-light text-white mb-6">DEFINE INTENTION</h2>
            <div className="space-y-4">
                <p className="text-slate-400 text-sm">Describe the system, module, or value you wish Nexus to construct. Be specific about constraints and goals.</p>
                <textarea 
                    className="w-full h-40 bg-slate-950 border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all"
                    placeholder="// Enter system requirements here..."
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                />
                <div className="flex justify-end">
                    <button 
                        onClick={handleGenerate}
                        disabled={!intention || isGenerating}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-mono text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Code className="w-4 h-4" />}
                        GENERATE BLUEPRINT
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Step 2: Blueprint Result */}
      {activeStep === 2 && blueprint && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 space-y-8">
              <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-light text-white">GENERATED BLUEPRINT</h2>
                  <span className="text-xs font-mono text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded bg-emerald-900/20">VALID JSON</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-slate-950 p-6 rounded-lg border border-slate-800">
                    <h3 className="text-indigo-400 font-mono text-sm mb-2">CONCEPT</h3>
                    <p className="text-slate-300 text-sm">{blueprint.concept}</p>
                 </div>
                 <div className="bg-slate-950 p-6 rounded-lg border border-slate-800">
                    <h3 className="text-purple-400 font-mono text-sm mb-2">CONSCIENCE</h3>
                    <p className="text-slate-300 text-sm">{blueprint.conscience}</p>
                 </div>
              </div>

              <div className="bg-slate-950 p-6 rounded-lg border border-slate-800">
                  <h3 className="text-emerald-400 font-mono text-sm mb-4">CONSTRUCTION PROTOCOL</h3>
                  <div className="space-y-4">
                      <div>
                          <span className="text-xs text-slate-500 uppercase">Agents Required</span>
                          <div className="flex gap-2 flex-wrap mt-2">
                              {blueprint.construction?.agents_required?.map((agent: string, i: number) => (
                                  <span key={i} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 border border-slate-700">{agent}</span>
                              ))}
                          </div>
                      </div>
                      <div>
                          <span className="text-xs text-slate-500 uppercase">Execution Steps</span>
                          <ul className="list-decimal list-inside mt-2 space-y-1 text-sm text-slate-300 font-mono">
                              {blueprint.construction?.steps?.map((step: string, i: number) => (
                                  <li key={i}>{step}</li>
                              ))}
                          </ul>
                      </div>
                  </div>
              </div>

              <div className="flex justify-end gap-4">
                  <button onClick={() => setActiveStep(1)} className="px-6 py-3 text-slate-400 hover:text-white font-mono text-sm">BACK</button>
                  <button onClick={() => setActiveStep(3)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-mono text-sm font-bold transition-all">
                      INITIALIZE AGENTS <ArrowRight className="w-4 h-4" />
                  </button>
              </div>
          </div>
      )}

      {/* Step 3: Agents (Placeholder for demo) */}
      {activeStep === 3 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 backdrop-blur-md animate-in fade-in text-center space-y-6">
              <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto flex items-center justify-center animate-pulse">
                  <Database className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-xl text-white">PROVISIONING RESOURCES...</h2>
              <p className="text-slate-400">Deploying Docker containers via ORBSTACK.AGENT.<br/>Configuring Langflow workflows.</p>
              <div className="w-full max-w-md mx-auto h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-2/3 animate-[pulse_2s_infinite]"></div>
              </div>
              <button onClick={() => setActiveStep(1)} className="mt-8 text-xs font-mono text-slate-500 hover:text-white underline">RESET SIMULATION</button>
          </div>
      )}
    </div>
  );
};

export default Pipeline;
