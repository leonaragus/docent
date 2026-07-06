import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, ShieldCheck, Cpu, HardDrive, Layers, Zap, CheckCircle } from 'lucide-react';
import PdfCompressor from './Docs/PdfCompressor';
import DocConverter from './Docs/DocConverter';
import HistoryLog from './Docs/HistoryLog';

import { ProcessingHistoryItem } from './Docs/types';
import { useLanguage } from '../contexts/LanguageContext';

export default function DocentDocs() {
  const { lang, setLang } = useLanguage();
  const isEn = lang === 'en';

  const [history, setHistory] = useState<ProcessingHistoryItem[]>([]);
  const [totalSavedBytes, setTotalSavedBytes] = useState<number>(0);
  const [currentUtcTime, setCurrentUtcTime] = useState<string>('');
  
  // Watermark state (The Killer Feature)
  const [applyWatermark, setApplyWatermark] = useState<boolean>(true);
  const [brandName, setBrandName] = useState<string | null>(null);

  useEffect(() => {
    // Check if brand exists in Nexus
    const savedBrand = localStorage.getItem('docent_nexus_brand');
    if (savedBrand) {
      try {
        const brand = JSON.parse(savedBrand);
        setBrandName(brand.name);
      } catch(e) {}
    }

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
    <div className="flex-1 w-full bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden relative">
      
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Upper Brand Bar */}
      <header className="backdrop-blur-md bg-slate-900/50 border-b border-slate-800 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-lg blur opacity-40 animate-pulse"></div>
              <div className="relative bg-slate-900 border border-slate-700 p-2 rounded-lg flex items-center justify-center text-emerald-400">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="font-display font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                DOCENT <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold uppercase">PDF TOOLKIT</span>
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">{isEn ? 'PDF Converter & Compressor' : 'Compresor y Convertidor PDF'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 font-mono text-[10px]">
            {/* Language Selector Selector */}
            <div className="flex items-center gap-2 text-slate-300 bg-slate-900/50 border border-slate-800 px-3 py-1 rounded-full">
              <span className="text-indigo-400 font-bold">{isEn ? 'LANG:' : 'IDIOMA:'}</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                className="bg-transparent text-[10px] font-bold text-white outline-none cursor-pointer uppercase border-0 p-0 focus:ring-0"
              >
                <option value="es" className="bg-slate-950 text-white">ES</option>
                <option value="en" className="bg-slate-950 text-white">EN</option>
              </select>
            </div>

            <div className="hidden md:flex items-center gap-2 text-slate-300 bg-slate-900/50 border border-slate-800 px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isEn ? 'UTC TIME:' : 'UTC HORA:'}</span>
              <span className="text-white font-bold">{currentUtcTime || '...'}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300 bg-slate-900/50 border border-slate-800 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{isEn ? 'PRIVACY:' : 'PRIVACIDAD:'}</span>
              <span className="text-emerald-400 font-bold">{isEn ? '100% LOCAL' : '100% LOCAL'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 z-10 relative">
        <section className="text-center max-w-3xl mx-auto space-y-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-medium text-emerald-300"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>{isEn ? 'Next-Generation File Processing' : 'Procesamiento de Archivos de Última Generación'}</span>
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight text-white leading-tight">
            {isEn ? 'Compress and Convert your PDFs' : 'Comprime y Convierte tus PDFs'} <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              {isEn ? '100% locally and securely' : '100% local y seguro'}
            </span>
          </h1>

          {brandName && (
            <div className="mt-6 flex flex-col items-center justify-center gap-2">
              <div 
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer transition-all ${
                  applyWatermark ? 'bg-indigo-900/30 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-900 border-slate-800 opacity-60'
                }`}
                onClick={() => setApplyWatermark(!applyWatermark)}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${applyWatermark ? 'bg-indigo-500 border-indigo-400' : 'border-slate-600'}`}>
                  {applyWatermark && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="text-left">
                  <span className="block text-[11px] font-bold text-slate-300 uppercase tracking-widest">{isEn ? 'Intellectual Property Protection' : 'Protección de Propiedad Intelectual'}</span>
                  <span className="block text-sm text-indigo-300 font-medium">{isEn ? 'Auto-stamp watermark:' : 'Auto-estampar marca de agua:'} <strong className="text-white">{brandName}</strong></span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto pt-6 font-mono text-left">
            <div className="backdrop-blur-lg bg-slate-900/50 border border-slate-800 p-3.5 rounded-2xl">
              <span className="text-[9px] text-indigo-400 block uppercase font-bold tracking-wider">{isEn ? 'Operations' : 'Operaciones'}</span>
              <span className="text-lg font-bold text-white block mt-0.5">{history.length}</span>
            </div>
            <div className="backdrop-blur-lg bg-slate-900/50 border border-slate-800 p-3.5 rounded-2xl">
              <span className="text-[9px] text-emerald-400 block uppercase font-bold tracking-wider">{isEn ? 'Weight Saved' : 'Peso Ahorrado'}</span>
              <span className="text-lg font-bold text-emerald-300 block mt-0.5">{formatSize(totalSavedBytes)}</span>
            </div>
            <div className="backdrop-blur-lg bg-slate-900/50 border border-slate-800 p-3.5 rounded-2xl">
              <span className="text-[9px] text-indigo-300 block uppercase font-bold tracking-wider">{isEn ? 'Core Engine' : 'Motor Core'}</span>
              <span className="text-lg font-bold text-white block mt-0.5">{isEn ? 'Automatic' : 'Automático'}</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8 flex flex-col justify-start">
            <PdfCompressor onSuccess={handleProcessSuccess} applyWatermark={applyWatermark} />
            <HistoryLog items={history} onClear={handleClearHistory} />
          </div>
          <div className="space-y-8 flex flex-col justify-start">
            <DocConverter onSuccess={handleProcessSuccess} applyWatermark={applyWatermark} />
          </div>
        </div>


      </main>

      <footer className="backdrop-blur-md bg-slate-900/50 border-t border-slate-800 py-6 text-center text-[10px] text-slate-400 mt-16 font-mono uppercase tracking-widest z-10 relative">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-left">
            <Cpu className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{isEn ? 'DOCENT Suite - PDF Compressor & Converter Toolkit.' : 'DOCENT Suite - Toolkit de Compresión y Conversión PDF.'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-indigo-400" /> {isEn ? 'Zero Storage' : 'Almacenamiento Cero'}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400"><Zap className="w-3.5 h-3.5 text-emerald-400" /> {isEn ? 'Local Acceleration' : 'Aceleración Local'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
