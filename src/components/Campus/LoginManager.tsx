import React, { useState } from 'react';
import { UserState } from '../campusTypes';
import { 
  User, 
  LogIn, 
  RefreshCw, 
  UserCheck, 
  X, 
  ChevronRight, 
  Sparkles,
  Zap,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginManagerProps {
  user: UserState;
  students: UserState[];
  onSelectStudent: (student: UserState) => void;
  onCreateStudent: (name: string, avatar: string, level: number, xp: number) => void;
  onUpdateUser: (updated: UserState) => void;
  activeRole: 'student' | 'teacher';
  onChangeRole: (role: 'student' | 'teacher') => void;
  onResetData: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', // Leo
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', // Sofia
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', // Alejandro
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', // Laura
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'  // Maria
];

export default function LoginManager({
  user,
  students,
  onSelectStudent,
  onCreateStudent,
  onUpdateUser,
  activeRole,
  onChangeRole,
  onResetData
}: LoginManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [startLevel, setStartLevel] = useState(user.level);
  const [startXP, setStartXP] = useState(user.xp);
  const [isSaved, setIsSaved] = useState(false);

  // Sign out / Change profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;

    const existingStudent = students.find(s => s.name.toLowerCase() === tempName.trim().toLowerCase());
    if (existingStudent) {
      onSelectStudent({
        ...existingStudent,
        avatar: selectedAvatar,
        level: Number(startLevel),
        xp: Number(startXP)
      });
    } else {
      onCreateStudent(tempName.trim(), selectedAvatar, Number(startLevel), Number(startXP));
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsOpen(false);
    }, 1500);
  };

  const handleQuickLogin = (name: string, avatar: string, xpLevel: number, xpPoints: number) => {
    setTempName(name);
    setSelectedAvatar(avatar);
    setStartLevel(xpLevel);
    setStartXP(xpPoints);
    onUpdateUser({
      ...user,
      name: name,
      avatar: avatar,
      level: xpLevel,
      xp: xpPoints
    });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Absolute floating quick log-in trigger or top action button */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Toggle switch with modern design */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => onChangeRole('student')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeRole === 'student'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Estudiante
          </button>
          <button
            onClick={() => onChangeRole('teacher')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeRole === 'teacher'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            Gestor / Creador 🛠️
          </button>
        </div>

        {/* Dynamic Log In Profile Card */}
        <button
          onClick={() => {
            setTempName(user.name);
            setSelectedAvatar(user.avatar);
            setStartLevel(user.level);
            setStartXP(user.xp);
            setIsOpen(true);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 text-white hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer text-xs font-medium shrink-0 group shadow-xs"
        >
          <LogIn className="w-4 h-4 text-violet-400 group-hover:translate-x-0.5 transition-transform" />
          <span>Iniciar / Cambiar Perfil</span>
        </button>
      </div>

      {/* Modern High-End Overlay Login Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-xs"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 200, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 200, scale: 0.95 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-slate-100 shadow-2xl z-55 overflow-y-auto p-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 font-sans">
                        Portal de Sesión docent
                      </h3>
                      <p className="text-[10px] text-slate-400">Configura tu perfil de estudiante o gestor de inmediato</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 px-2 hover:bg-slate-100 rounded-lg text-slate-400 text-xs font-bold"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Simulated profiles quick selector */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center bg-slate-100/50 p-2 rounded-xl border border-slate-200/50">
                    <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-widest">
                      Seleccionar Alumno Activo
                    </span>
                    <span className="text-[9px] bg-indigo-100 px-2 py-0.5 rounded text-indigo-700 font-bold">
                      {students.length} Perfiles
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Selecciona un perfil de estudiante para simular sus entregas, progreso y calificaciones:
                  </p>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {students.map((stu) => {
                      const isCurrent = stu.name === user.name;
                      return (
                        <button
                          type="button"
                          key={stu.name}
                          onClick={() => {
                            onSelectStudent(stu);
                            setTempName(stu.name);
                            setSelectedAvatar(stu.avatar);
                            setStartLevel(stu.level);
                            setStartXP(stu.xp);
                            setIsOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                            isCurrent
                              ? 'bg-indigo-600 text-white shadow-xs border border-indigo-700'
                              : 'bg-white hover:bg-indigo-50 border border-slate-150 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {stu.avatar ? (
                              <img src={stu.avatar} className="w-6 h-6 rounded-full object-cover border border-slate-100" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-[10px] shrink-0 border border-slate-150">
                                {stu.name ? stu.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}
                            <span className="truncate max-w-[150px]">{stu.name}</span>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-mono ${
                            isCurrent ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            Lv.{stu.level} • {stu.xp} XP
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom login form */}
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="border-t border-slate-150 pt-4">
                    <span className="text-[9px] font-extrabold text-indigo-700 uppercase tracking-widest block mb-1">Crear Nuevo Perfil Alumno</span>
                    <p className="text-[10px] text-slate-500 mb-3 leading-normal">Crea un alumno único para la academia de diseño u oficios y evalúa su cursado:</p>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tu Nombre de Usuario:</label>
                        <input
                          type="text"
                          required
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          placeholder="Ingresa tu nombre..."
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </div>

                      {/* Level and XP setting tool */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nivel Inicial (Level):</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={startLevel}
                            onChange={(e) => setStartLevel(Number(e.target.value))}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">XP Inicial (Puntos):</label>
                          <input
                            type="number"
                            min="0"
                            max="5000"
                            value={startXP}
                            onChange={(e) => setStartXP(Number(e.target.value))}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Avatar Picker presets */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Selecciona un Avatar de Creador:</label>
                        <div className="flex gap-2 flex-wrap">
                          {PRESET_AVATARS.map((url, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedAvatar(url)}
                              className={`w-10 h-10 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                                selectedAvatar === url 
                                  ? 'border-indigo-600 ring-2 ring-indigo-100 scale-105 shadow-xs' 
                                  : 'border-transparent hover:border-slate-300'
                              }`}
                            >
                              <img src={url} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer text-center"
                  >
                    Guardar y Entrar como {tempName || 'Usuario'}
                  </button>

                  {isSaved && (
                    <div className="text-xs text-emerald-600 font-semibold text-center animate-bounce">
                      ✓ ¡Perfil de sesión sincronizado con éxito!
                    </div>
                  )}
                </form>

              </div>

              {/* Reset stats buttons */}
              <div className="border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    onResetData();
                    setIsOpen(false);
                  }}
                  className="w-full py-2 bg-slate-50 hover:bg-red-50 text-red-600 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200/60 transition-colors"
                >
                  Reiniciar Simulador Académico (Reset)
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
