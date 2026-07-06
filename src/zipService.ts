import JSZip from 'jszip';

// List of all essential files in the project to include in the ZIP download
const FILES_TO_INCLUDE = [
  { path: 'package.json', url: '/package.json' },
  { path: 'tsconfig.json', url: '/tsconfig.json' },
  { path: 'vite.config.ts', url: '/vite.config.ts' },
  { path: 'index.html', url: '/index.html' },
  { path: 'server.ts', url: '/server.ts' },
  { path: 'firestore.rules', url: '/firestore.rules' },
  { path: 'firebase-blueprint.json', url: '/firebase-blueprint.json' },
  { path: 'src/App.tsx', url: '/src/App.tsx' },
  { path: 'src/firebase.ts', url: '/src/firebase.ts' },
  { path: 'src/index.css', url: '/src/index.css' },
  { path: 'src/main.tsx', url: '/src/main.tsx' },
  { path: 'src/supabase.ts', url: '/src/supabase.ts' },
  { path: 'src/types.ts', url: '/src/types.ts' },
  { path: 'src/locales.ts', url: '/src/locales.ts' },
  { path: 'src/zipService.ts', url: '/src/zipService.ts' },
  { path: 'src/components/AIAssistant.tsx', url: '/src/components/AIAssistant.tsx' },
  { path: 'src/components/AudioVisualizer.tsx', url: '/src/components/AudioVisualizer.tsx' },
  { path: 'src/components/StorageManager.tsx', url: '/src/components/StorageManager.tsx' },
  { path: 'src/components/SyncedPlayer.tsx', url: '/src/components/SyncedPlayer.tsx' },
  { path: 'src/components/Teleprompter.tsx', url: '/src/components/Teleprompter.tsx' }
];

/**
 * Downloads the entire project as a clean, production-ready ZIP archive.
 * Fetches current files dynamically so the user receives all latest edits!
 */
export async function downloadProjectZip(onProgress?: (msg: string) => void) {
  try {
    const zip = new JSZip();
    
    // Add a helpful README detailing Supabase and Firebase connection
    const readmeContent = `# DOCENT suite - Exported Bundle

This project contains your fully configured DOCENT suite application with bilingual capabilities, real-time sync, and offline fallbacks.

## 🚀 How to Run Locally

1. **Extract the ZIP file** to a folder on your computer.
2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`
3. **Configure Environment Variables**:
   Create a \`.env\` file in the root folder (or use \`.env.example\`) and populate it:
   \`\`\`env
   # Firebase Settings
   VITE_FIREBASE_API_KEY=your_firebase_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Supabase Settings (Ready to use)
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   \`\`\`

4. **Run the Development Server**:
   \`\`\`bash
   npm run dev
   \`\`\`
5. **Build and Run Production Server**:
   \`\`\`bash
   npm run build
   npm run start
   \`\`\`

## 🛠️ Supabase Database Setup

To complete the Supabase integration, execute the SQL script located in \`src/supabase.ts\` inside your Supabase dashboard SQL editor. This will create the \`shared_classes\` table and set up Realtime subscriptions.

Enjoy using DOCENT suite!
`;

    zip.file('README.md', readmeContent);

    // Create a default .env.example
    const envExampleContent = `# Firebase Configuration (Optional if using Supabase)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Supabase Configuration
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
`;
    zip.file('.env.example', envExampleContent);
    zip.file('.env', envExampleContent); // Pre-create a blank .env to make it easy for user

    // Fetch and add each file to the ZIP
    for (const file of FILES_TO_INCLUDE) {
      if (onProgress) {
        onProgress(`Packaging ${file.path}...`);
      }
      try {
        const response = await fetch(file.url);
        if (response.ok) {
          const content = await response.text();
          zip.file(file.path, content);
        } else {
          console.warn(`Could not fetch file for ZIP: ${file.path}`);
        }
      } catch (err) {
        console.warn(`Error packaging ${file.path}:`, err);
      }
    }

    if (onProgress) {
      onProgress("Generating ZIP file...");
    }

    // Generate the ZIP file blob
    const contentBlob = await zip.generateAsync({ type: 'blob' });

    // Trigger the browser file download
    const url = window.URL.createObjectURL(contentBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'docent_suite_export.zip';
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    if (onProgress) {
      onProgress("Download completed successfully!");
    }
  } catch (error) {
    console.error("Failed to generate and download project ZIP:", error);
    if (onProgress) {
      onProgress(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    throw error;
  }
}
