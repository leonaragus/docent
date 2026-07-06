import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface AudioVisualizerProps {
  stream: MediaStream | null;
  isActive: boolean;
}

export default function AudioVisualizer({ stream, isActive }: AudioVisualizerProps) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI canvas resolution
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();

    if (isActive && stream) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        dataArrayRef.current = dataArray;
      } catch (e) {
        console.error('Failed to init Web Audio visualizer', e);
      }
    }

    let t = 0;
    const draw = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);

      if (isActive && analyserRef.current && dataArrayRef.current) {
        const analyser = analyserRef.current;
        const dataArray = dataArrayRef.current;
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (w / dataArray.length) * 1.5;
        let barHeight;
        let x = 0;

        ctx.fillStyle = '#6366f1'; // Indigo-500

        for (let i = 0; i < dataArray.length; i++) {
          barHeight = (dataArray[i] / 255) * (h * 0.8);

          // Rounded bars with premium shadows
          ctx.beginPath();
          ctx.roundRect(x, h / 2 - barHeight / 2, barWidth - 3, Math.max(4, barHeight), 4);
          
          // Gradient fill
          const grad = ctx.createLinearGradient(x, h / 2 - barHeight / 2, x, h / 2 + barHeight / 2);
          grad.addColorStop(0, '#818cf8'); // Indigo-400
          grad.addColorStop(0.5, '#6366f1'); // Indigo-500
          grad.addColorStop(1, '#4f46e5'); // Indigo-600
          ctx.fillStyle = grad;
          ctx.fill();

          x += barWidth;
        }
      } else {
        // Render beautiful idle neon wave
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#475569'; // Slate-600

        for (let i = 0; i < w; i++) {
          const y = h / 2 + Math.sin(i * 0.05 + t) * 8;
          if (i === 0) ctx.moveTo(i, y);
          else ctx.lineTo(i, y);
        }
        ctx.stroke();

        // Subtle glowing wave
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#6366f1'; // Indigo-500
        for (let i = 0; i < w; i++) {
          const y = h / 2 + Math.sin(i * 0.03 - t * 1.5) * 12;
          if (i === 0) ctx.moveTo(i, y);
          else ctx.lineTo(i, y);
        }
        ctx.stroke();

        t += 0.05;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [isActive, stream]);

  return (
    <div className="relative w-full h-16 bg-slate-950/40 rounded-2xl border border-slate-800/60 overflow-hidden flex flex-col justify-center p-2">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-1.5 left-3 flex items-center gap-1.5 pointer-events-none">
        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-indigo-500 animate-pulse' : 'bg-slate-500'}`} />
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{isEn ? 'Microphone Signal' : 'Señal del Micrófono'}</span>
      </div>
    </div>
  );
}
