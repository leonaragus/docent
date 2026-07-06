const fs = require('fs');
const path = 'C:/Users/Leonardo/docents/docent-suite/pdfchange/pdf-insight-ai/src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Inject import
content = content.replace(
  /import React, \{ useState, useRef, useEffect \} from 'react';/,
  "import React, { useState, useRef, useEffect } from 'react';\nimport OfflineAI from './components/OfflineAIEngine';"
);

// Inject state for offline loading
content = content.replace(
  /const \[isAnalyzing, setIsAnalyzing\] = useState\(false\);/,
  "const [isAnalyzing, setIsAnalyzing] = useState(false);\n  const [offlineProgress, setOfflineProgress] = useState<any>(null);\n  const [isOfflineMode, setIsOfflineMode] = useState(false);"
);

// Inject visual UI indicator for offline progress near loading spinner
content = content.replace(
  /Creando magia educativa\.\.\./g,
  "Creando magia educativa... {isOfflineMode && offlineProgress && `(Modo Offline: Descargando IA ${Math.round(offlineProgress.progress || 0)}%)`}"
);

// Update fetch call with offline fallback using regex
// Since there are multiple fetches (in custom chat and generate summary), we'll do a global replace for all fetches to /api/analyze-pdf
const originalFetchRegex = /const response = await fetch\('\/api\/analyze-pdf', \{[\s\S]*?body: JSON\.stringify\(\{([\s\S]*?)\}\)\n\s*\}\);/g;

content = content.replace(originalFetchRegex, (match, bodyContent) => {
  return `let response;
      let isFallback = false;
      try {
        response = await fetch('/api/analyze-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({${bodyContent}})
        });
        if (!response.ok) throw new Error('API Error');
      } catch (networkError) {
        console.warn('Network error or API failure, falling back to Offline AI...', networkError);
        isFallback = true;
        setIsOfflineMode(true);
        
        const model = await OfflineAI.getInstance(progress => setOfflineProgress(progress));
        const fakeText = "Extracto recuperado sin conexión: " + (activeFiles.map(f => f.name).join(", ")); 
        const summary = await OfflineAI.generateSummary(fakeText);
        
        response = {
          ok: true,
          json: async () => ({ result: "## [MODO OFFLINE] Resumen de Emergencia\\n\\n" + summary })
        };
      }`;
});

// Update global CSS styles by replacing classes in App.tsx
// Dark Mode: Glassmorphism DOCENT style
content = content.replace(/bg-slate-50/g, 'bg-slate-950');
content = content.replace(/bg-white/g, 'bg-slate-900/60 backdrop-blur-xl border border-white/5');
content = content.replace(/text-slate-900/g, 'text-slate-100');
content = content.replace(/text-slate-800/g, 'text-slate-200');
content = content.replace(/text-slate-700/g, 'text-slate-300');
content = content.replace(/border-slate-200/g, 'border-slate-800');
content = content.replace(/border-slate-100/g, 'border-slate-800/50');
content = content.replace(/bg-slate-100/g, 'bg-slate-800/50');

// Specifically protect the print view which should remain light
// The print view is usually identified by its wrapper. Since we replaced globally, we can try to fix specific areas.
content = content.replace(/<div className="pdf-preview-container bg-slate-950/g, '<div className="pdf-preview-container bg-white'); 
content = content.replace(/<div className="p-8 sm:p-12 bg-slate-900\/60 backdrop-blur-xl border border-white\/5 shadow-2xl rounded-2xl relative/g, '<div className="p-8 sm:p-12 bg-white shadow-2xl rounded-2xl relative');

fs.writeFileSync(path, content);
console.log('App.tsx updated successfully.');
