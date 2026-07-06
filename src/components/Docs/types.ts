export type CompressionLevel = 'low' | 'medium' | 'high';

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  extension: string;
  progress: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  resultSize?: number;
  resultUrl?: string;
  resultName?: string;
}

export interface ConversionFormat {
  ext: string;
  label: string;
  category: 'image' | 'document' | 'data' | 'text';
}

export interface ProcessingHistoryItem {
  id: string;
  originalName: string;
  originalSize: number;
  resultName: string;
  resultSize: number;
  type: 'compress' | 'convert';
  fromFormat: string;
  toFormat: string;
  timestamp: string;
  downloadUrl: string;
}

export interface IdeaItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'IA' | 'Seguridad' | 'Edición' | 'Productividad';
  difficulty: 'Fácil' | 'Media' | 'Avanzada';
  votes: number;
  voted?: boolean;
}
