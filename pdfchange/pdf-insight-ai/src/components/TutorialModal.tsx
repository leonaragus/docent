import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Brain, Zap, Download } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: BookOpen,
    title: "Documentos",
    description: "Gestiona tus PDF, Word y texto con total libertad.",
    color: "from-blue-400 to-blue-600"
  },
  {
    icon: Brain,
    title: "Inteligencia",
    description: "Chat preciso con Gemini y razonamiento profundo.",
    color: "from-purple-400 to-purple-600"
  },
  {
    icon: Zap,
    title: "Comparación",
    description: "Matrices inteligentes side-by-side de tus documentos.",
    color: "from-orange-400 to-orange-600"
  },
  {
    icon: Download,
    title: "Exportación",
    description: "PDFs profesionales listos para tus alumnos.",
    color: "from-emerald-400 to-emerald-600"
  }
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full overflow-hidden border border-slate-200/50"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
                Tu Guía <span className="text-indigo-600">RAICEP</span>
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all hover:rotate-90"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                    <step.icon size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
              <button
                onClick={onClose}
                className="w-full bg-slate-950 text-white py-3 rounded-xl font-bold hover:bg-indigo-600 transition-all transform hover:scale-[1.02]"
              >
                ¡Comenzar ahora!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
