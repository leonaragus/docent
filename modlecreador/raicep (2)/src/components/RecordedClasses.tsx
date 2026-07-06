import React, { useState } from 'react';
import { RecordedClass } from '../types';

export default function RecordedClasses({ classes }: { classes: RecordedClass[] }) {
  const [selectedClass, setSelectedClass] = useState<RecordedClass | null>(classes[0] || null);

  if (classes.length === 0) return <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-sm text-slate-500">No hay clases grabadas disponibles.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        {selectedClass ? (
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 mb-2">{selectedClass.title}</h2>
            <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden mb-4">
               {/* Simplified YouTube Embed */}
               <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${selectedClass.youtubeUrl.split('v=')[1]}`} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
              </iframe>
            </div>
            <div className="prose prose-sm max-w-none text-slate-600">
               <h4 className="font-bold text-slate-800">Transcripción Sincronizada</h4>
               <p className="whitespace-pre-wrap mt-2">{selectedClass.transcription}</p>
            </div>
          </div>
        ) : (
          <p>Selecciona una clase para verla.</p>
        )}
      </div>
      <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Clases Anteriores</h3>
        <div className="space-y-2">
            {classes.map(c => (
                <button 
                  key={c.id}
                  onClick={() => setSelectedClass(c)}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${selectedClass?.id === c.id ? 'bg-indigo-50 text-indigo-800 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                    {c.title}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
}
