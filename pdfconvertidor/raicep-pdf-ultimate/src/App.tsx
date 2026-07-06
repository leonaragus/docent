import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Clock, ShieldCheck, Cpu, HardDrive, RefreshCw, Layers, Zap } from 'lucide-react';
import PdfCompressor from './components/PdfCompressor';
import DocConverter from './components/DocConverter';
import HistoryLog from './components/HistoryLog';
import InnovationHub from './components/InnovationHub';
import { ProcessingHistoryItem } from './types';

export default function App() {
  const [history, setHistory] = useState<ProcessingHistoryItem[]>([]);
  const [totalSavedBytes, setTotalSavedBytes] = useState<number>(0);
  const [currentUtcTime, setCurrentUtcTime] = useState<string>('');

  // Clock Ticker to display the user's real time dynamically
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentUtcTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleProcessSuccess = (item: ProcessingHistoryItem) => {
    setHistory((prev) => [item, ...prev]);
    if (item.type === 'compress') {
      const saved = item.originalSize - item.resultSize;
      if (saved > 0) {
        setTotalSavedBytes((prev) => prev + saved);
      }
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    setTotalSavedBytes(0);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div id="main-container" className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden relative">
      
      {/* Background Mesh Gradients from Frosted Glass template */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Upper Navigation / Status bar with Frosted Glass styling */}
      <header id="app-header" className="backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-lg blur opacity-40 animate-pulse"></div>
              <div className="relative bg-white/5 border border-white/10 p-2 rounded-lg flex items-center justify-center text-emerald-400">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="font-display font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                RAICEP <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold uppercase">PDF ULTIMATE</span>
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">NEXT-GEN DOCUMENT CONVERTER</span>
            </div>
          </div>

          {/* Clock, Status and Key system Metrics */}
          <div className="flex items-center gap-4 sm:gap-6 font-mono text-[10px]">
            <div className="hidden md:flex items-center gap-2 text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>UTC HORA:</span>
              <span className="text-white font-bold">{currentUtcTime || '...'}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">PRIVACIDAD:</span>
              <span className="text-emerald-400 font-bold">100% LOCAL</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold hidden sm:inline text-[10px]">OPERATIVO</span>
            </div>
          </div>

        </div>
      </header>

      {/* Hero / Dashboard overview info bar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 z-10 relative">
        
        <section id="hero-section" className="text-center max-w-3xl mx-auto space-y-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-medium text-emerald-300"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Procesamiento de Archivos de Última Generación</span>
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-white leading-tight">
            Optimiza y Convierte Documentos <br />
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              con Tecnología Frosted Glass
            </span>
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-sans">
            Comprime archivos PDF de forma inteligente o transcodifica imágenes, tablas y estructuras de datos de manera automatizada. Todo procesado directamente en tu navegador con cifrado de alto nivel.
          </p>

          {/* Quick Metrics Cards Row (using Frosted Glass style) */}
          <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto pt-4 font-mono text-left">
            <div className="backdrop-blur-lg bg-white/5 border border-white/10 p-3.5 rounded-2xl">
              <span className="text-[9px] text-indigo-400 block uppercase font-bold tracking-wider">Operaciones</span>
              <span className="text-lg font-bold text-white block mt-0.5">{history.length}</span>
            </div>
            <div className="backdrop-blur-lg bg-white/5 border border-white/10 p-3.5 rounded-2xl">
              <span className="text-[9px] text-emerald-400 block uppercase font-bold tracking-wider">Peso Ahorrado</span>
              <span className="text-lg font-bold text-emerald-300 block mt-0.5">{formatSize(totalSavedBytes)}</span>
            </div>
            <div className="backdrop-blur-lg bg-white/5 border border-white/10 p-3.5 rounded-2xl">
              <span className="text-[9px] text-indigo-300 block uppercase font-bold tracking-wider">Motor Core</span>
              <span className="text-lg font-bold text-white block mt-0.5">Automático</span>
            </div>
          </div>
        </section>

        {/* Workspace grid: Compressor & Converter side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Compressor + History */}
          <div className="space-y-8 flex flex-col justify-start">
            <PdfCompressor onSuccess={handleProcessSuccess} />
            <HistoryLog items={history} onClear={handleClearHistory} />
          </div>

          {/* Right Column: Converter */}
          <div className="space-y-8 flex flex-col justify-start">
            <DocConverter onSuccess={handleProcessSuccess} />
          </div>

        </div>

        {/* Interactive Innovation Hub Section */}
        <section id="innovation-hub-container" className="pt-6 border-t border-white/10">
          <InnovationHub />
        </section>

      </main>

      {/* Footer info and security badge */}
      <footer id="app-footer" className="backdrop-blur-md bg-white/5 border-t border-white/10 py-6 text-center text-[10px] text-slate-400 mt-16 font-mono uppercase tracking-widest z-10 relative">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-left">
            <Cpu className="w-4 h-4 text-slate-400 shrink-0" />
            <span>© 2026 Todos los derechos reservados a RAICEP Registro Argentino de Institución y Homologación de Estudios Profesionales.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-indigo-400" /> Almacenamiento Cero</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400"><Zap className="w-3.5 h-3.5 text-emerald-400" /> Aceleración Local</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
