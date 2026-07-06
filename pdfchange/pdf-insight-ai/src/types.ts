export interface PDFDocument {
  id: string;
  name: string;
  size: string;
  base64: string;
  uploadedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AnalysisReport {
  id: string;
  pdfId: string;
  type: 'summary' | 'extract' | 'custom';
  content: string;
  generatedAt: string;
  query?: string;
}
