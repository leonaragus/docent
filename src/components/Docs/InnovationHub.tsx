import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Award, ShieldAlert, FileEdit, Zap, Plus, Flame, ThumbsUp } from 'lucide-react';
import { IdeaItem } from './types';

export default function InnovationHub() {
  const [ideas, setIdeas] = useState<IdeaItem[]>([
    {
      id: 'idea-1',
      title: 'OCR Inteligente con IA',
      description: 'Reconocimiento óptico de caracteres para extraer texto de PDFs escaneados o fotos a Word editable automáticamente.',
      icon: 'brain',
      category: 'IA',
      difficulty: 'Media',
      votes: 148,
    },
    {
      id: 'idea-2',
      title: 'Editor de Páginas Interactivo',
      description: 'Mover, reordenar, rotar, duplicar y eliminar páginas individuales de tus archivos PDF de forma visual previa descarga.',
      icon: 'edit',
      category: 'Edición',
      difficulty: 'Fácil',
      votes: 112,
    },
    {
      id: 'idea-3',
      title: 'Firmador de Contratos Digitales',
      description: 'Sube tu firma escaneada o dibújala en pantalla para estamparla y firmar documentos PDF con validez digital.',
      icon: 'security',
      category: 'Seguridad',
      difficulty: 'Media',
      votes: 95,
    },
    {
      id: 'idea-4',
      title: 'Unión y División Inteligente (Merge/Split)',
      description: 'Fusiona varios archivos de diferentes formatos en un solo PDF ordenado, o divide un PDF multipágina en archivos individuales.',
      icon: 'productivity',
      category: 'Productividad',
      difficulty: 'Fácil',
      votes: 84,
    },
    {
      id: 'idea-5',
      title: 'Traductor de Documentos en Lote',
      description: 'Traduce documentos enteros con inteligencia artificial preservando la disposición de tablas, títulos y estilos originales.',
      icon: 'brain',
      category: 'IA',
      difficulty: 'Avanzada',
      votes: 182,
    },
    {
      id: 'idea-6',
      title: 'Protección Avanzada y Contraseñas',
      description: 'Cifra tus documentos con AES-256 agregando contraseñas seguras, o desbloquea archivos protegidos con un solo clic.',
      icon: 'security',
      category: 'Seguridad',
      difficulty: 'Fácil',
      votes: 73,
    },
    {
      id: 'idea-7',
      title: 'Generador de Resúmenes Ejecutivos',
      description: 'Usa el motor de lenguaje de Gemini para escanear documentos de 100+ páginas y descargar un resumen clave estructurado.',
      icon: 'brain',
      category: 'IA',
      difficulty: 'Avanzada',
      votes: 215,
    },
    {
      id: 'idea-8',
      title: 'Conversor de Audio a Documento Escrito',
      description: 'Carga grabaciones de reuniones, entrevistas o conferencias de voz para generar automáticamente actas legibles en formato Word.',
      icon: 'productivity',
      category: 'Productividad',
      difficulty: 'Avanzada',
      votes: 139,
    },
    {
      id: 'idea-9',
      title: 'Lector Automatizado de Facturas (Extractor)',
      description: 'Lee facturas o recibos en lote, extrae los campos clave (fecha, importe, IVA, emisor) directamente en tablas Excel o JSON.',
      icon: 'productivity',
      category: 'Productividad',
      difficulty: 'Media',
      votes: 124,
    },
    {
      id: 'idea-10',
      title: 'Filtro de Compresión Adaptativo Extremo',
      description: 'Remuestrea dinámicamente imágenes internas usando compresión WebP híbrida adaptativa para reducir el peso un 85% sin degradar el texto.',
      icon: 'productivity',
      category: 'Edición',
      difficulty: 'Media',
      votes: 99,
    }
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleVote = (id: string) => {
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id === id) {
          const alreadyVoted = idea.voted;
          const updatedVotes = alreadyVoted ? idea.votes - 1 : idea.votes + 1;
          
          if (!alreadyVoted) {
            setToastMessage(`¡Gracias por votar por "${idea.title}"! Tu sugerencia ha sido registrada.`);
            setTimeout(() => setToastMessage(null), 3000);
          }
          
          return {
            ...idea,
            votes: updatedVotes,
            voted: !alreadyVoted,
          };
        }
        return idea;
      })
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'brain':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'security':
        return <ShieldAlert className="w-4 h-4 text-blue-400" />;
      case 'edit':
        return <FileEdit className="w-4 h-4 text-emerald-400" />;
      default:
        return <Zap className="w-4 h-4 text-fuchsia-400" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'IA':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20';
      case 'Seguridad':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/20';
      case 'Edición':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20';
      default:
        return 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/20';
    }
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === 'Fácil') return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
    if (diff === 'Media') return 'text-blue-300 bg-blue-500/10 border-blue-500/20';
    return 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20';
  };

  return (
    <div id="innovation-hub-section" className="space-y-6 relative pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-white tracking-tight flex items-center gap-2">
            Faro de Innovación <span className="text-xs bg-slate-900/50 border border-white/10 text-slate-300 px-2 py-0.5 rounded-full font-mono font-medium">10 IDEAS DE FUTURO</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">Propuestas de expansión de última generación. ¡Vota por tus favoritas!</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full font-medium">
          <Flame className="w-4 h-4 animate-bounce text-amber-400" />
          Tendencias
        </div>
      </div>

      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="backdrop-blur-md bg-slate-900/50 border border-indigo-500/30 text-indigo-300 text-xs py-3 px-4 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)] flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>{toastMessage}</span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            id={`idea-card-${idea.id}`}
            className="p-5 rounded-2xl backdrop-blur-md bg-slate-900/50 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between gap-4 group relative overflow-hidden"
          >
            {/* Ambient Background decoration */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-900/50 border border-white/10">
                    {getIcon(idea.icon)}
                  </div>
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${getCategoryBadge(idea.category)}`}>
                    {idea.category}
                  </span>
                </div>
                <span className={`text-[9px] font-mono font-medium px-2 py-0.5 rounded border ${getDifficultyColor(idea.difficulty)}`}>
                  {idea.difficulty}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">{idea.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">{idea.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
              <span className="text-[10px] font-mono text-slate-500">
                Sugerido por la IA • <span className="text-slate-300">{idea.votes} votos</span>
              </span>

              <button
                onClick={() => handleVote(idea.id)}
                id={`vote-btn-${idea.id}`}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium font-mono flex items-center gap-1.5 transition-all ${
                  idea.voted
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-900/50 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${idea.voted ? 'fill-current' : ''}`} />
                {idea.voted ? 'VOTADO' : 'VOTAR'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
