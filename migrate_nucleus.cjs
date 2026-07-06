const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'pdfchange/pdf-insight-ai/src');
const destDir = path.join(__dirname, 'src/components/Nucleus');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const filesToMigrate = [
  'types.ts',
  'components/MarkdownRenderer.tsx',
  'components/OfflineAIEngine.ts',
  'components/SkeletonLoader.tsx',
  'components/TutorialModal.tsx',
];

// Dark mode class replacements
const replacements = {
  'bg-white': 'bg-slate-900',
  'bg-gray-50': 'bg-slate-800',
  'text-gray-900': 'text-slate-100',
  'text-gray-800': 'text-slate-200',
  'text-gray-700': 'text-slate-300',
  'text-gray-600': 'text-slate-400',
  'text-gray-500': 'text-slate-500',
  'border-gray-200': 'border-slate-800',
  'border-gray-300': 'border-slate-700',
  'hover:bg-gray-100': 'hover:bg-slate-800',
  'motion/react': 'framer-motion',
  'bg-[#020617]': 'bg-slate-950',
};

filesToMigrate.forEach(file => {
  const sourcePath = path.join(srcDir, file);
  if (!fs.existsSync(sourcePath)) {
    console.error(`File not found: ${sourcePath}`);
    return;
  }
  
  let content = fs.readFileSync(sourcePath, 'utf8');

  for (const [light, dark] of Object.entries(replacements)) {
    content = content.split(light).join(dark);
  }

  // Adjust imports for components
  if (file.startsWith('components/')) {
    content = content.split('../types').join('./types');
  }

  let destPath = path.join(destDir, path.basename(file));
  fs.writeFileSync(destPath, content);
  console.log(`Migrated ${file} -> ${destPath}`);
});

// Also copy App.tsx directly to DocentNucleus.tsx
const appSrc = path.join(srcDir, 'App.tsx');
if (fs.existsSync(appSrc)) {
  let appContent = fs.readFileSync(appSrc, 'utf8');
  for (const [light, dark] of Object.entries(replacements)) {
    appContent = appContent.split(light).join(dark);
  }
  appContent = appContent.replace('export default function App()', 'export default function DocentNucleus()');
  appContent = appContent.replace(/from '\.\/components\//g, "from './");
  
  // We will patch the brand fetching inside the React file directly using AST or string replacements later.
  
  fs.writeFileSync(path.join(__dirname, 'src/components/DocentNucleus.tsx'), appContent);
  console.log(`Migrated App.tsx -> DocentNucleus.tsx`);
}
