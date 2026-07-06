import Dexie, { Table } from 'dexie';

export interface PDFDocument {
  id: string;
  name: string;
  size: string;
  base64: string;
  uploadedAt: string;
}

export interface AnalysisReport {
  id: string;
  pdfId: string;
  type: 'summary' | 'compare' | 'extract' | 'custom';
  content: string;
  generatedAt: string;
  query?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatHistory {
  id: string;
  messages: ChatMessage[];
}

export interface SavedBrand {
  id: string;
  brandName: string;
  brandSlogan: string;
  brandColors: string[];
  brandFont: string;
  brandSymbol: string;
  brandLayout: string;
  pdfHeaderStyle: string;
  pdfTitle: string;
  pdfBody: string;
  pdfHeaderDescription: string;
  type: string;
  location: string;
  phone: string;
  email: string;
  domain: string;
  brandStyle: string;
  savedAt: string;
}

export class DocentDatabase extends Dexie {
  pdfDocuments!: Table<PDFDocument>;
  analysisReports!: Table<AnalysisReport>;
  chatHistories!: Table<ChatHistory>;
  savedBrands!: Table<SavedBrand>;

  constructor() {
    super('DocentSuiteDB');
    this.version(1).stores({
      pdfDocuments: 'id, name',
      analysisReports: 'id, pdfId',
      chatHistories: 'id',
      savedBrands: 'id, brandName'
    });
  }
}

export const db = new DocentDatabase();
