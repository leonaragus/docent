import React, { useEffect, useState, useRef } from 'react';

interface VolumeMeterProps {
  analyser: AnalyserNode | null;
  isMuted: boolean;
}

export default function VolumeMeter({ analyser, isMuted }: VolumeMeterProps) {
  const [level, setLevel] = useState(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analyser || isMuted) {
      setLevel(0);
      return;
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const update = () => {
      analyser.getByteFrequencyData(dataArray);
      const sum = dataArray.reduce((a, b) => a + b, 0);
      const avg = sum / dataArray.length;
      setLevel(avg);
      animationRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isMuted]);

  if (isMuted) return null;

  return (
    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 items-end h-1 w-4">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i} 
          className="flex-1 rounded-full bg-white/80" 
          style={{ 
            height: `${Math.min(100, (level / (60 - (i * 10))) * 100)}%`,
            transition: 'height 0.05s ease-out'
          }} 
        />
      ))}
    </div>
  );
}
