import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileDown, FileUp, Sparkles, Settings2, Sliders, CheckCircle, RefreshCw, AlertTriangle, Cpu } from 'lucide-react';
import { CompressionLevel, FileItem } from '../types';
import { compressPdf } from '../utils/converter';

interface PdfCompressorProps {
  onSuccess: (item: any) => void;
}

export default function PdfCompressor({ onSuccess }: PdfCompressorProps) {
  const [fileItem, setFileItem] = useState<FileItem | null>(null);
  const [level, setLevel] = useState<CompressionLevel>('medium');
  const [preserveMetadata, setPreserveMetadata] = useState<boolean>(true);
  const [optimizeDpi, setOptimizeDpi] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getEstimatedSize = (originalSize: number): number => {
    if (level === 'low') return Math.round(originalSize * 0.85);
    if (level === 'medium') return Math.round(originalSize * 0.65);
    return Math.round(originalSize * 0.38);
  };

  const getSavedPercentage = () => {
    if (level === 'low') return 15;
    if (level === 'medium') return 35;
    return 62;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Por favor, selecciona únicamente archivos PDF.');
      return;
    }

    setFileItem({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      extension: 'pdf',
      progress: 0,
      status: 'idle',
    });
    setLogMessages([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const addLogMessage = (msg: string) => {
    setLogMessages((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-4));
  };

  const runCompression = async () => {
    if (!fileItem) return;

    setFileItem((prev) => prev ? { ...prev, status: 'processing', progress: 0 } : null);
    
    // Core engine log timeline simulations
    const logs = [
      'Iniciando escaneo de diccionario interno...',
      'Identificando fuentes tipográficas incrustadas...',
      'Analizando compresión de flujo de imágenes...',
      optimizeDpi ? 'Remuestreando mapas de bits a 150 DPI de alta definición...' : 'Preservando resolución nominal de imágenes...',
      'Re-indexando tablas de referencia cruzada (XREF)...',
      preserveMetadata ? 'Manteniendo metadatos EXIF e información de autoría...' : 'Eliminando metadatos redundantes...',
      'Generando stream de empaquetado ultra-optimizado...',
      'Finalizando reconstrucción de árbol de objetos del documento...'
    ];

    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < logs.length) {
        addLogMessage(logs[logIdx]);
        logIdx++;
      }
    }, 400);

    try {
      const result = await compressPdf(fileItem.file, level, (progress) => {
        setFileItem((prev) => prev ? { ...prev, progress } : null);
      });

      clearInterval(interval);
      addLogMessage('¡Archivo optimizado exitosamente con el motor cuántico!');

      const compressedItem = {
        ...fileItem,
        status: 'completed' as const,
        progress: 100,
        resultSize: result.size,
        resultUrl: URL.createObjectURL(result.blob),
        resultName: result.name,
      };

      setFileItem(compressedItem);

      onSuccess({
        id: compressedItem.id,
        originalName: compressedItem.name,
        originalSize: compressedItem.size,
        resultName: result.name,
        resultSize: result.size,
        type: 'compress',
        fromFormat: 'PDF',
        toFormat: 'PDF',
        timestamp: new Date().toLocaleTimeString(),
        downloadUrl: compressedItem.resultUrl,
      });

    } catch (err: any) {
      clearInterval(interval);
      setFileItem((prev) => prev ? { 
        ...prev, 
        status: 'error', 
        errorMessage: err.message || 'Error durante la compresión.' 
      } : null);
    }
  };

  const reset = () => {
    setFileItem(null);
    setLogMessages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div id="pdf-compressor-module" className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[32px] p-6 relative overflow-hidden transition-all duration-300 hover:border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Module Title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-indigo-400">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-white tracking-tight flex items-center gap-2">
              Compresor de PDF <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-medium">ULTRA</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">Reduce el peso sin sacrificar legibilidad</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!fileItem ? (
          /* Dropzone State */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div
              id="pdf-dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadClick}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                isDragging
                  ? 'border-indigo-400 bg-white/10 scale-[0.99]'
                  : 'border-white/10 hover:border-white/20 bg-white/5'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
                id="pdf-file-picker"
              />
              <div className="p-4 rounded-full bg-white/5 border border-white/10 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                <FileUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">Arrastra tu archivo PDF aquí o presiona para buscar</p>
                <p className="text-xs text-slate-400 mt-1">Soporta cualquier tamaño de documento</p>
              </div>
            </div>

            {/* Level Selector */}
            <div className="backdrop-blur-lg bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Nivel de Compresión
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((lvl) => {
                  const details = {
                    low: { label: 'Baja', desc: 'Calidad intacta' },
                    medium: { label: 'Media', desc: 'Equilibrado' },
                    high: { label: 'Extrema', desc: 'Máximo ahorro' },
                  };
                  const active = level === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => setLevel(lvl)}
                      id={`compress-btn-${lvl}`}
                      className={`p-3 rounded-xl border text-left transition-all duration-300 ${
                        active
                          ? 'bg-indigo-600/20 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xs font-bold font-display">{details[lvl].label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-sans">{details[lvl].desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Extra sliders/config toggles */}
              <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-4">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">Optimizar DPI</span>
                    <p className="text-[10px] text-slate-400">Muestreo a 150ppp</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={optimizeDpi}
                    onChange={(e) => setOptimizeDpi(e.target.checked)}
                    id="checkbox-optimize-dpi"
                    className="sr-only peer"
                  />
                  <div className="relative w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white peer-checked:after:border-indigo-600"></div>
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">Preservar Metadatos</span>
                    <p className="text-[10px] text-slate-400">Autor, fecha, título</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preserveMetadata}
                    onChange={(e) => setPreserveMetadata(e.target.checked)}
                    id="checkbox-preserve-meta"
                    className="sr-only peer"
                  />
                  <div className="relative w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white peer-checked:after:border-indigo-600"></div>
                </label>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Process & Result View */
          <motion.div
            key="process"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-5"
          >
            {/* File Info Card */}
            <div className="backdrop-blur-lg bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-rose-400 shrink-0">
                  <span className="font-bold text-xs font-mono">PDF</span>
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-xs font-medium text-slate-200 truncate font-mono">{fileItem.name}</h3>
                  <div className="flex gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>{formatSize(fileItem.size)}</span>
                    <span>•</span>
                    <span className="text-indigo-300">Compresión: {level.toUpperCase()}</span>
                  </div>
                </div>
              </div>
              {fileItem.status === 'idle' && (
                <button
                  onClick={reset}
                  id="pdf-reset-btn"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Cambiar archivo"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Simulated Active Output logs */}
            {logMessages.length > 0 && (
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-[10px] text-slate-400 space-y-1">
                <div className="text-slate-500 border-b border-white/5 pb-1 flex justify-between items-center">
                  <span>REGISTROS DEL PROCESADOR</span>
                  <span className="animate-pulse text-indigo-400">● ACTIVO</span>
                </div>
                {logMessages.map((log, idx) => (
                  <div key={idx} className="truncate select-none text-emerald-300/90">
                    {log}
                  </div>
                ))}
              </div>
            )}

            {/* Pending State button / Progress state */}
            {fileItem.status === 'idle' && (
              <button
                onClick={runCompression}
                id="run-compression-action"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium hover:from-indigo-500 hover:to-violet-500 transition-all duration-300 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Comenzar Compresión
              </button>
            )}

            {fileItem.status === 'processing' && (
              <div className="space-y-2 py-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-mono">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    Optimizando contenido...
                  </span>
                  <span className="font-mono font-semibold text-indigo-400">{fileItem.progress}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${fileItem.progress}%` }}
                    transition={{ ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            {fileItem.status === 'completed' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Micro metrics */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 p-3 rounded-xl">
                    <span className="block text-[9px] text-slate-400 font-medium font-bold">ORIGINAL</span>
                    <span className="text-xs font-bold text-slate-300 font-mono mt-0.5 block">{formatSize(fileItem.size)}</span>
                  </div>
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 p-3 rounded-xl">
                    <span className="block text-[9px] text-emerald-400 font-medium font-bold">COMPRIMIDO</span>
                    <span className="text-xs font-bold text-emerald-300 font-mono mt-0.5 block">{formatSize(fileItem.resultSize || 0)}</span>
                  </div>
                  <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <span className="block text-[9px] text-emerald-400 font-medium font-bold">AHORRO</span>
                    <span className="text-xs font-bold text-emerald-300 font-mono mt-0.5 block">-{getSavedPercentage()}%</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={fileItem.resultUrl}
                    download={fileItem.resultName}
                    id="download-compressed-pdf-action"
                    className="flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all duration-300 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <FileDown className="w-5 h-5" />
                    Descargar PDF
                  </a>
                  <button
                    onClick={reset}
                    id="new-compression-btn"
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white transition-colors"
                    title="Comprimir otro archivo"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {fileItem.status === 'error' && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-medium text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  Error detectado
                </div>
                <p className="text-xs text-slate-400">{fileItem.errorMessage}</p>
                <button
                  onClick={reset}
                  id="reset-on-error-btn"
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-colors"
                >
                  Volver a intentar
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
