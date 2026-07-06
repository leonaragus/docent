const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/Leonardo/docents/docent-suite/branding/brand-builder/src';
const destDir = 'C:/Users/Leonardo/docents/docent-suite/src/components';

// 1. Copy templatesData.ts
let templatesData = fs.readFileSync(path.join(srcDir, 'templatesData.ts'), 'utf8');
fs.writeFileSync(path.join(destDir, 'nexusTemplates.ts'), templatesData);

// 2. Copy types.ts
let typesData = fs.readFileSync(path.join(srcDir, 'types.ts'), 'utf8');
fs.writeFileSync(path.join(destDir, 'nexusTypes.ts'), typesData);

// 3. Migrate and refactor App.tsx -> DocentNexus.tsx
let appContent = fs.readFileSync(path.join(srcDir, 'App.tsx'), 'utf8');

// Fix imports
appContent = appContent.replace(/from '\.\/templatesData'/g, "from './nexusTemplates'");
appContent = appContent.replace(/from '\.\/types'/g, "from './nexusTypes'");

// Rename function App to DocentNexus
appContent = appContent.replace(/export default function App\(\) \{/g, "export default function DocentNexus() {");

// Enforce offline-first (bypass fetch to /api/generate-branding)
appContent = appContent.replace(
  /const eventSource = new EventSource\(`\/api\/generate-branding\?\$\{params\.toString\(\)\}`\);[\s\S]*?eventSource\.onerror = \(err\) => \{[\s\S]*?eventSource\.close\(\);\n\s*\};\n\s*\};/g,
  `// OFFLINE FIRST ENFORCEMENT
    setTimeout(() => {
      triggerFallback(formData.institutionName, formData.type, formData.vibe, formData.font);
      setIsLoading(false);
    }, 1500); // Simulate processing time for UX
  };`
);

// Add "Export to Suite" logic inside component
appContent = appContent.replace(
  /const copyBrandSpecs = \(\) => \{/,
  `const handleExportToSuite = () => {
    localStorage.setItem('docent_nexus_brand', JSON.stringify({
      name: brandName,
      colors: brandColors,
      font: brandFont
    }));
    setCopiedColor('suite');
    setTimeout(() => setCopiedColor(null), 3000);
    // Dispath an event so App.tsx can listen and apply
    window.dispatchEvent(new Event('nexus_brand_updated'));
  };
  const copyBrandSpecs = () => {`
);

// Add the Export to Suite button next to Copy Specs
appContent = appContent.replace(
  /<button\s+onClick=\{copyBrandSpecs\}\s+className="[^"]*"\s*>\s*<Copy size=\{16\} \/>\s*Copiar Especificaciones\s*<\/button>/,
  `$&
  <button
    onClick={handleExportToSuite}
    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/20 border border-transparent"
  >
    {copiedColor === 'suite' ? <Check size={16} /> : <ArrowUpRight size={16} />} 
    {copiedColor === 'suite' ? '¡Exportado a la Suite!' : 'Exportar a la Suite'}
  </button>`
);


// Refactor light theme to dark theme (Ultramoderno, Glassmorphism)
const themeReplacements = [
  // Backgrounds
  { from: /bg-\[\#F6F5FB\]/g, to: 'bg-black' },
  { from: /bg-white\/90/g, to: 'bg-slate-900/50' },
  { from: /bg-white\/95/g, to: 'bg-slate-900/50' },
  { from: /bg-white/g, to: 'bg-slate-900/50' },
  { from: /bg-slate-50\/80/g, to: 'bg-slate-950/80' },
  { from: /bg-slate-50/g, to: 'bg-slate-950' },
  { from: /bg-slate-100/g, to: 'bg-slate-800' },
  { from: /bg-slate-200\/80/g, to: 'bg-slate-700/80' },
  { from: /bg-violet-50\/80/g, to: 'bg-indigo-500/20' },
  { from: /bg-violet-50/g, to: 'bg-indigo-900/30' },
  { from: /bg-violet-100/g, to: 'bg-indigo-900/50' },
  // Text Colors
  { from: /text-slate-800/g, to: 'text-slate-100' },
  { from: /text-slate-650/g, to: 'text-slate-300' },
  { from: /text-slate-600/g, to: 'text-slate-300' },
  { from: /text-slate-750/g, to: 'text-slate-200' },
  { from: /text-slate-500/g, to: 'text-slate-400' },
  { from: /text-violet-700/g, to: 'text-indigo-300' },
  { from: /text-violet-600/g, to: 'text-indigo-400' },
  // Borders
  { from: /border-violet-100\/50/g, to: 'border-slate-800/50' },
  { from: /border-violet-100/g, to: 'border-slate-800' },
  { from: /border-violet-200\/50/g, to: 'border-slate-700/50' },
  { from: /border-violet-200/g, to: 'border-slate-700' },
  { from: /border-violet-400/g, to: 'border-indigo-500' },
  { from: /border-violet-500/g, to: 'border-indigo-400' },
  // Shadows
  { from: /shadow-violet-200\/40/g, to: 'shadow-indigo-500/10' },
  { from: /shadow-violet-200\/30/g, to: 'shadow-indigo-500/10' },
  { from: /shadow-violet-200\/50/g, to: 'shadow-indigo-500/10' },
  // Other accents
  { from: /ring-violet-500\/10/g, to: 'ring-indigo-500/30' },
  { from: /ring-violet-500\/20/g, to: 'ring-indigo-500/40' },
  { from: /hover:bg-slate-100/g, to: 'hover:bg-slate-800' },
  { from: /hover:border-violet-200/g, to: 'hover:border-slate-600' }
];

themeReplacements.forEach(rep => {
  appContent = appContent.replace(rep.from, rep.to);
});

fs.writeFileSync(path.join(destDir, 'DocentNexus.tsx'), appContent);
console.log('Successfully migrated DocentNexus.tsx and types!');
