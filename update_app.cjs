const fs = require('fs');
let code = fs.readFileSync('C:/Users/Leonardo/docents/docent-suite/src/App.tsx', 'utf-8');
const startIdx = code.indexOf('if (isStudentView) {');
if (startIdx === -1) {
  console.error("isStudentView block not found");
  process.exit(1);
}

const newCode = code.substring(0, startIdx) + `if (isStudentView) {
    if (studentClassData && (studentClassData as any).isExpired) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-red-500/30 p-8 rounded-3xl max-w-md w-full shadow-2xl shadow-red-500/10">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Enlace Caducado</h2>
            <p className="text-slate-400 text-sm mb-6">
              Este enlace interactivo formaba parte del plan gratuito y ha expirado tras 14 días.
            </p>
            <p className="text-xs text-slate-500 bg-slate-950 p-4 rounded-xl">
              Dile a tu profesor que actualice su plan a <span className="text-pink-400 font-bold">DOCENT Pro</span> para generar enlaces permanentes y sin límite.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-black text-slate-100 font-sans relative overflow-hidden flex flex-col">
        
        {/* Cinematic Ambient Background (Animated Blur) */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[150px] animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-pink-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-[pulse_10s_ease-in-out_infinite_alternate]" />
          <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-[pulse_12s_ease-in-out_infinite]" />
        </div>

        {/* Spatial Header */}
        <header className="absolute top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter text-white flex items-center gap-1.5 drop-shadow-md">
                  DOCENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">HORIZON</span>
                </h1>
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{t.studentPortalTitle}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-3 py-1.5">
              <Globe size={10} className="text-indigo-400 animate-spin-slow" />
              <select
                value={lang}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="bg-transparent text-[10px] text-indigo-100 outline-none font-black cursor-pointer uppercase tracking-widest">
                <option value="en" className="bg-slate-900 text-slate-100">EN</option>
                <option value="es" className="bg-slate-900 text-slate-100">ES</option>
              </select>
            </div>

            <button
              onClick={() => { window.location.hash = ''; }}
              className="text-[10px] uppercase tracking-wider bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full flex items-center gap-2 transition-all cursor-pointer font-black shadow-lg">
              <Video size={12} />
              <span>{t.backToTeacher}</span>
            </button>
          </div>
        </header>

        {/* Edge-to-Edge Main Content */}
        <div className="flex-1 w-full h-full relative z-10 flex pt-20 px-6 pb-6">
          <SyncedPlayer 
            lang={lang}
            videoUrl={studentClassData.url}
            srtText={studentClassData.srtText}
            videoFilter="none"
            getFilterStyle={getFilterStyle}
            classTitle={studentClassData.name.replace('.mp4', '').replace(/_/g, ' ')}
            teacherName={studentClassData.teacherName || 'Profesor'}
            subjectName={studentClassData.subjectName || 'Asignatura'}
            chapters={studentClassData.chapters || []}
            quizQuestions={studentClassData.quizQuestions || []}
          />
        </div>

      </div>
    );
  }

  return null;
}

export default App;`;

fs.writeFileSync('C:/Users/Leonardo/docents/docent-suite/src/App.tsx', newCode);
console.log("Updated successfully");
