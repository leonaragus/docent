import React, { useState } from 'react';
import { 
  Video, 
  FileText, 
  MonitorPlay, 
  Crown,
  Globe,
  Palette,
  Target,
  Archive,
  Trophy,
  GraduationCap,
  Wallet,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export type SuiteView = 'studio' | 'nexus' | 'magnet' | 'docs' | 'nucleus' | 'oracle' | 'campus' | 'admin';

const getToolInfo = (view: SuiteView, lang: 'en' | 'es') => {
  const isEs = lang === 'es';
  switch (view) {
    case 'studio':
      return {
        title: isEs ? 'DOCENT Studio' : 'DOCENT Studio',
        desc: isEs 
          ? 'Grabador de clases premium. Captura cámara y pantalla con audio, teleprompter inteligente y descarga automática de apuntes y subtítulos.' 
          : 'Premium class recorder. Capture webcam and screen with audio, smart teleprompter, and auto-download notes and subtitles.'
      };
    case 'nexus':
      return {
        title: isEs ? 'DOCENT Nexus' : 'DOCENT Nexus',
        desc: isEs 
          ? 'Diseñador de identidad y marcas institucionales. Genera logotipos vectoriales y membretes oficiales en PDF de alta definición.' 
          : 'Institutional brand & identity designer. Generate vector logos and official high-definition PDF letterheads.'
      };
    case 'magnet':
      return {
        title: isEs ? 'DOCENT Magnet' : 'DOCENT Magnet',
        desc: isEs 
          ? 'Fidelización y compartido dinámico. Comparte tus clases de forma masiva con encuestas de satisfacción para tus alumnos.' 
          : 'Dynamic sharing & marketing. Share your classes with satisfaction feedback surveys for your students.'
      };
    case 'docs':
      return {
        title: isEs ? 'Compresor & Convertidor PDF' : 'PDF Compressor & Converter',
        desc: isEs 
          ? 'Comprime y convierte tus archivos a formato PDF localmente, optimizando el tamaño y protegiendo tu propiedad intelectual.' 
          : 'Compress and convert your files to PDF format locally, optimizing file size and protecting your intellectual property.'
      };
    case 'nucleus':
      return {
        title: isEs ? 'DOCENT Nucleus' : 'DOCENT Nucleus',
        desc: isEs 
          ? 'Procesador cognitivo de IA. Sube PDFs y libros académicos para generar guiones estructurados y planes pedagógicos para el teleprompter.' 
          : 'Cognitive AI processor. Upload PDFs and academic books to generate structured scripts and lesson plans for the teleprompter.'
      };
    case 'oracle':
      return {
        title: isEs ? 'DOCENT Oracle' : 'DOCENT Oracle',
        desc: isEs 
          ? 'Generador de evaluaciones avanzadas (Elite). Diseña exámenes automáticos, cuestionarios de opción múltiple y rúbricas usando IA.' 
          : 'Advanced assessment generator (Elite). Automatically design exams, multiple-choice quizzes, and grading rubrics using AI.'
      };
    case 'campus':
      return {
        title: isEs ? 'DOCENT Campus' : 'DOCENT Campus',
        desc: isEs 
          ? 'Campus del profesor (Elite). Centraliza y administra tus aulas virtuales, alumnos matriculados y el progreso general de las clases.' 
          : 'Teacher campus (Elite). Centralize and manage your virtual classrooms, enrolled students, and overall lesson progress.'
      };
    case 'admin':
      return {
        title: isEs ? 'DOCENT Admin' : 'DOCENT Admin',
        desc: isEs 
          ? 'Administración y licencias (Elite). Controla tus cuotas de uso de IA, consumo de almacenamiento y suscripciones del portal.' 
          : 'Administration & licenses (Elite). Monitor your AI usage quotas, cloud storage consumption, and subscription status.'
      };
    default:
      return { title: '', desc: '' };
  }
};


interface SuiteNavigationProps {
  onOpenPro: () => void;
  currentView: SuiteView;
  onViewChange: (view: SuiteView) => void;
  children: React.ReactNode;
}

export default function SuiteNavigation({ onOpenPro, currentView, onViewChange, children }: SuiteNavigationProps) {
  const { lang, setLang, t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const studioInfo = getToolInfo('studio', lang);
  const nexusInfo = getToolInfo('nexus', lang);
  const magnetInfo = getToolInfo('magnet', lang);
  const docsInfo = getToolInfo('docs', lang);
  const nucleusInfo = getToolInfo('nucleus', lang);
  const oracleInfo = getToolInfo('oracle', lang);
  const campusInfo = getToolInfo('campus', lang);
  const adminInfo = getToolInfo('admin', lang);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* SIDEBAR */}
      <aside 
        className={`${isExpanded ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col z-40 relative group`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <Video className="w-4 h-4 text-white" />
          </div>
          <div className={`font-black text-lg tracking-tight whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
            DOCENT<span className="text-indigo-400">suite</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 flex flex-col gap-2">
          {/* Main App (Studio) */}
          <button 
            onClick={() => onViewChange('studio')}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors w-full relative group/navitem ${currentView === 'studio' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            &nbsp;<Video className="w-5 h-5 shrink-0" />
            <span className={`font-semibold whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
              {t.navStudio}
            </span>
            
            {/* Tooltip Card */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-64 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 p-3.5 rounded-xl shadow-xl shadow-black/40 opacity-0 pointer-events-none group-hover/navitem:opacity-100 group-hover/navitem:pointer-events-auto transition-all duration-200 z-50 transform translate-x-2 group-hover/navitem:translate-x-0">
              <div className="font-extrabold text-[11px] text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                {`${studioInfo.title}`}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold whitespace-normal">
                {`${studioInfo.desc}`}
              </p>
            </div>

          </button>

          {/* Docent Nexus Tool */}
          <button 
            onClick={() => onViewChange('nexus')}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors w-full relative group/navitem ${currentView === 'nexus' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            &nbsp;<Palette className="w-5 h-5 shrink-0" />
            <span className={`font-semibold whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
              {t.navNexus}
            </span>
            
            {/* Tooltip Card */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-64 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 p-3.5 rounded-xl shadow-xl shadow-black/40 opacity-0 pointer-events-none group-hover/navitem:opacity-100 group-hover/navitem:pointer-events-auto transition-all duration-200 z-50 transform translate-x-2 group-hover/navitem:translate-x-0">
              <div className="font-extrabold text-[11px] text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                {`${nexusInfo.title}`}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold whitespace-normal">
                {`${nexusInfo.desc}`}
              </p>
            </div>

          </button>

          {/* Docent Magnet Tool */}
          <button 
            onClick={() => onViewChange('magnet')}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors w-full relative group/navitem ${currentView === 'magnet' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            &nbsp;<Target className="w-5 h-5 shrink-0" />
            <span className={`font-semibold whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
              {t.navMagnet}
            </span>
            
            {/* Tooltip Card */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-64 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 p-3.5 rounded-xl shadow-xl shadow-black/40 opacity-0 pointer-events-none group-hover/navitem:opacity-100 group-hover/navitem:pointer-events-auto transition-all duration-200 z-50 transform translate-x-2 group-hover/navitem:translate-x-0">
              <div className="font-extrabold text-[11px] text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                {`${magnetInfo.title}`}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold whitespace-normal">
                {`${magnetInfo.desc}`}
              </p>
            </div>

          </button>

          {/* Docent Docs Tool */}
          <button 
            onClick={() => onViewChange('docs')}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors w-full relative group/navitem ${currentView === 'docs' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            &nbsp;<Archive className="w-5 h-5 shrink-0" />
            <span className={`font-semibold whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
              {t.navDocs}
            </span>
            
            {/* Tooltip Card */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-64 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 p-3.5 rounded-xl shadow-xl shadow-black/40 opacity-0 pointer-events-none group-hover/navitem:opacity-100 group-hover/navitem:pointer-events-auto transition-all duration-200 z-50 transform translate-x-2 group-hover/navitem:translate-x-0">
              <div className="font-extrabold text-[11px] text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                {`${docsInfo.title}`}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold whitespace-normal">
                {`${docsInfo.desc}`}
              </p>
            </div>

          </button>

          {/* Nucleus AI Tool */}
          <button 
            onClick={() => onViewChange('nucleus')}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors w-full relative group/navitem ${currentView === 'nucleus' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            &nbsp;<div className="relative">
              <Sparkles className="w-5 h-5 shrink-0" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"></div>
            </div>
            <span className={`font-semibold whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
              {t.navNucleus} <span className="ml-2 text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded uppercase">BETA</span>
            </span>
            
            {/* Tooltip Card */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-64 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 p-3.5 rounded-xl shadow-xl shadow-black/40 opacity-0 pointer-events-none group-hover/navitem:opacity-100 group-hover/navitem:pointer-events-auto transition-all duration-200 z-50 transform translate-x-2 group-hover/navitem:translate-x-0">
              <div className="font-extrabold text-[11px] text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                {`${nucleusInfo.title}`}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold whitespace-normal">
                {`${nucleusInfo.desc}`}
              </p>
            </div>

          </button>

          {/* DOCENT Oracle Tool */}
          <button 
            onClick={() => onViewChange('oracle')}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors w-full relative group/navitem ${currentView === 'oracle' ? 'bg-violet-500/10 text-violet-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            &nbsp;<div className="relative">
              <Trophy className="w-5 h-5 shrink-0" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-violet-500 rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-violet-500 rounded-full"></div>
            </div>
            <span className={`font-semibold whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
              DOCENT Oracle <span className="ml-2 text-[9px] bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(139,92,246,0.5)] animate-pulse uppercase">ELITE</span>
            </span>
            
            {/* Tooltip Card */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-64 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 p-3.5 rounded-xl shadow-xl shadow-black/40 opacity-0 pointer-events-none group-hover/navitem:opacity-100 group-hover/navitem:pointer-events-auto transition-all duration-200 z-50 transform translate-x-2 group-hover/navitem:translate-x-0">
              <div className="font-extrabold text-[11px] text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                {`${oracleInfo.title}`}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold whitespace-normal">
                {`${oracleInfo.desc}`}
              </p>
            </div>

          </button>

          {/* Docent Campus Tool */}
          <button 
            onClick={() => onViewChange('campus')}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors w-full relative group/navitem ${currentView === 'campus' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            &nbsp;<div className="relative">
              <GraduationCap className="w-5 h-5 shrink-0" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"></div>
            </div>
            <span className={`font-semibold whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
              DOCENT Campus <span className="ml-2 text-[9px] bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse uppercase">ELITE</span>
            </span>
            
            {/* Tooltip Card */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-64 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 p-3.5 rounded-xl shadow-xl shadow-black/40 opacity-0 pointer-events-none group-hover/navitem:opacity-100 group-hover/navitem:pointer-events-auto transition-all duration-200 z-50 transform translate-x-2 group-hover/navitem:translate-x-0">
              <div className="font-extrabold text-[11px] text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                {`${campusInfo.title}`}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold whitespace-normal">
                {`${campusInfo.desc}`}
              </p>
            </div>

          </button>

          {/* Docent Admin Tool */}
          <button 
            onClick={() => onViewChange('admin')}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors w-full relative group/navitem ${currentView === 'admin' ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            &nbsp;<div className="relative">
              <Wallet className="w-5 h-5 shrink-0" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full"></div>
            </div>
            <span className={`font-semibold whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
              DOCENT Admin <span className="ml-2 text-[9px] bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse uppercase">ELITE</span>
            </span>
            
            {/* Tooltip Card */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-64 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 p-3.5 rounded-xl shadow-xl shadow-black/40 opacity-0 pointer-events-none group-hover/navitem:opacity-100 group-hover/navitem:pointer-events-auto transition-all duration-200 z-50 transform translate-x-2 group-hover/navitem:translate-x-0">
              <div className="font-extrabold text-[11px] text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                {`${adminInfo.title}`}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold whitespace-normal">
                {`${adminInfo.desc}`}
              </p>
            </div>

          </button>

          {/* Teleprompter anchor link (scrolls to bottom if on main page) */}
          <a 
            href="#teleprompter"
            className="flex items-center gap-4 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors w-full"
          >
            <MonitorPlay className="w-5 h-5 shrink-0" />
            <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
              {t.navTeleprompter}
            </span>
          </a>
        </nav>

        <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
          {/* Pro Button */}
          <button 
            onClick={onOpenPro}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] ${isExpanded ? 'px-4' : 'px-0'}`}
          >
            <Crown className="w-5 h-5 shrink-0" />
            <span className={`whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
              {t.navPro}
            </span>
          </button>
        </div>
      </aside>
      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {/* Floating Language Toggle - Always Visible Top Right */}
        <div className="absolute top-4 right-6 z-50">
          <button 
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/50 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/20"
            title="Cambiar idioma / Change language"
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-xs tracking-wide">
              {lang === 'en' ? 'EN' : 'ES'}
            </span>
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
