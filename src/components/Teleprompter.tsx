import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Type, Sparkles } from 'lucide-react';

interface TeleprompterProps {
  initialText: string;
  onClose?: () => void;
  sharedScript?: string;
  lang: 'es' | 'en';
}

const T_TELEPROMPTER = {
  en: {
    title: "Apuntador / Teleprompter",
    focusLine: "Focus Line",
    placeholder: "Write, paste your script or plan here to scroll automatically...",
    pause: "PAUSE",
    scroll: "SCROLL",
    reset: "Reset Scroll",
    speed: "Speed:",
    defaultText: "Write or paste your script here...\n\nYou can use the NÚCLEO cognitive processor to generate the script automatically from a PDF."
  },
  es: {
    title: "Apuntador / Teleprompter",
    focusLine: "Línea de Enfoque",
    placeholder: "Escribe, pega tu guión o plan aquí para que se desplace de forma automática...",
    pause: "PAUSA",
    scroll: "DESPLAZAR",
    reset: "Reiniciar Desplazamiento",
    speed: "Velocidad:",
    defaultText: "Escribe o pega tu guión aquí...\n\nPuedes usar el procesador cognitivo NÚCLEO para generar el guión automáticamente desde un PDF."
  }
};

export default function Teleprompter({ initialText, onClose, sharedScript = '', lang }: TeleprompterProps) {
  const t = T_TELEPROMPTER[lang || 'es'];
  const [text, setText] = useState(sharedScript || initialText || t.defaultText);
  const [fontSize, setFontSize] = useState<number>(20); // in px
  const [scrollSpeed, setScrollSpeed] = useState<number>(2); // 1-5
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Check if there is an imported script from NÚCLEO (PDF Insight AI)
    const importedScript = localStorage.getItem('docent_teleprompter_text');
    if (importedScript) {
      setText(importedScript);
      localStorage.removeItem('docent_teleprompter_text'); // Clear it so it doesn't override next time
    }
  }, []);

  // Sync internal text state when initialText prop changes from the parent
  useEffect(() => {
    if (initialText) {
      setText(initialText);
    }
  }, [initialText]);

  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();
    let scrollAccumulator = 0;

    const scroll = (time: number) => {
      if (!isPlaying || !scrollContainerRef.current) return;

      const delta = time - lastTime;
      lastTime = time;

      // Calculate smooth scrolling step based on speed config
      const pxPerMs = (scrollSpeed * 0.015);
      scrollAccumulator += delta * pxPerMs;

      if (scrollAccumulator >= 1) {
        const floorScroll = Math.floor(scrollAccumulator);
        scrollContainerRef.current.scrollTop += floorScroll;
        scrollAccumulator -= floorScroll;
      }

      // Stop at bottom
      const container = scrollContainerRef.current;
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5) {
        setIsPlaying(false);
      } else {
        requestAnimationFrame(scroll);
      }
    };

    const frameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, scrollSpeed]);

  const handleReset = () => {
    setIsPlaying(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 flex flex-col h-full min-h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Font Size Adjust */}
          <button 
            onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
            title={lang === 'en' ? "Decrease Font" : "Achicar Letra"}
          >
            <Type size={14} className="scale-75" />
          </button>
          <button 
            onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
            title={lang === 'en' ? "Increase Font" : "Agrandar Letra"}
          >
            <Type size={18} />
          </button>
        </div>
      </div>

      {/* Editor & Scroller Container */}
      <div className="relative flex-grow flex flex-col bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden mb-4">
        {/* Guide Highlight Bar */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-16 bg-indigo-500/5 border border-indigo-500/25 rounded-2xl pointer-events-none z-10 shadow-[0_0_15px_rgba(99,102,241,0.05)]" />

        <div 
          ref={scrollContainerRef}
          className="flex-grow overflow-y-auto p-6 scroll-smooth select-text"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
        >
          {/* Spacer to start scrolling below top */}
          <div className="h-28" />
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-auto min-h-[300px] bg-transparent text-slate-200 resize-none focus:outline-none focus:ring-0 border-none font-sans whitespace-pre-wrap font-medium pb-28"
            placeholder={t.placeholder}
          />
        </div>
      </div>

      {/* Teleprompter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isPlaying 
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/10' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause size={14} fill="currentColor" /> {t.pause}
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" /> {t.scroll}
              </>
            )}
          </button>
          
          <button
            onClick={handleReset}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
            title={t.reset}
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Speed adjust */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 font-bold uppercase">{t.speed}</span>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={scrollSpeed} 
            onChange={(e) => setScrollSpeed(Number(e.target.value))}
            className="w-20 accent-indigo-500 cursor-pointer h-1 rounded-full bg-slate-800"
          />
          <span className="text-xs font-mono font-bold text-indigo-400 w-5 text-right">{scrollSpeed}x</span>
        </div>
      </div>
    </div>
  );
}
