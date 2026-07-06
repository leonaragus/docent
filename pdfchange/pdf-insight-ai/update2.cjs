const fs = require('fs');
const path = 'C:/Users/Leonardo/docents/docent-suite/pdfchange/pdf-insight-ai/src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Inject the Killer Title at the top
// We look for the main header or the first major container. In AI Studio apps, it's often something like <header className="bg-slate-900/60...
// Let's replace `<div className="min-h-screen` with the title injection.
content = content.replace(
  /<div className="min-h-screen bg-slate-950 p-4 sm:p-8">/g,
  `<div className="min-h-screen bg-slate-950 p-4 sm:p-8">
      {/* DOCENT BRANDING HEADER */}
      <div className="w-full max-w-6xl mx-auto mb-8 text-center animate-fadeIn">
        <h2 className="text-indigo-400 font-black tracking-[0.2em] text-xs uppercase mb-2 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]">
          DOCENT Suite
        </h2>
        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-500 tracking-tight drop-shadow-lg">
          NÚCLEO <span className="font-light">| Analista Cognitivo</span>
        </h1>
        <p className="text-slate-400 text-sm mt-3 font-medium">Extrae el ADN de tus documentos escolares en segundos con IA local y en la nube.</p>
      </div>`
);
// In case the class was modified or different:
content = content.replace(
  /<div className="min-h-screen text-slate-100/g,
  `<div className="min-h-screen text-slate-100">
      <div className="w-full max-w-6xl mx-auto pt-6 mb-6 text-center animate-fadeIn">
        <h2 className="text-indigo-400 font-black tracking-[0.2em] text-[10px] uppercase mb-1 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]">DOCENT Suite</h2>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-500 tracking-tight">NÚCLEO <span className="font-light">Cognitivo</span></h1>
      </div>`
);

// 2. Inject Teleprompter Link
// We look for the export button area. The word "Descargar PDF" or similar should be there.
// We can inject a new button.
const exportBtnRegex = /(<button[^>]*onClick=\{handleExportPDF\}[^>]*>[\s\S]*?<\/button>)/;
content = content.replace(exportBtnRegex, (match) => {
  return `${match}
  <button 
    onClick={() => {
      try {
        localStorage.setItem('docent_teleprompter_text', generatedSummary || "Error al cargar el resumen");
        window.open('http://localhost:5173/#teleprompter', '_blank');
      } catch (err) {
        console.error("Error linking to teleprompter", err);
        alert("Asegúrate de tener DOCENT Suite corriendo en el puerto 5173.");
      }
    }}
    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2 border border-emerald-400/30"
    title="Enviar el resumen directamente al Teleprompter de DOCENT para grabarlo"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z"/><rect x="3" y="6" width="12" height="12" rx="2" ry="2"/></svg>
    Enviar a Teleprompter
  </button>`;
});

// Since the variable containing the AI output might be called something else (e.g., `result`, `chatOutput`, `response`), 
// we will replace `generatedSummary` with a querySelector approach to just grab the raw text if variable is out of scope.
content = content.replace(
  /localStorage\.setItem\('docent_teleprompter_text', generatedSummary \|\| "Error al cargar el resumen"\);/,
  `const textoAI = document.querySelector('.prose')?.textContent || document.querySelector('.markdown-body')?.textContent || "Texto no encontrado";
   localStorage.setItem('docent_teleprompter_text', textoAI);`
);

fs.writeFileSync(path, content);
console.log('App.tsx updated successfully with Title and Teleprompter Link.');
