import React, { useState, useRef } from 'react';
import Modal from './Modal';
import { Upload, Palette, Check } from 'lucide-react';
import { ColorThemeId, COLOR_THEMES } from '../theme';

interface HeaderCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionName: string;
  institutionSubtitle: string;
  institutionLogo: string; // Emoji or Base64/URL
  colorThemeId: ColorThemeId;
  onSave: (name: string, subtitle: string, logo: string, theme: ColorThemeId) => void;
}

const EMOJIS = ['🎓', '🏫', '💻', '🎨', '🧪', '📚', '⚡', '📊', '📝', '💡', '🌟'];

export default function HeaderCustomizeModal({
  isOpen,
  onClose,
  institutionName,
  institutionSubtitle,
  institutionLogo,
  colorThemeId,
  onSave
}: HeaderCustomizeModalProps) {
  const [name, setName] = useState(institutionName);
  const [subtitle, setSubtitle] = useState(institutionSubtitle);
  const [logo, setLogo] = useState(institutionLogo);
  const [selectedTheme, setSelectedTheme] = useState<ColorThemeId>(colorThemeId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name.trim(), subtitle.trim(), logo, selectedTheme);
    onClose();
  };

  const themesList = Object.values(COLOR_THEMES);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalizar Datos de su Institución"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre de la Institución */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            Nombre de la Institución
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Escuela de Negocios, Academia Digital"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
          />
        </div>

        {/* Subtítulo / Descripción */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            Subtítulo o Eslogan de Gestión
          </label>
          <input
            type="text"
            required
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Ej. Control de alumnos, cuotas y mora automatizada"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
          />
        </div>

        {/* --- GAMA DE COLORES CON PREVISUALIZACIÓN --- */}
        <div className="border-t border-slate-100 pt-4">
          <label className="text-sm font-bold text-slate-750 flex items-center gap-1.5 mb-2.5">
            <Palette className="h-4.5 w-4.5 text-indigo-500" />
            Gama de Colores de la Aplicación
          </label>
          
          <div className="grid grid-cols-1 gap-2.5">
            {themesList.map((t) => {
              const isSelected = selectedTheme === t.id;
              
              // Custom color-specific pills for the live preview pill bar
              let barColor = 'bg-indigo-600';
              let badgeColor = 'bg-indigo-50 text-indigo-700';
              if (t.id === 'emerald') {
                barColor = 'bg-emerald-600';
                badgeColor = 'bg-emerald-50 text-emerald-700';
              } else if (t.id === 'purple') {
                barColor = 'bg-purple-600';
                badgeColor = 'bg-purple-50 text-purple-700';
              }

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTheme(t.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50/15 shadow-sm ring-1 ring-indigo-600' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1 z-10">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900">{t.name}</span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                          <Check className="h-2.5 w-2.5" /> Activo
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium max-w-sm">
                      {t.description}
                    </p>
                  </div>

                  {/* Micro Live Preview Frame inside the button */}
                  <div className="border border-slate-200/80 bg-white p-2.5 rounded-xl shrink-0 w-full sm:w-48 shadow-xs flex flex-col gap-1.5 pointer-events-none scale-95 origin-right">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className={`h-2.5 w-2.5 rounded-full ${barColor}`} />
                        <span className="text-[8px] font-black text-slate-600 uppercase">PREVIEW</span>
                      </div>
                      <span className={`text-[7px] font-bold px-1 py-0.2 rounded ${badgeColor}`}>
                        12 ALUMNAS
                      </span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full w-3/4 rounded-full ${barColor}`} />
                    </div>
                    <div className="flex items-center justify-between text-[7px] text-slate-400 font-extrabold">
                      <span>Curso Activo</span>
                      <span className="text-slate-600">$45.000</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Logo / Ícono */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <label className="block text-sm font-bold text-slate-700">
            Logo / Ícono de la Institución
          </label>

          {/* Preview */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-150 shrink-0 overflow-hidden">
              {logo.startsWith('data:') || logo.startsWith('http') ? (
                <img src={logo} alt="Logo" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-3xl">{logo}</span>
              )}
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 block">Vista previa del Logo</span>
              <p>Puedes seleccionar un emoji de abajo, pegar un enlace de imagen o subir una foto desde tu dispositivo.</p>
            </div>
          </div>

          {/* Emoji selector */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-450 block">Seleccionar un emoji predefinido:</span>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setLogo(emoji)}
                  className={`h-10 w-10 text-xl rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                    logo === emoji ? 'border-indigo-600 bg-indigo-50/50 scale-105' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* URL or Upload option */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* File Upload */}
            <div>
              <span className="text-xs font-bold text-slate-450 block mb-1.5">Subir Logo (Imagen):</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-all cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                Subir desde Dispositivo
              </button>
            </div>

            {/* Custom URL */}
            <div>
              <span className="text-xs font-bold text-slate-450 block mb-1.5">O pegar Enlace de Imagen:</span>
              <input
                type="text"
                placeholder="https://ejemplo.com/logo.png"
                value={logo.startsWith('data:') ? '' : logo}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  if (val) setLogo(val);
                }}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4.5 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors text-sm font-bold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all text-sm font-bold cursor-pointer shadow-md shadow-indigo-600/10"
          >
            Guardar Configuración
          </button>
        </div>
      </form>
    </Modal>
  );
}
