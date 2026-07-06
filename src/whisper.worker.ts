import { pipeline, env } from '@huggingface/transformers';

// Disable local models checking since we load from Hugging Face CDN (Xenova's CDN)
env.allowLocalModels = false;

let transcriber: any = null;

// Progress listener to send loading status back to main thread
const progressCallback = (data: any) => {
  if (data.status === 'progress') {
    self.postMessage({ 
      type: 'loading_progress', 
      file: data.file, 
      progress: data.progress, 
      loaded: data.loaded, 
      total: data.total 
    });
  } else if (data.status === 'ready') {
    self.postMessage({ type: 'loading_ready', file: data.file });
  }
};

async function getTranscriber() {
  if (!transcriber) {
    transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
      progress_callback: progressCallback
    });
  }
  return transcriber;
}

self.addEventListener('message', async (event) => {
  const { audioData, lang } = event.data;
  
  try {
    self.postMessage({ type: 'status', status: 'initializing' });
    const pipe = await getTranscriber();
    
    self.postMessage({ type: 'status', status: 'transcribing' });
    
    const result = await pipe(audioData, {
      chunk_length_s: 30,
      stride_length_s: 5,
      language: lang === 'es' ? 'spanish' : 'english',
      task: 'transcribe',
      return_timestamps: true
    });
    
    self.postMessage({ type: 'result', result });
  } catch (error: any) {
    console.error("Worker Whisper Error:", error);
    self.postMessage({ type: 'error', error: error.message || String(error) });
  }
});
