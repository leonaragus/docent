import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, FileDown, ArrowRight, Trash2, Check, Clock } from 'lucide-react';
import { ProcessingHistoryItem } from '../types';

interface HistoryLogProps {
  items: ProcessingHistoryItem[];
  onClear: () => void;
}

export default function HistoryLog({ items, onClear }: HistoryLogProps) {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getSavings = (orig: number, res: number) => {
    if (orig <= res) return null;
    const pct = Math.round(((orig - res) / orig) * 100);
    return `-${pct}%`;
  };

  return (
    <div id="history-log-section" className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[32px] p-6 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white font-display">Historial de Operaciones</h3>
            <p className="text-[10px] text-slate-400 font-mono">Sesión actual</p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={onClear}
            id="clear-history-btn"
            className="text-[10px] text-slate-400 hover:text-red-400 flex items-center gap-1 font-mono transition-colors border border-white/10 hover:border-rose-500/30 px-2 py-1 rounded-lg bg-white/5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            LIMPIAR
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-slate-400 border border-dashed border-white/10 rounded-xl bg-white/5"
            >
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-20 text-slate-400" />
              <p className="text-xs">No hay operaciones registradas aún</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Sube un archivo para iniciar el pipeline</p>
            </motion.div>
          ) : (
            items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/10 p-3.5 rounded-xl flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-lg font-mono font-bold text-[9px] shrink-0 text-center min-w-[50px] ${
                    item.type === 'compress'
                      ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  }`}>
                    {item.type === 'compress' ? 'COMPRESS' : 'CONVERT'}
                  </div>
                  
                  <div className="overflow-hidden space-y-0.5">
                    <div className="text-xs font-mono font-medium text-slate-300 truncate" title={item.originalName}>
                      {item.originalName}
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-400">
                      <span>{formatSize(item.originalSize)}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                      <span className="text-emerald-400 font-bold">{formatSize(item.resultSize)}</span>
                      {getSavings(item.originalSize, item.resultSize) && (
                        <span className="text-emerald-300 font-semibold bg-emerald-500/10 px-1 rounded">
                          {getSavings(item.originalSize, item.resultSize)}
                        </span>
                      )}
                      <span>•</span>
                      <span className="text-slate-500">{item.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    LISTO
                  </span>
                  <a
                    href={item.downloadUrl}
                    download={item.resultName}
                    id={`redownload-history-${item.id}`}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                    title="Descargar de nuevo"
                  >
                    <FileDown className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
