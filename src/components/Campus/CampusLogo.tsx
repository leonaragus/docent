import React from 'react';
import { Award, ShieldAlert, ShieldCheck } from 'lucide-react';

interface DocentLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  monoText?: boolean;
}

export default function DocentLogo({ className = '', size = 'md', monoText = false }: DocentLogoProps) {
  const iconSizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerSizeMap = {
    sm: 'p-1.5 rounded-lg',
    md: 'p-2.5 rounded-xl',
    lg: 'p-4 rounded-2xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Argentinian Homologation / Certification Shield Emblem */}
      <div className={`relative bg-gradient-to-br from-indigo-700 via-slate-905 to-blue-900 text-white flex items-center justify-center shadow-md ${containerSizeMap[size]} border border-white/20`}>
        {/* Flag colored micro accent lines (Sky Blue & White) to represent Argentina context discreetly without overbearing */}
        <div className="absolute top-0 inset-x-0 h-1 flex rounded-t overflow-hidden">
          <div className="flex-1 bg-sky-400" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-sky-400" />
        </div>
        
        {/* Beautiful seal emblem */}
        <ShieldCheck className={`${iconSizeMap[size]} text-slate-100 drop-shadow-sm`} />
        
        {/* Badge star indicator */}
        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-500 border border-white rounded-full flex items-center justify-center text-[7px] text-slate-950 font-black">
          ★
        </span>
      </div>

      <div className="text-left">
        <h1 className="font-extrabold tracking-tight text-slate-900 leading-none flex items-center gap-1.5">
          <span className="text-base sm:text-xl font-display font-black tracking-widest text-[#1e293b]">docent</span>
          <span className="bg-amber-50 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded border border-amber-200">
            REGISTRO PRIVADO
          </span>
        </h1>
        <span className="text-[9px] text-slate-500 font-sans font-semibold tracking-tight uppercase leading-normal block max-w-[280px]">
          Homologación Institucional y Certificación Profesional
        </span>
      </div>
    </div>
  );
}
