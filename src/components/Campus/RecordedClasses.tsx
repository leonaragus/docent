import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function RecordedClasses({ classes }: { classes: any[] }) {
  const { lang } = useLanguage();
  const [selectedClass, setSelectedClass] = useState<any | null>(classes[0] || null);

  useEffect(() => {
    if (!selectedClass && classes.length > 0) {
      setSelectedClass(classes[0]);
    }
  }, [classes, selectedClass]);

  if (classes.length === 0) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-sm text-slate-500 font-sans">
        {lang === 'es' ? 'No hay clases grabadas disponibles.' : 'No recorded classes available.'}
      </div>
    );
  }

  // Detect YouTube
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Detect Drive
  const getDriveId = (url: string) => {
    if (!url) return null;
    const driveRegExp = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const driveOpenRegExp = /[?&]id=([a-zA-Z0-9_-]+)/;
    const match1 = url.match(driveRegExp);
    if (match1 && match1[1]) return match1[1];
    const match2 = url.match(driveOpenRegExp);
    if (match2 && match2[1]) return match2[1];
    return null;
  };

  const renderPlayer = (c: any) => {
    const url = c.youtubeUrl || c.videoUrl || '';
    const ytId = getYouTubeId(url);
    const driveId = getDriveId(url);

    if (ytId) {
      return (
        <iframe 
          width="100%" 
          height="100%" 
          src={`https://www.youtube.com/embed/${ytId}`} 
          title="YouTube video player" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen>
        </iframe>
      );
    } else if (driveId) {
      return (
        <iframe
          src={`https://drive.google.com/file/d/${driveId}/preview`}
          className="w-full h-full border-0 rounded-xl"
          allow="autoplay"
          allowFullScreen
        />
      );
    } else {
      return (
        <video
          src={url}
          controls
          className="w-full h-full object-contain"
        />
      );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
      <div className="md:col-span-2 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        {selectedClass ? (
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 mb-2">{selectedClass.title}</h2>
            <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden mb-4">
              {renderPlayer(selectedClass)}
            </div>
            <div className="prose prose-sm max-w-none text-slate-650">
               <h4 className="font-bold text-slate-800">{lang === 'es' ? 'Transcripción Sincronizada' : 'Synchronized Transcript'}</h4>
               <p className="whitespace-pre-wrap mt-2">{selectedClass.transcription}</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">{lang === 'es' ? 'Selecciona una clase para verla.' : 'Select a class to watch it.'}</p>
        )}
      </div>
      <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">{lang === 'es' ? 'Clases Anteriores' : 'Previous Classes'}</h3>
        <div className="space-y-2">
            {classes.map(c => (
                <button 
                  key={c.id}
                  onClick={() => setSelectedClass(c)}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-colors border-0 cursor-pointer ${selectedClass?.id === c.id ? 'bg-indigo-50 text-indigo-800 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                    {c.title}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
}
