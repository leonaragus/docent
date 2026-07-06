import React from 'react';
import { Submission } from '../campusTypes';

export default function Evaluations({ submissions }: { submissions: Submission[] }) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <h2 className="text-lg font-extrabold text-slate-800 mb-6">Mis Evaluaciones</h2>
      {submissions.length === 0 ? (
        <p className="text-slate-500 text-sm">No tienes evaluaciones realizadas todavía.</p>
      ) : (
        <div className="space-y-4">
          {submissions.map(sub => (
            <div key={sub.id} className="p-4 rounded-xl border border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h4 className="font-bold text-slate-800">{sub.moduleTitle}</h4>
                <p className="text-xs text-slate-500">Enviado: {sub.submittedAt}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${sub.status === 'reviewed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {sub.status === 'reviewed' ? 'Revisado ✅' : 'Pendiente ⏳'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
