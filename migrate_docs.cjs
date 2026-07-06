const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'pdfconvertidor/raicep-pdf-ultimate/src');
const destDir = path.join(__dirname, 'src/components/Docs');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (!fs.existsSync(path.join(destDir, 'utils'))) {
  fs.mkdirSync(path.join(destDir, 'utils'), { recursive: true });
}

const filesToMigrate = [
  'types.ts',
  'components/PdfCompressor.tsx',
  'components/DocConverter.tsx',
  'components/HistoryLog.tsx',
  'components/InnovationHub.tsx',
  'utils/converter.ts'
];

// Dark mode class replacements and specific module replacements
const replacements = {
  'bg-[#020617]': 'bg-slate-950',
  'bg-white/5': 'bg-slate-900/50',
  'motion/react': 'framer-motion',
};

filesToMigrate.forEach(file => {
  const sourcePath = path.join(srcDir, file);
  if (!fs.existsSync(sourcePath)) {
    console.error(`File not found: ${sourcePath}`);
    return;
  }
  
  let content = fs.readFileSync(sourcePath, 'utf8');

  // Apply replacements
  for (const [light, dark] of Object.entries(replacements)) {
    content = content.split(light).join(dark);
  }

  // Adjust relative imports from components back to utils or types
  if (file.startsWith('components/')) {
    content = content.split('../types').join('./types');
    content = content.split('../utils/converter').join('./utils/converter');
  }

  // Define where to put it
  let destPath;
  if (file.startsWith('components/')) {
    destPath = path.join(destDir, path.basename(file));
  } else if (file.startsWith('utils/')) {
    destPath = path.join(destDir, 'utils', path.basename(file));
  } else {
    destPath = path.join(destDir, file);
  }

  fs.writeFileSync(destPath, content);
  console.log(`Migrated ${file} -> ${destPath}`);
});
