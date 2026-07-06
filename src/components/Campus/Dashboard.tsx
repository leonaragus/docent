import React from 'react';
import { UserState, TallerVivo, Course, ThemePreset, Academy } from '../campusTypes';
import { 
  Zap, 
  Calendar, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Award, 
  GraduationCap, 
  ArrowRight,
  BookOpen,
  FolderDot,
  Shield,
  Building2,
  Users,
  Trophy,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import DocentLogo from './CampusLogo';

interface DashboardProps {
  user: UserState;
  talleres: TallerVivo[];
  courses: Course[];
  activeCourseId: string | null;
  onSelectCourse: (id: string) => void;
  activeAcademy: Academy;
  activeTheme: ThemePreset;
  activeRole: 'student' | 'teacher';
  onNavigateToJourney: () => void;
  onRegisterTaller: (tallerId: string) => void;
  onNavigateToTab: (tab: 'dashboard' | 'journey' | 'feed' | 'tutor' | 'creator') => void;
}

export default function Dashboard({
  user,
  talleres,
  courses,
  activeCourseId,
  onSelectCourse,
  activeAcademy,
  activeTheme,
  activeRole,
  onNavigateToJourney,
  onRegisterTaller,
  onNavigateToTab
}: DashboardProps) {
  // Calculate XP percentage for level progress bar
  const xpNeededForNextLevel = 1000;
  const xpProgressPercent = Math.min((user.xp / xpNeededForNextLevel) * 100, 100);

  // Retrieve current active course based on prop or default to first
  const activeCourse = courses.find(c => c.id === activeCourseId) || courses[0] || null;
  const activeModule = activeCourse?.modules?.find(m => m.id === user.activeNodeId) || activeCourse?.modules?.[0] || null;

  return (
    <div className="space-y-8 my-4 text-left">
      
      {/* 1. BRANDING INSTITUTIONAL HEADING BANNER (docent OFFICIAL INTEGRATION) */}
      <div 
        className={`rounded-3xl border border-slate-150 p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden transition-all duration-305 ${
          activeAcademy.bannerUrl ? 'text-white' : 'bg-white'
        }`}
        style={activeAcademy.bannerUrl ? {
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.90)), url(${activeAcademy.bannerUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderColor: 'rgba(99, 102, 241, 0.25)'
        } : undefined}
      >
        {/* Flag background aesthetic highlight */}
        {!activeAcademy.bannerUrl && (
          <div className="absolute top-0 left-0 w-3 md:w-4 h-full bg-indigo-600 block shrink-0" />
        )}
        
        <div className="pl-4 md:pl-6 space-y-4 max-w-3xl">
          {/* Logo element representation */}
          <div className="flex flex-wrap items-center gap-4">
            <DocentLogo size="md" />
          </div>

          <div className="space-y-2">
            <h2 className={`text-lg md:text-xl font-extrabold tracking-tight leading-snug font-sans ${activeAcademy.bannerUrl ? 'text-white' : 'text-slate-900'}`}>
              Sistema de Homologación e Infraestructura Académica para <span className={activeAcademy.bannerUrl ? 'text-indigo-305 font-black' : 'text-indigo-600'}>{activeAcademy.name}</span>
            </h2>
            <p className={`text-xs leading-relaxed font-sans ${activeAcademy.bannerUrl ? 'text-slate-200' : 'text-slate-600'}`}>
              Estás conectado a la plataforma de homologación y validación institucional de cursados. Todas las cátedras de este campus privado de co-aprendizaje y talleres correspondientes son supervisados por el <strong className={activeAcademy.bannerUrl ? 'text-indigo-200' : 'text-slate-800'}>Registro Argentino de Homologación Institucional y Certificación Profesional (docent)</strong> bajo el identificador de validez <span className={`font-mono text-xs px-1.5 py-0.5 rounded font-bold border ${activeAcademy.bannerUrl ? 'bg-slate-900/80 text-teal-300 border-indigo-500/40' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>ID: docent-{activeAcademy.subdomain.toUpperCase()}</span>.
            </p>
          </div>

          {/* Verification Indicators */}
          <div className="flex flex-wrap gap-3 items-center pt-2 text-[11px] font-sans">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold border ${activeAcademy.bannerUrl ? 'bg-teal-500/10 text-teal-300 border-teal-500/30' : 'bg-emerald-50 text-emerald-800 border-emerald-150'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sello de Homologación Activo
            </span>
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full font-semibold border ${activeAcademy.bannerUrl ? 'bg-slate-800/65 text-slate-200 border-indigo-500/30' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              Certificación con Firma Digital docent
            </span>
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full font-semibold border ${activeAcademy.bannerUrl ? 'bg-slate-800/65 text-slate-200 border-indigo-500/30' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Academia Certificada: https://{activeAcademy.subdomain}.docent.app
            </span>
          </div>
        </div>

        {/* Dynamic Academy Identity Medal representation (with Custom Logo fallback) */}
        <div className="bg-slate-50 p-6 rounded-2.5xl border border-slate-200/80 text-center w-full md:w-56 space-y-3 shrink-0 flex flex-col justify-center items-center">
          {activeAcademy.logoUrl ? (
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm bg-white border border-slate-200">
              {activeAcademy.logoUrl.startsWith('http') ? (
                <img 
                  src={activeAcademy.logoUrl} 
                  alt={activeAcademy.name} 
                  className="w-full h-full object-cover rounded-2xl" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{activeAcademy.logoUrl}</span>
              )}
            </div>
          ) : (
            /* Fallback automatically to docent's validation badge */
            <div className="relative">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-sm ${activeTheme.primaryButton}`}>
                {activeAcademy.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border border-white flex items-center justify-center text-[9px] text-slate-905 font-bold shadow-xs select-none" title="Sello docent Heredado">
                ★
              </span>
            </div>
          )}
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest font-sans">
              Logo de la Academia
            </span>
            <h4 className="font-extrabold text-xs text-slate-800 truncate max-w-[190px] mt-0.5">
              {activeAcademy.name}
            </h4>
            <span className="text-[9px] text-slate-400 block italic leading-none mt-1">
              {activeAcademy.logoUrl ? 'Identidad Personalizada' : 'Usando Sello docent'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono italic">
            {activeAcademy.subdomain}.docent.app
          </p>
        </div>
      </div>

      {/* 2. COURSE SELECTION BOARD (DURABLE CLOUD DIRECTORY FOR THE STUDENT & PROFESSOR) */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block p-1 bg-indigo-50 rounded text-indigo-700">
                <BookOpen className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-slate-900 text-base font-sans tracking-tight">
                Directorio General de Cursaciones Homologadas
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Selecciona e ingresa al programa de estudio aprobado bajo directiva docent para cursar módulos prácticos y agendar talleres en vivo.
            </p>
          </div>

          <div className="shrink-0">
            <span className="text-xs font-bold text-slate-500 font-mono bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Programas Disponibles: {courses.length}
            </span>
          </div>
        </div>

        {/* EMPTY STATE COMPONENT FOR NEW ACADEMIES (WITHOUT COURSES) */}
        {courses.length === 0 ? (
          <div className="text-center py-12 px-6 max-w-2xl mx-auto space-y-5">
            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600 border border-indigo-150`}>
              <Award className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase">
                Aún no hay programas registrados en esta academia
              </h4>
              <p className="text-xs text-slate-550 leading-relaxed max-w-lg mx-auto">
                Esta academia ha sido homologada de forma digital y segura, pero se encuentra temporalmente en blanco. Como alumno, deberás esperar a que el docente a cargo publique el pensum oficial.
              </p>
            </div>

            {/* Path options for Student & Professor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-left">
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-150 space-y-1.5">
                <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Perspectiva Estudiante 🧑‍🎓</span>
                <p className="text-[11px] text-slate-500">Puedes sumarte al chat social en <strong>El Muro</strong> o interactuar con el <strong>Tutor Kairós</strong> mientras esperas el dictado oficial de clases.</p>
              </div>

              <div className="bg-indigo-50/25 p-4 rounded-2xl border border-indigo-100 space-y-1.5">
                <span className="text-[10px] uppercase font-black text-indigo-700 block tracking-wider">Perspectiva Docente / Gestor 🛡️</span>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Tienes todos los permisos para dar de alta materias. Activa el rol de <strong>Docente</strong> en la barra superior para desbloquear la pestaña <strong>Constructor de Cursados</strong>.
                </p>
                <button
                  onClick={() => onNavigateToTab('creator')}
                  className="mt-2 text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 p-0 cursor-pointer border-0 bg-transparent"
                >
                  Ir al Constructor de Syllabus
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* GRID LIST OF COURSES FOR EASY SELECTION */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {courses.map(course => {
              const isActive = activeCourse?.id === course.id;
              
              return (
                <div 
                  key={course.id}
                  className={`border rounded-2.5xl p-5 transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                    isActive 
                      ? `${activeTheme.secondaryBg} ${activeTheme.accentBorder} shadow-xs ring-1 ring-offset-2 ${activeTheme.accentRing}` 
                      : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/30 shadow-3xs'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Course Category & ID Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        isActive 
                          ? `${activeTheme.accentBg} ${activeTheme.accentText} ${activeTheme.accentBorder}` 
                          : 'bg-slate-100 text-slate-650 border-slate-200'
                      }`}>
                        {course.category}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 font-bold">
                        COD: {course.id.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-snug">
                        {course.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-2">
                        {course.description}
                      </p>
                    </div>

                    {/* Meta values */}
                    <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-[10px] text-slate-500 font-sans">
                      <div>
                        <span className="block text-slate-400 uppercase font-bold tracking-wider text-[8px]">Instructor</span>
                        <span className="font-bold text-slate-700 truncate block mt-0.5">{course.instructor}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 uppercase font-bold tracking-wider text-[8px]">Módulos</span>
                        <span className="font-semibold text-slate-800 block mt-0.5">⭐ {course.modules.length} Unidades</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 uppercase font-bold tracking-wider text-[8px]">Certificación</span>
                        <span className="font-bold text-indigo-650 block mt-0.5">Analítica docent</span>
                      </div>
                    </div>
                  </div>

                  {/* Course Enter Button Action */}
                  <div className="pt-5 flex items-center justify-between gap-4 border-t border-slate-105/40 mt-5">
                    {isActive ? (
                      <span className={`text-[11px] font-black text-emerald-700 flex items-center gap-1.5`}>
                        <CheckCircle className="w-4 h-4 fill-emerald-100 text-emerald-600" />
                        Cursando Actualmente
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Disponibilidad Inmediata</span>
                    )}

                    <button
                      onClick={() => {
                        onSelectCourse(course.id);
                        onNavigateToTab('journey'); // Auto launch their journey map!
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition-all cursor-pointer border-0 ${
                        isActive 
                          ? `${activeTheme.primaryButton} shadow-2xs` 
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <span>Ingresar al Cursado</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2B. GESTOR / PROFESSOR LANDING HIGHLIGHT COMPONENT */}
        {activeRole === 'teacher' && (
          <div className="bg-slate-950 text-white rounded-2.5xl p-5 md:p-6 border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl -z-10" />
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider font-sans block">
                  HERRAMIENTAS PARA EL DOCENTE / GESTOR ACADÉMICO 🛡️
                </span>
                <h4 className="font-bold text-sm sm:text-base text-slate-100 leading-snug">
                  Módulo de Homologación de Cátedra & Firmado Digital docent
                </h4>
                <p className="text-slate-400 text-xs max-w-2xl leading-relaxed font-sans">
                  Como administrador o docente de <strong>{activeAcademy.name}</strong>, puedes agregar o estructurar módulos didácticos, agendar talleres de pulso semanales con cupos fijos, y evaluar retos prácticos para otorgar calificaciones.
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab('creator')}
                className="py-3 px-5 bg-white text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-transform hover:scale-103 shrink-0 cursor-pointer border-0"
              >
                <span>Consola de Gestión</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. STUDENT DETAILED LEARNING BOARD */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Profile Card & XP Level representation (8 Columns) */}
          <div className="md:col-span-8 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {activeAcademy.logoUrl ? (
                    activeAcademy.logoUrl.startsWith('http') ? (
                      <img 
                        src={activeAcademy.logoUrl} 
                        alt={activeAcademy.name} 
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl border-2 border-indigo-400 shadow-sm bg-slate-800 flex items-center justify-center text-3xl shrink-0">
                        {activeAcademy.logoUrl}
                      </div>
                    )
                  ) : (
                    <div className="w-16 h-16 rounded-2xl border-2 border-indigo-400 shadow-sm bg-indigo-650 flex items-center justify-center text-white text-xl font-black shrink-0">
                      {activeAcademy.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-sans text-white">{activeAcademy.name}</h2>
                      <span className="bg-amber-500/10 text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        Campus Validado
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">Sede virtual privada integrada en el Nodo Evaluador docent</p>
                  </div>
                </div>

                {/* Day Streak Box */}
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/10 text-amber-400 flex items-center justify-center rounded-xl font-bold">
                    🔥
                  </div>
                  <div>
                    <div className="text-amber-400 font-extrabold text-sm">{user.streak} días</div>
                    <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Racha Activa</div>
                  </div>
                </div>
              </div>

              {/* XP Level bar info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-indigo-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-current text-indigo-400" />
                    COMPETENCIA NIVEL {user.level} (Acreditación Activa)
                  </span>
                  <span className="text-slate-400">{user.xp} / {xpNeededForNextLevel} XP</span>
                </div>
                <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-1000"
                    style={{ width: `${xpProgressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-450 italic">Conseguir {xpNeededForNextLevel - user.xp} XP adicionales para tramitar tu certificado final homologado.</p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mt-6 flex flex-wrap gap-4 text-xs font-sans">
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold text-base">
                  {user.completedNodes ? user.completedNodes.length : 0}
                </span>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Procedimientos Completos</span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold text-base">
                  {user.submissions ? user.submissions.length : 0}
                </span>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Proyectos Evaluados</span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold text-base">{user.registeredTalleres ? user.registeredTalleres.length : 0}</span>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Talleres Clínicos</span>
              </div>
            </div>
          </div>

          {/* Current Interactive Hub Node Module (4 Columns) */}
          <div className="md:col-span-4 bg-white rounded-3xl p-6 border border-slate-150 shadow-sm flex flex-col justify-between space-y-4 text-left">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-800 px-2.5 py-0.5 rounded border border-indigo-100">
                  Resumen de Progreso
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Hito Actual</span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm tracking-tight line-clamp-1">
                {activeCourse?.title}
              </h3>
              
              {activeModule ? (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                  <span className="text-[8px] font-bold text-indigo-700 uppercase block tracking-wider">MÓDULO {activeModule.order} / {activeCourse?.modules.length}</span>
                  <h4 className="text-xs font-bold text-slate-850 leading-tight">
                    {activeModule.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                    {activeModule.shortDesc}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1 select-none">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {activeModule.duration}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-sans">Todos los hitos prácticos han sido completados para este pensum.</p>
              )}
            </div>

            <button 
              onClick={onNavigateToJourney}
              className={`w-full py-3 px-4 ${activeTheme.primaryButton} rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs border-0`}
            >
              <span>Ir al Lienzo de la Ruta</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* 4. LIVE SCHEDULE & MILESTONES PORTFOLIO */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Live workshops lists/scheduler (7 Columns) */}
          <div className="lg:col-span-7 bg-white border border-slate-150 rounded-3xl p-6 shadow-xs space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-base font-sans tracking-tight">
                  Clínicas Virtuales Sincrónicas & Talleres de Pulso
                </h3>
                <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full select-none border border-indigo-100">
                  Prácticas Supervisadas
                </span>
              </div>
              <p className="text-xs text-slate-550 mt-1 font-sans">
                Asistencia sincrónica requerida para la firma de la analítica. Reserva tu cupo virtual para interactuar face-to-face con los instructores autorizados.
              </p>
            </div>

            {/* List of active workshops */}
            <div className="space-y-4">
              {talleres.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6 border border-dashed border-slate-150 rounded-2xl">
                  No hay talleres de pulso programados esta semana.
                </p>
              ) : (
                talleres.map(t => {
                  const isRegistered = user.registeredTalleres.includes(t.id);
                  
                  return (
                    <div 
                      key={t.id}
                      className={`border rounded-2.5xl p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                        isRegistered 
                          ? `${activeTheme.secondaryBg} ${activeTheme.accentBorder} shadow-xs` 
                          : 'bg-white border-slate-205 hover:border-slate-350 shadow-3xs'
                      }`}
                    >
                      <div className="space-y-2 flex-grow">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                            t.type === 'Feedback' 
                              ? 'bg-pink-100 text-pink-850 border-pink-200' 
                              : t.type === 'Masterclass'
                              ? 'bg-purple-100 text-purple-850 border-purple-200'
                              : 'bg-indigo-100 text-indigo-850 border-indigo-200'
                          }`}>
                            {t.type}
                          </span>
                          <span className="text-[10px] text-slate-450 font-sans select-none font-medium">
                            Impartido por {t.instructor}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 font-sans tracking-tight leading-normal">
                          {t.title}
                        </h4>

                        {/* Meta date & times */}
                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-sans">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {t.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {t.time} hs (Arg)
                          </span>
                          {t.spotsLeft > 0 && !isRegistered && (
                            <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                              ⚠️ {t.spotsLeft} vacantes
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Register Toggle Button */}
                      <button
                        onClick={() => onRegisterTaller(t.id)}
                        className={`px-4 py-2.5 border rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer text-center border-0 ${
                          isRegistered 
                            ? `${activeTheme.primaryButton} shadow-2xs` 
                            : 'bg-white border border-slate-250 text-slate-700 hover:bg-slate-50 hover:border-slate-350'
                        }`}
                      >
                        {isRegistered ? 'Inscrito ★' : 'Inscribirme'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Portfolio gallery & badges section (5 Columns) */}
          <div className="lg:col-span-5 bg-white border border-slate-150 rounded-3xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-sans tracking-tight flex items-center gap-2">
                <Award className={`w-5 h-5 ${activeTheme.accentText} shrink-0`} />
                Portafolio de Hitos Digitales Grados
              </h3>
              <p className="text-xs text-slate-550 mt-1 font-sans">
                Tus entregas evaluadas por mentores forman parte de tu expediente analítico homologado en docent.
              </p>
            </div>

            <div className="space-y-4">
              {user.submissions && user.submissions.length > 0 ? (
                user.submissions.map(sub => (
                  <div 
                    key={sub.id} 
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wide font-sans">
                        Reto Homologable
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        sub.gradeBadge === 'Oro'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : sub.gradeBadge === 'Plata'
                          ? 'bg-slate-50 text-slate-800 border-slate-200'
                          : 'bg-orange-50 text-orange-800 border-orange-200'
                      }`}>
                        Insignia {sub.gradeBadge || (sub.status === 'reviewed' ? 'Homologada' : 'Pendiente')}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs sm:text-md text-slate-850 font-sans truncate">
                        {sub.moduleTitle}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-normal line-clamp-2 italic">
                        &ldquo;{sub.textContent}&rdquo;
                      </p>
                    </div>

                    {sub.feedback ? (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-155 text-xs text-slate-600 space-y-1">
                        <span className="font-semibold text-slate-800 hover:underline block text-[10px] uppercase font-sans tracking-wide">Comentarios del Certificador:</span>
                        <p>{sub.feedback}</p>
                      </div>
                    ) : (
                      <div className="bg-amber-50/20 p-3 rounded-xl border border-dashed border-amber-200 text-xs text-amber-800">
                        ⌛ Evaluando evidencias bajo norma docent.
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400">
                  <FolderDot className="w-8 h-8 mx-auto text-slate-350 mb-1" />
                  <p className="text-xs font-medium font-sans animate-pulse">Ningún entregable acreditado aún.</p>
                  <button 
                    onClick={onNavigateToJourney}
                    className="text-xs text-indigo-600 font-bold hover:underline mt-2 cursor-pointer border-0 bg-transparent"
                  >
                    Hacer mi primera entrega
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
