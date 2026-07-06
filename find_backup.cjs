const fs = require('fs');
const path = require('path');
const brainPath = 'C:/Users/Leonardo/.gemini/antigravity/brain';

const folders = fs.readdirSync(brainPath);

let bestAppContent = null;
let maxLines = 0;

for (const folder of folders) {
  const transcriptPath = path.join(brainPath, folder, '.system_generated/logs/transcript.jsonl');
  if (fs.existsSync(transcriptPath)) {
    const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
    for (const line of lines) {
      if (line.includes('export default function App()')) {
        try {
          const obj = JSON.parse(line);
          if (obj.content && obj.content.includes('min-h-screen')) {
             const appLines = obj.content.split('\\n').length;
             if (appLines > maxLines && obj.content.includes('<AudioVisualizer') && !obj.content.includes('return null;\\n}')) {
               maxLines = appLines;
               bestAppContent = obj.content;
             }
          }
        } catch(e){}
      }
    }
  }
}

if (bestAppContent) {
  fs.writeFileSync('C:/Users/Leonardo/docents/docent-suite/src/App_restored.tsx', bestAppContent);
  console.log('Restored App.tsx to App_restored.tsx with lines: ' + maxLines);
} else {
  console.log('Could not find a good App.tsx backup in transcripts.');
}
