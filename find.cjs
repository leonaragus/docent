const fs = require('fs');
const content = fs.readFileSync('C:/Users/Leonardo/docents/docent-suite/src/App.tsx', 'utf8');

// Find all returns that output JSX (e.g. return ( <div )
const matches = [...content.matchAll(/return\s*\(\s*<div[^>]*min-h-screen[^>]*>/g)];
matches.forEach(m => {
  console.log('Match found at index:', m.index);
  console.log(content.substring(m.index, m.index + 200));
});

console.log('Total returns:', matches.length);
