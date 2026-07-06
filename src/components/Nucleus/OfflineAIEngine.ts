import { pipeline, env } from '@huggingface/transformers';

// Skip local model checks for browsers
env.allowLocalModels = false;

// We use a singleton pattern for the pipeline to avoid loading it multiple times
class OfflineAI {
  static instance: any = null;
  static isLoading = false;
  static progressCallback: ((progress: any) => void) | null = null;

  static async getInstance(onProgress: (p: any) => void) {
    if (this.instance === null && !this.isLoading) {
      this.isLoading = true;
      this.progressCallback = onProgress;
      try {
        // Use Xenova's DistilBART or a small T5 for summarization. 
        // Xenova/t5-small is about 240MB, Xenova/distilbart-cnn-6-6 is about 1.2GB (might be too big).
        // Let's use a very small model for fallback summary: Xenova/t5-small
        this.instance = await pipeline('summarization', 'Xenova/t5-small', {
          progress_callback: (x: any) => {
            if (this.progressCallback) this.progressCallback(x);
          }
        });
      } catch (err) {
        console.error("Error loading offline AI model:", err);
      } finally {
        this.isLoading = false;
      }
    }
    return this.instance;
  }

  static async generateSummary(text: string): Promise<string> {
    if (!this.instance) {
      throw new Error("Model not loaded yet.");
    }
    // Summarization models have token limits (usually 512 or 1024). We must chunk the text if it's too long.
    const maxChars = 2000; 
    const chunk = text.substring(0, maxChars);
    
    // The model expects English mostly, but T5 can sometimes handle multilingual or we can prepend a prompt
    const result = await this.instance(`summarize: ${chunk}`, {
      max_new_tokens: 150,
    });
    
    return result[0].summary_text;
  }
}

export default OfflineAI;
