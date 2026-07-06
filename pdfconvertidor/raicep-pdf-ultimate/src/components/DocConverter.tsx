import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileUp, RefreshCw, FileDown, Sparkles, Check, ChevronRight, FileType, Cpu, AlertCircle } from 'lucide-react';
import { FileItem, ConversionFormat } from '../types';
import { convertDocument } from '../utils/converter';

interface DocConverterProps {
  onSuccess: (item: any) => void;
}

const AVAILABLE_FORMATS: ConversionFormat[] = [
  { ext: 'pdf', label: 'Documento PDF (.pdf)', category: 'document' },
  { ext: 'docx', label: 'Word (.docx)', category: 'document' },
  { ext: 'xlsx', label: 'Excel (.xlsx)', category: 'document' },
  { ext: 'png', label: 'Imagen PNG (.png)', category: 'image' },
  { ext: 'jpg', label: 'Imagen JPEG (.jpg)', category: 'image' },
  { ext: 'webp', label: 'Imagen WEBP (.webp)', category: 'image' },
  { ext: 'json', label: 'Estructura JSON (.json)', category: 'data' },
  { ext: 'csv', label: 'Tabla CSV (.csv)', category: 'data' },
  { ext: 'txt', label: 'Texto Plano (.txt)', category: 'text' },
  { ext: 'md', label: 'Markdown (.md)', category: 'text' },
  { ext: 'html', label: 'Código HTML (.html)', category: 'text' },
];

export default function DocConverter({ onSuccess }: DocConverterProps) {
  const [fileItem, setFileItem] = useState<FileItem | null>(null);
  const [targetExt, setTargetExt] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-suggest target format when file is loaded
  useEffect(() => {
    if (fileItem) {
      const sourceExt = fileItem.extension.toLowerCase();
      // Pick a default target that is not the same as source
      const defaultTarget = AVAILABLE_FORMATS.find(f => f.ext !== sourceExt);
      if (defaultTarget) {
        setTargetExt(defaultTarget.ext);
      }
    }
  }, [fileItem]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    
    setFileItem({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      extension: ext || 'dat',
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

  const runConversion = async () => {
    if (!fileItem || !targetExt) return;

    setFileItem((prev) => prev ? { ...prev, status: 'processing', progress: 0 } : null);
    
    // Engine compilation trace
    const logs = [
      `Leyendo estructura del buffer del archivo (formato .${fileItem.extension})...`,
      `Iniciando mapeo de transcodificación a .${targetExt}...`,
      `Normalizando juegos de caracteres y tablas de colores...`,
      `Construyendo árbol sintáctico abstracto (AST) del contenedor...`,
      `Escribiendo firmas de formato y exportando bytes finales...`
    ];

    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < logs.length) {
        addLogMessage(logs[logIdx]);
        logIdx++;
      }
    }, 300);

    try {
      const result = await convertDocument(fileItem.file, targetExt, (progress) => {
        setFileItem((prev) => prev ? { ...prev, progress } : null);
      });

      clearInterval(interval);
      addLogMessage('¡Transcodificación completada con éxito!');

      const convertedItem = {
        ...fileItem,
        status: 'completed' as const,
        progress: 100,
        resultSize: result.size,
        resultUrl: URL.createObjectURL(result.blob),
        resultName: result.name,
      };

      setFileItem(convertedItem);

      onSuccess({
        id: convertedItem.id,
        originalName: convertedItem.name,
        originalSize: convertedItem.size,
        resultName: result.name,
        resultSize: result.size,
        type: 'convert',
        fromFormat: convertedItem.extension.toUpperCase(),
        toFormat: targetExt.toUpperCase(),
        timestamp: new Date().toLocaleTimeString(),
        downloadUrl: convertedItem.resultUrl,
      });

    } catch (err: any) {
      clearInterval(interval);
      setFileItem((prev) => prev ? { 
        ...prev, 
        status: 'error', 
        errorMessage: err.message || 'Error en la conversión.' 
      } : null);
    }
  };

  const reset = () => {
    setFileItem(null);
    setTargetExt('');
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

  // Get compatible output formats based on source format category
  const getCompatibleTargets = () => {
    if (!fileItem) return AVAILABLE_FORMATS;
    const src = fileItem.extension.toLowerCase();
    
    // Grouping compatibility
    if (['png', 'jpg', 'jpeg', 'webp'].includes(src)) {
      // Image to image, or image to PDF/Doc
      return AVAILABLE_FORMATS.filter(f => ['png', 'jpg', 'webp', 'pdf', 'docx'].includes(f.ext) && f.ext !== src);
    }
    if (['json', 'csv'].includes(src)) {
      // Data format conversions
      return AVAILABLE_FORMATS.filter(f => ['json', 'csv', 'txt', 'html', 'pdf', 'xlsx'].includes(f.ext) && f.ext !== src);
    }
    if (['txt', 'md', 'html'].includes(src)) {
      return AVAILABLE_FORMATS.filter(f => ['txt', 'md', 'html', 'pdf', 'docx'].includes(f.ext) && f.ext !== src);
    }
    // Default compatibility (all except the source format itself)
    return AVAILABLE_FORMATS.filter(f => f.ext !== src);
  };

  const compatibleTargets = getCompatibleTargets();

  return (
    <div id="document-converter-module" className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[32px] p-6 relative overflow-hidden transition-all duration-300 hover:border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-indigo-400">
            <FileType className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-white tracking-tight flex items-center gap-2">
              Conversor Universal <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-medium">AUTO</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">Convierte imágenes, textos o tablas automáticamente</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!fileItem ? (
          /* Dropzone state */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div
              id="converter-dropzone"
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
                className="hidden"
                id="converter-file-picker"
              />
              <div className="p-4 rounded-full bg-white/5 border border-white/10 text-indigo-400">
                <FileUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">Sube cualquier tipo de archivo para convertirlo</p>
                <p className="text-xs text-slate-400 mt-1">Soporta PDF, PNG, JPG, WEBP, DOCX, XLSX, TXT, CSV, JSON, MD, etc.</p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Workspace conversion choice & progress */
          <motion.div
            key="workspace"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-5"
          >
            {/* File Source Card */}
            <div className="backdrop-blur-lg bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-indigo-400 font-mono font-bold text-xs shrink-0">
                  .{fileItem.extension.toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-xs font-semibold text-slate-200 truncate font-mono">{fileItem.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{formatSize(fileItem.size)}</p>
                </div>
              </div>
              {fileItem.status === 'idle' && (
                <button
                  onClick={reset}
                  id="converter-reset-btn"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Subir otro archivo"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>

            {fileItem.status === 'idle' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    Selecciona el Formato de Salida
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {compatibleTargets.map((f) => (
                      <button
                        key={f.ext}
                        onClick={() => setTargetExt(f.ext)}
                        id={`target-format-${f.ext}`}
                        className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group ${
                          targetExt === f.ext
                            ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div className="overflow-hidden pr-2">
                          <span className="text-xs font-semibold block group-hover:text-white transition-colors">{f.ext.toUpperCase()}</span>
                          <span className="text-[10px] text-slate-500 block truncate">{f.label}</span>
                        </div>
                        {targetExt === f.ext && (
                          <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={runConversion}
                  disabled={!targetExt}
                  id="run-conversion-action"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium hover:from-indigo-500 hover:to-violet-500 transition-all duration-300 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Convertir Archivo
                </button>
              </div>
            )}

            {fileItem.status === 'processing' && (
              <div className="space-y-4">
                {/* Active logs */}
                {logMessages.length > 0 && (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-[10px] text-slate-400 space-y-1">
                    <div className="text-slate-500 border-b border-white/5 pb-1 flex justify-between items-center">
                      <span>MÓDULO DE TRANSCODIFICACIÓN</span>
                      <span className="animate-pulse text-indigo-400">● CARGANDO</span>
                    </div>
                    {logMessages.map((log, idx) => (
                      <div key={idx} className="truncate select-none text-indigo-300/90">
                        {log}
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-mono">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      Procesando algoritmo...
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
              </div>
            )}

            {fileItem.status === 'completed' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Transformation visual indicator */}
                <div className="backdrop-blur-md bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-center gap-4 font-mono">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block">ORIGEN</span>
                    <span className="text-sm font-bold text-slate-300">.{fileItem.extension.toUpperCase()}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-indigo-500 animate-pulse" />
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block">DESTINO</span>
                    <span className="text-sm font-bold text-indigo-400">.{targetExt.toUpperCase()}</span>
                  </div>
                  <div className="h-6 w-px bg-white/10"></div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block">TAMAÑO</span>
                    <span className="text-sm font-bold text-emerald-400">{formatSize(fileItem.resultSize || 0)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={fileItem.resultUrl}
                    download={fileItem.resultName}
                    id="download-converted-doc-action"
                    className="flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all duration-300 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <FileDown className="w-5 h-5" />
                    Descargar Archivo
                  </a>
                  <button
                    onClick={reset}
                    id="new-conversion-btn"
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white transition-colors"
                    title="Convertir otro documento"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {fileItem.status === 'error' && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-medium text-xs">
                  <AlertCircle className="w-4 h-4" />
                  Error en la transcodificación
                </div>
                <p className="text-xs text-slate-400">{fileItem.errorMessage}</p>
                <button
                  onClick={reset}
                  id="reset-converter-on-error-btn"
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
