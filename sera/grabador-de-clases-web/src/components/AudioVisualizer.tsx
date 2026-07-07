import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  color: string; // e.g., 'rgb(59, 130, 246)'
  label: string;
  isActive: boolean;
}

export function AudioVisualizer({ analyser, color, label, isActive }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Adjust canvas resolution for high-DPI displays (retina)
    const dpr = window.devicePixelRatio || 1;
    const width = 140;
    const height = 40;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    if (!analyser || !isActive) {
      // Draw flatline
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)'; // Tailwind gray-400
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, width, height);

      // Draw subtle background grid or clean border lines
      ctx.fillStyle = 'rgba(30, 41, 59, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // We want to draw simple, glowing vertical audio bands
      const barCount = 16;
      const spacing = 3;
      const barWidth = (width - (spacing * (barCount + 1))) / barCount;

      for (let i = 0; i < barCount; i++) {
        // Sample frequencies linearly across the lower/middle range
        const dataIndex = Math.floor((i / barCount) * (bufferLength * 0.6));
        const value = dataArray[dataIndex] || 0;
        
        // Scale height smoothly
        const percent = value / 255;
        const barHeight = Math.max(3, percent * height * 0.95);
        
        const x = spacing + i * (barWidth + spacing);
        const y = height - barHeight;

        // Draw glowing gradient bar
        const gradient = ctx.createLinearGradient(x, y, x, height);
        gradient.addColorStop(0, color); // vibrant color
        gradient.addColorStop(1, 'rgba(30, 41, 59, 0.2)'); // fade to dark transparent

        ctx.fillStyle = gradient;
        
        // Rounded corners for bars
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, 2);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, color, isActive]);

  return (
    <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-3 rounded w-[240px]">
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className={`text-[11px] font-mono uppercase font-bold truncate ${isActive && analyser ? 'text-emerald-400' : 'text-slate-600'}`}>
          {isActive && analyser ? '⚡ Live Active' : 'Idle'}
        </span>
      </div>
      <canvas ref={canvasRef} className="rounded-sm" />
    </div>
  );
}
