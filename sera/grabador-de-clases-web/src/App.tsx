import { useState } from 'react';
import { 
  Play, 
  Square, 
  Pause, 
  Download, 
  Video, 
  Monitor, 
  Clock, 
  Code, 
  Copy, 
  Check, 
  Info, 
  Volume2, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useRecorder } from './hooks/useRecorder';
import { AudioVisualizer } from './components/AudioVisualizer';
import { RecordingSettings } from './components/RecordingSettings';
import { Instructions } from './components/Instructions';

export default function App() {
  const {
    isRecording,
    isPaused,
    duration,
    devices,
    selectedMicId,
    setSelectedMicId,
    recordMic,
    setRecordMic,
    recordSystemAudio,
    setRecordSystemAudio,
    micVolume,
    setMicVolume,
    systemVolume,
    setSystemVolume,
    videoQuality,
    setVideoQuality,
    systemAudioMissingWarning,
    error,
    setError,
    recordedBlob,
    recordedUrl,
    micAnalyser,
    systemAnalyser,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    requestMicPermission
  } = useRecorder();

  const [fileName, setFileName] = useState('clase_grabada_01');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copiedState, setCopiedState] = useState<string | null>(null);

  // Helper to format recording time nicely
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Safe download trigger
  const handleDownload = () => {
    if (!recordedUrl || !recordedBlob) return;
    
    const link = document.createElement('a');
    link.href = recordedUrl;
    
    // Sanitize file name for OS compatibility
    const sanitizedName = fileName.trim() ? fileName.replace(/[^a-zA-Z0-9_-]/g, '_') : 'clase_grabada';
    link.download = `${sanitizedName}.mp4`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(label);
    setTimeout(() => setCopiedState(null), 2000);
  };

  // Content code snippet for copy paste
  const installInstructions = `npm install lucide-react`;

  const hookUsageExample = `// Cómo usar la grabación en tu propio proyecto React:
import { useRecorder } from './hooks/useRecorder';
import { AudioVisualizer } from './components/AudioVisualizer';

export default function MiGrabador() {
  const {
    isRecording,
    isPaused,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    recordedUrl,
    micAnalyser,
    systemAnalyser
  } = useRecorder();

  return (
    <div>
      <p>Tiempo: {duration} segundos</p>
      <button onClick={startRecording}>Grabar Pantalla y Micro</button>
      {/* ... visualizadores y controles */}
    </div>
  );
}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Navigation */}
      <nav className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-emerald-500 rounded-sm flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-slate-950"></div>
          </div>
          <h1 className="text-sm font-bold tracking-tight uppercase flex items-center gap-1.5">
            Lumina<span className="text-emerald-400">Capture</span> <span className="text-[10px] text-slate-500 font-mono tracking-normal capitalize">API</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[10px] font-mono uppercase text-emerald-400">System Ready</span>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setShowCodeModal(true)}
              className="flex items-center gap-2 text-xs font-semibold bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 px-4 py-2 rounded transition-all cursor-pointer uppercase"
              id="btn-ver-api"
            >
              <Code className="w-3.5 h-3.5 text-emerald-400" />
              <span>Código API</span>
            </button>
            <a
              href={window.location.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded transition-all cursor-pointer uppercase"
              id="btn-nueva-pestaña"
            >
              <span>Pantalla Completa</span>
              <ExternalLink className="w-3 h-3 text-emerald-400" />
            </a>
          </div>
          
          <div className="h-4 w-[1px] bg-slate-800"></div>
          <span className="text-xs text-slate-500 font-mono">v2.4.0-STABLE</span>
        </div>
      </nav>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT COLUMN: Controls & Sound meters (5 cols) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between h-full">
          <div className="space-y-6">
            <RecordingSettings
              devices={devices}
              selectedMicId={selectedMicId}
              setSelectedMicId={setSelectedMicId}
              recordMic={recordMic}
              setRecordMic={setRecordMic}
              recordSystemAudio={recordSystemAudio}
              setRecordSystemAudio={setRecordSystemAudio}
              micVolume={micVolume}
              setMicVolume={setMicVolume}
              systemVolume={systemVolume}
              setSystemVolume={setSystemVolume}
              videoQuality={videoQuality}
              setVideoQuality={setVideoQuality}
              isRecording={isRecording}
              systemAudioMissingWarning={systemAudioMissingWarning}
              requestMicPermission={requestMicPermission}
            />

            {/* Live Audio Visualizers */}
            <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-slate-800 shadow-2xl space-y-4">
              <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                INDICADORES DE ENTRADA EN TIEMPO REAL
              </h3>
              <div className="flex flex-wrap gap-4">
                <AudioVisualizer
                  analyser={micAnalyser}
                  color="rgb(52, 211, 153)" // Emerald-400
                  label="Micrófono"
                  isActive={recordMic && isRecording}
                />
                <AudioVisualizer
                  analyser={systemAnalyser}
                  color="rgb(52, 211, 153)" // Emerald-400
                  label="Audio Sistema"
                  isActive={recordSystemAudio && isRecording}
                />
              </div>
            </div>
          </div>

          {/* Footer of column: quick info */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded flex items-center gap-3">
            <Info className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-[11px] text-slate-400 leading-normal">
              La grabación se procesa localmente en la tarjeta de video de tu ordenador. Cero subidas a servidores externos = Cero demoras y privacidad absoluta.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Recording Panel & Guide (7 cols) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col">
          
          {/* Main Action Stage */}
          <div 
            className="bg-slate-900/50 backdrop-blur-md rounded-xl p-8 border border-slate-800 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden flex-1 min-h-[420px]" 
            id="grabador-stage"
            style={{
              backgroundImage: 'radial-gradient(#1e293b 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px'
            }}
          >
            
            {/* Dynamic visual rings when recording */}
            {isRecording && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[300px] h-[300px] rounded-full border border-rose-500/10 animate-ping absolute duration-1000" />
                <div className="w-[450px] h-[450px] rounded-full border border-emerald-500/5 animate-pulse absolute duration-3000" />
              </div>
            )}

            {error && (
              <div className="mb-6 w-full max-w-md p-4 bg-rose-500/10 border border-rose-500/20 rounded flex items-start gap-3 text-left">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <p className="text-xs text-rose-300 font-bold leading-relaxed">{error}</p>
              </div>
            )}

            {/* Main Central State */}
            {!isRecording && !recordedUrl ? (
              <div className="space-y-6 my-auto animate-fadeIn">
                <div className="w-20 h-20 bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto shadow-inner relative">
                  <div className="absolute inset-2 border border-dashed border-slate-800"></div>
                  <Monitor className="w-8 h-8 text-slate-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-100">LISTO PARA INICIAR LA CLASE</h2>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Presiona el botón para seleccionar la ventana de tu clase o diapositivas y comenzar a grabar al instante.
                  </p>
                </div>
                
                <button
                  onClick={startRecording}
                  className="inline-flex items-center gap-3 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold px-8 py-4 rounded border border-rose-500/40 shadow-lg shadow-rose-900/20 transition-all duration-200 text-xs tracking-wider uppercase cursor-pointer group"
                  id="btn-iniciar"
                >
                  <span className="w-3 h-3 rounded-full bg-white group-hover:scale-110 transition-transform animate-pulse" />
                  Iniciar Grabación de Clase
                </button>
              </div>
            ) : isRecording ? (
              <div className="space-y-6 my-auto">
                {/* Recording Pulse Header */}
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold rounded mx-auto w-fit">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>TRANSMISIÓN EN VIVO (GRABANDO)</span>
                </div>

                {/* Big Clock */}
                <div className="space-y-1">
                  <div className="text-5xl md:text-6xl font-mono font-bold tracking-widest text-white drop-shadow">
                    {formatDuration(duration)}
                  </div>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500 flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    DURACIÓN DE SESIÓN EN CURSO
                  </p>
                </div>

                {/* Live Resolution details */}
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Resolución: <span className="text-emerald-400 font-bold">{videoQuality === 'high' ? '1080p FHD' : '720p HD'}</span> | 
                  Formato: <span className="text-emerald-400 font-bold">MP4 CODES</span>
                </p>

                {/* Recording Control Triggers */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  {isPaused ? (
                    <button
                      onClick={resumeRecording}
                      className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold uppercase tracking-wider px-6 py-3.5 rounded transition-all active:scale-95 text-xs shadow cursor-pointer"
                      id="btn-reanudar"
                    >
                      <Play className="w-4 h-4" />
                      Reanudar Grabación
                    </button>
                  ) : (
                    <button
                      onClick={pauseRecording}
                      className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-100 font-bold uppercase tracking-wider px-6 py-3.5 rounded transition-all active:scale-95 text-xs shadow cursor-pointer"
                      id="btn-pausar"
                    >
                      <Pause className="w-4 h-4" />
                      Pausar Temporalmente
                    </button>
                  )}

                  <button
                    onClick={stopRecording}
                    className="inline-flex items-center gap-2 bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-500 text-rose-400 hover:text-white font-bold uppercase tracking-wider px-6 py-3.5 rounded transition-all active:scale-95 text-xs shadow cursor-pointer"
                    id="btn-detener"
                  >
                    <Square className="w-4 h-4" />
                    Detener y Procesar
                  </button>
                </div>
              </div>
            ) : (
              // Recording completed and preview is ready!
              <div className="space-y-6 w-full text-left my-auto animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-wider font-bold">¡Clase Procesada con Éxito!</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                    DURACIÓN: {formatDuration(duration)}
                  </span>
                </div>

                {/* Embedded High-Quality Video Preview */}
                <div className="rounded overflow-hidden border border-slate-800 bg-slate-950 aspect-video shadow-2xl relative">
                  <video
                    src={recordedUrl || undefined}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Action Forms and Downloads */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-7 space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                      NOMBRE DEL ARCHIVO DE CLASE
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="ej. clase_matematicas_01"
                        className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-100 rounded px-3.5 py-3 pr-12 outline-none focus:border-emerald-500/60 transition-colors"
                      />
                      <span className="absolute right-3.5 top-3 text-xs font-mono font-semibold text-slate-500">
                        .mp4
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="md:col-span-5 h-12 px-6 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded flex items-center justify-center gap-2.5 hover:bg-emerald-500/20 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    id="btn-descargar"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Clase MP4
                  </button>
                </div>

                {/* Reset Trigger */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      // reset recorder
                      window.location.reload();
                    }}
                    className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 flex items-center gap-1.5 border border-slate-800 bg-slate-900/30 px-3 py-2 rounded transition-colors cursor-pointer"
                  >
                    Grabar otra clase
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick instructions guide */}
          <Instructions />
        </div>
      </main>

      {/* Code Modal Overlay for API Integration and Copy-Zipping */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-zoomIn">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">Integración de la API de Grabación</h3>
                <p className="text-xs text-slate-500">Cómo llevar estos componentes y hooks a tu propio proyecto</p>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-wide border border-slate-800 hover:bg-slate-800 px-3 py-1.5 rounded transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              <div className="space-y-2">
                <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">Estructura del Código</h4>
                <p className="text-slate-300 leading-relaxed">
                  Para copiar esto a tu proyecto, simplemente descarga el archivo ZIP del workspace (desde el menú de opciones de AI Studio) o copia y pega estos archivos independientes:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                    <span className="font-mono font-bold text-emerald-400 block mb-0.5">/src/hooks/useRecorder.ts</span>
                    <span className="text-slate-400 text-[11px]">Hook principal. Gestiona permisos, AudioContext y MediaRecorder.</span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                    <span className="font-mono font-bold text-emerald-400 block mb-0.5">/src/components/AudioVisualizer.tsx</span>
                    <span className="text-slate-400 text-[11px]">Canvas interactivo que pinta las ondas del micrófono y sistema.</span>
                  </div>
                </div>
              </div>

              {/* Install guide */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">1. Dependencias Necesarias</h4>
                  <button
                    onClick={() => copyToClipboard(installInstructions, 'dep')}
                    className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-bold uppercase"
                  >
                    {copiedState === 'dep' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-emerald-400" />}
                    <span>{copiedState === 'dep' ? 'Copiado' : 'Copiar comando'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-3.5 rounded font-mono text-[11px] text-slate-300 border border-slate-800 overflow-x-auto">
                  {installInstructions}
                </pre>
              </div>

              {/* Usage code snippet */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">2. Ejemplo de Uso de la API</h4>
                  <button
                    onClick={() => copyToClipboard(hookUsageExample, 'usage')}
                    className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-bold uppercase"
                  >
                    {copiedState === 'usage' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedState === 'usage' ? 'Copiado' : 'Copiar código'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-3.5 rounded font-mono text-[11px] text-slate-300 border border-slate-800 overflow-x-auto whitespace-pre">
                  {hookUsageExample}
                </pre>
              </div>

              <div className="p-4 bg-emerald-500/5 rounded border border-emerald-500/10 flex items-start gap-3">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs text-emerald-300 font-bold uppercase tracking-wide">¡Perfectamente Portátil!</p>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    El hook <code className="font-mono text-emerald-400">useRecorder</code> utiliza APIs nativas del navegador, por lo que es compatible con cualquier proyecto Vite + React, Next.js (con "use client"), o cualquier Framework React moderno sin adaptaciones.
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">GRABADOR WEB API • LICENCIA APACHE-2.0</span>
              <button
                onClick={() => setShowCodeModal(false)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded text-xs uppercase cursor-pointer transition-colors"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
