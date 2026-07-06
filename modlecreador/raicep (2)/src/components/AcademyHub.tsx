import React, { useState } from 'react';
import { Academy, ThemePreset } from '../types';
import { THEME_PRESETS } from '../themePresets';
import { 
  Building2, 
  Plus, 
  ChevronDown, 
  Check, 
  Sparkles, 
  Globe, 
  Palette, 
  Trash2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AcademyHubProps {
  academies: Academy[];
  activeAcademyId: string;
  onSelectAcademy: (id: string) => void;
  onCreateAcademy: (newAcademy: { name: string; subdomain: string; themeId: string; creatorName: string; logoUrl?: string }) => void;
  onDeleteAcademy: (id: string) => void;
  activeTheme: ThemePreset;
}

export default function AcademyHub({
  academies,
  activeAcademyId,
  onSelectAcademy,
  onCreateAcademy,
  onDeleteAcademy,
  activeTheme
}: AcademyHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form states
  const [newName, setNewName] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState('emerald'); // default to a fresh green so they see the color changed!
  const [creatorName, setCreatorName] = useState('Leo Morales');
  const [logoUrl, setLogoUrl] = useState('🎓');
  const [formError, setFormError] = useState('');

  const activeAcademy = academies.find(a => a.id === activeAcademyId) || academies[0];

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sanitize subdomain value
    const val = e.target.value.toLowerCase().replace(/[^a-z0-h-z0-9-]/g, '');
    setNewSubdomain(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newName.trim()) {
      setFormError('Por favor introduce un nombre para tu academia.');
      return;
    }
    if (!newSubdomain.trim()) {
      setFormError('Por favor introduce un subdominio válido.');
      return;
    }
    if (academies.some(a => a.subdomain === newSubdomain)) {
      setFormError('Este subdominio ya está registrado. Elige otro.');
      return;
    }

    onCreateAcademy({
      name: newName,
      subdomain: newSubdomain,
      themeId: selectedThemeId,
      creatorName,
      logoUrl: logoUrl.trim() || '🎓'
    });

    // Reset fields
    setNewName('');
    setNewSubdomain('');
    setLogoUrl('🎓');
    setShowCreateModal(false);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      
      {/* TRIGGER BAR */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-150 p-3 sm:px-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${activeTheme.secondaryBg} ${activeTheme.accentText} shrink-0`}>
            <Building2 className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans block leading-none">
              Portal Multiacademia Activo
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                {activeAcademy.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {activeAcademy.subdomain}.raicep.app
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Workspaces Switcher Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-250 text-slate-705 text-xs font-bold rounded-xl transition-all cursor-pointer border-0"
          >
            <span>Cambiar o Crear Academia</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* DROPDOWN OPTIONS LIST */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop cover overlay */}
            <div 
              className="fixed inset-0 z-40 bg-black/5" 
              onClick={() => setIsOpen(false)} 
            />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 left-0 sm:right-0 sm:left-auto sm:w-[480px] mt-2 bg-white rounded-3xl border border-slate-200 shadow-xl p-5 z-50 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">
                  Tus Academias Registradas
                </h4>
                <span className="text-[10px] font-sans font-bold text-slate-400">
                  {academies.length} de forma simulada
                </span>
              </div>

              {/* LIST OF CURRENT ACADEMIES */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {academies.map(acad => {
                  const acadTheme = THEME_PRESETS.find(t => t.id === acad.themeId) || THEME_PRESETS[0];
                  const isCurrent = acad.id === activeAcademyId;
                  
                  return (
                    <div 
                      key={acad.id}
                      className={`flex items-center justify-between gap-4 p-3 rounded-2xl transition-all border ${
                        isCurrent 
                          ? `${acadTheme.secondaryBg} ${acadTheme.accentBorder} shadow-2xs` 
                          : 'bg-slate-50 border-slate-100 hover:border-slate-250 hover:bg-white'
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelectAcademy(acad.id);
                          setIsOpen(false);
                        }}
                        className="flex-grow text-left flex items-start gap-3 cursor-pointer border-0 bg-transparent p-0"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shrink-0 text-xs ${acadTheme.primaryButton}`}>
                          {acad.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-xs truncate leading-normal">
                              {acad.name}
                          </p>
                          <p className="text-[10px] text-slate-450 font-mono truncate leading-normal">
                             https://{acad.subdomain}.raicep.app
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isCurrent && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${acadTheme.secondaryBg} ${acadTheme.accentText} border ${acadTheme.accentBorder}`}>
                            Actual
                          </span>
                        )}
                        {academies.length > 1 && (
                          <button
                            onClick={() => {
                              onDeleteAcademy(acad.id);
                            }}
                            title="Eliminar Academia"
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ACTION: CREATE COHORT BUTTON */}
              <div className="border-t border-slate-100 pt-4 flex gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors border-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar Nueva Academia Sincerada</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL: REGISTER NEW ACADEMY (EMPTY & BRAND NEW) */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop filter */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs" 
              onClick={() => setShowCreateModal(false)}
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-xl p-6 md:p-8 border border-slate-200 z-50 relative space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-left"
            >
              <button 
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors border-0 bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="inline-flex p-2 rounded-xl bg-emerald-50 text-emerald-600 mb-2">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">
                  Surgir Nueva Academia Independiente
                </h3>
                <p className="text-xs text-slate-550 leading-relaxed">
                  Creará un espacio de co-aprendizaje completamente en blanco para que puedas organizar cursos nuevos y experimentar el SaaS de extremo a extremo.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* ACADEMY NAME */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-widest block font-sans">
                    Nombre de la Academia
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Creadores de Contenido, Código Ágil, Escuela de Pastelería"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-205 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-semibold focus:outline-hidden transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* SUBDOMAIN */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-widest block font-sans flex items-center justify-between">
                    <span>Subdominio Virtual de Ingreso</span>
                    <span className="text-[9px] font-mono text-emerald-600 font-bold lowercase">Letras, números y guiones</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="ej-pasteleria"
                      value={newSubdomain}
                      onChange={handleSubdomainChange}
                      className="w-full pl-4 pr-[150px] py-3 bg-slate-50 border border-slate-205 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-mono font-bold focus:outline-hidden transition-all placeholder:text-slate-400"
                    />
                    <div className="absolute right-3 text-slate-400 pointer-events-none text-xs font-semibold select-none">
                      .raicep.app
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    Dirección privada simulada: <span className="font-semibold text-indigo-600">https://{newSubdomain || 'subdominio'}.raicep.app</span>
                  </p>
                </div>

                {/* LOGO OF THE ACADEMY SELECTOR */}
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-widest block font-sans flex items-center justify-between">
                    <span>Isotipo o Logo de la Academia</span>
                    <span className="text-[9px] text-slate-400 font-bold font-sans">Se hereda escudo RAICEP si está vacío</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      maxLength={100}
                      placeholder="Ej: 🎨, 🚀, 💻, o pega un link"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-205 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-semibold focus:outline-hidden transition-all"
                    />
                    <div className="w-12 h-12 shrink-0 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center text-2xl" title="Vista previa del Isotipo">
                      {logoUrl || '★'}
                    </div>
                  </div>
                  {/* Quick-choice Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['🎓', '🎨', '🚀', '💻', '🩺', '⚙️', '📚', '👔', '🛠️', '🧠'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setLogoUrl(emoji)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm border font-sans hover:bg-slate-200 transition-colors bg-slate-50 cursor-pointer ${
                          logoUrl === emoji ? 'border-indigo-600 bg-indigo-50 text-indigo-750 font-bold scale-110' : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* THEME IDENTITY (ADDRESSES THE COLOR PREFERENCE!) */}
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-widest block font-sans">
                    Identidad de Marca & Paleta de Colores
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {THEME_PRESETS.map(preset => {
                      const isSel = selectedThemeId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setSelectedThemeId(preset.id)}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                            isSel 
                              ? `${preset.secondaryBg} ${preset.accentBorder} ring-2 ring-indigo-505 shadow-2xs` 
                              : 'bg-slate-50 border-slate-105 hover:bg-slate-100 hover:border-slate-250'
                          }`}
                        >
                          <span className="text-[10px] font-extrabold text-slate-800 leading-tight block">
                            {preset.name.split(' (')[0]}
                          </span>
                          <div className="flex gap-1.5 mt-2">
                            <span className={`w-3.5 h-3.5 rounded-full block ${preset.primaryButton.split(' ')[0]}`} />
                            <span className="text-[8px] font-mono text-slate-400 uppercase">
                              {preset.primaryColor}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CREATOR/STUDENT INITIAL NAME */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-widest block font-sans">
                    Nombre del Estudiante Administrador
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Leo Morales"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-205 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-semibold focus:outline-hidden transition-all"
                  />
                </div>

                {formError && (
                  <p className="text-xs text-red-500 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-100">
                    ⚠️ {formError}
                  </p>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-55 hover:border-slate-350 text-slate-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer bg-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#111827] hover:bg-[#1f2937] text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer border-0"
                  >
                    ¡Surgir Academia de la Red!
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
