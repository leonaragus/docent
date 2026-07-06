const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'faceads/generador-de-anuncios-y-configuración-de-facebook-ads/src');
const destDir = path.join(__dirname, 'src/components/Magnet');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const filesToMigrate = [
  'types.ts',
  'components/QuickTemplates.ts',
  'components/FacebookPostPreview.tsx',
  'components/AdConfigDisplay.tsx',
  'components/FlyerDesigner.tsx'
];

// Dark mode class replacements
const classReplacements = {
  'bg-white': 'bg-slate-900',
  'bg-slate-50': 'bg-slate-950',
  'bg-slate-100': 'bg-slate-800',
  'bg-slate-200': 'bg-slate-700',
  'border-slate-200': 'border-slate-800',
  'border-slate-100': 'border-slate-800',
  'border-slate-150': 'border-slate-700',
  'border-slate-300': 'border-slate-700',
  'text-slate-900': 'text-white',
  'text-slate-800': 'text-slate-100',
  'text-slate-700': 'text-slate-300',
  'text-slate-600': 'text-slate-400',
  'text-slate-500': 'text-slate-400',
  'hover:bg-slate-50': 'hover:bg-slate-800',
  'shadow-xs': 'shadow-[0_0_15px_rgba(0,0,0,0.5)]',
  'shadow-sm': 'shadow-[0_0_20px_rgba(0,0,0,0.5)]',
};

filesToMigrate.forEach(file => {
  const sourcePath = path.join(srcDir, file);
  if (!fs.existsSync(sourcePath)) {
    console.error(`File not found: ${sourcePath}`);
    return;
  }
  
  let content = fs.readFileSync(sourcePath, 'utf8');

  // Apply dark mode replacements
  for (const [light, dark] of Object.entries(classReplacements)) {
    content = content.split(light).join(dark);
  }

  // Also fix image paths or other imports if needed
  // If importing from 'lucide-react' we don't need changes as it's the same
  
  const destPath = path.join(destDir, path.basename(file));
  fs.writeFileSync(destPath, content);
  console.log(`Migrated ${file} -> ${destPath}`);
});
