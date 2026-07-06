import React, { useState } from 'react';
import { X, ExternalLink, HardDrive, Share2, Link as LinkIcon, CheckSquare, Square } from 'lucide-react';

interface DriveTutorialModalProps {
  onClose: () => void;
  lang: 'es' | 'en';
}

export function DriveTutorialModal({ onClose, lang }: DriveTutorialModalProps) {
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  const handleClose = () => {
    if (doNotShowAgain) {
      localStorage.setItem('docent_show_drive_tutorial', 'false');
    }
    onClose();
  };

  const steps = [
    {
      title: lang === 'en' ? '1. Upload to Google Drive' : '1. Sube el video a Drive',
      desc: lang === 'en' 
        ? 'Open Google Drive and drag the downloaded .mp4 file into your folder.' 
        : 'Abre Google Drive y arrastra el archivo .mp4 descargado a tu carpeta.',
      img: '/step1_upload_drive.png',
      icon: <HardDrive className="w-5 h-5 text-indigo-400" />
    },
    {
      title: lang === 'en' ? '2. Share and get the link' : '2. Comparte y obtén el enlace',
      desc: lang === 'en'
        ? 'Right-click the video, select "Share", and change General Access to "Anyone with the link". Then copy the link.'
        : 'Haz clic derecho en el video, selecciona "Compartir" y cambia el Acceso General a "Cualquier persona con el enlace". Luego copia el enlace.',
      img: '/step2_share_link.png',
      icon: <Share2 className="w-5 h-5 text-emerald-400" />
    },
    {
      title: lang === 'en' ? '3. Paste link in Docent Suite' : '3. Pega el enlace en Docent Suite',
      desc: lang === 'en'
        ? 'Return here and paste your link in the URL field of your class to encrypt and distribute it.'
        : 'Regresa aquí y pega tu enlace en el campo de URL de tu clase para encriptarlo y distribuirlo.',
      img: '/step3_paste_link.png',
      icon: <LinkIcon className="w-5 h-5 text-amber-400" />
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700/50 shadow-2xl rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-slate-900/90 backdrop-blur border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {lang === 'en' ? 'Your recording is ready!' : '¡Tu grabación está lista!'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {lang === 'en' ? 'Follow these steps to share your class with students.' : 'Sigue estos pasos para compartir tu clase con los alumnos.'}
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Steps Grid */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 flex flex-col items-center text-center group hover:bg-slate-800 transition-colors">
                <div className="w-12 h-12 rounded-full bg-slate-900 shadow-inner flex items-center justify-center mb-4 border border-slate-700 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-200 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 mb-5 flex-grow">{step.desc}</p>
                
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-700 relative">
                  <img 
                    src={step.img} 
                    alt={step.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with Checkbox */}
        <div className="sticky bottom-0 z-10 flex flex-col sm:flex-row items-center justify-between px-6 py-5 bg-slate-900/90 backdrop-blur border-t border-slate-800 gap-4">
          <button 
            onClick={() => setDoNotShowAgain(!doNotShowAgain)}
            className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group"
          >
            <div className="relative flex items-center justify-center">
              {doNotShowAgain ? (
                <CheckSquare className="w-5 h-5 text-indigo-500" />
              ) : (
                <Square className="w-5 h-5 text-slate-500 group-hover:text-slate-400" />
              )}
            </div>
            <span className="text-sm select-none">
              {lang === 'en' ? 'Do not show this tutorial again' : 'No volver a mostrar este tutorial'}
            </span>
          </button>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a 
              href="https://drive.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
            >
              <ExternalLink className="w-4 h-4" />
              {lang === 'en' ? 'Open Google Drive' : 'Abrir Google Drive'}
            </a>
            <button 
              onClick={handleClose}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]"
            >
              {lang === 'en' ? 'Got it!' : '¡Entendido!'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
