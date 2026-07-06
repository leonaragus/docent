import React, { useState, useEffect, useRef } from 'react';
import { pdf } from '@react-pdf/renderer';
import { DocentPDFTemplate } from './Nucleus/DocentPDFTemplate';
import { 
  FileText, 
  Sparkles, 
  UploadCloud, 
  Trash2, 
  Plus, 
  MessageSquare, 
  Database, 
  AlertCircle, 
  CheckCircle, 
  Send, 
  ArrowRight, 
  ChevronRight, 
  Loader2, 
  RefreshCw, 
  BrainCircuit, 
  FileCheck,
  Check,
  X,
  HelpCircle,
  Code,
  Scale,
  Smile,
  FileSliders,
  Sparkle,
  Award,
  Download,
  Layout,
  Type,
  Users,
  Printer,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFDocument, ChatMessage, AnalysisReport } from './Nucleus/types';
import MarkdownRenderer from './Nucleus/MarkdownRenderer';
import SkeletonLoader from './Nucleus/SkeletonLoader';
import { TutorialModal } from './Nucleus/TutorialModal';
import OfflineAI from './Nucleus/OfflineAIEngine';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../db';

type AnalysisTone = 'standard' | 'argentino' | 'humano' | 'moderno';

export default function DocentNucleus() {
  const { lang } = useLanguage(); const isEn = lang === 'en';
  // Uploaded and selected files
  const [uploadedFiles, setUploadedFiles] = useState<PDFDocument[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  
  // Navigation tabs & Tones
  const [activeTab, setActiveTab] = useState<'summary' | 'compare' | 'extract' | 'custom' | 'chat' | 'branding'>('summary');
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tone, setTone] = useState<AnalysisTone>('argentino');

  // Branding state variables
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [brandHeader, setBrandHeader] = useState<string>('GUÍA DE APRENDIZAJE Y ESTUDIO');
  const [brandAuthors, setBrandAuthors] = useState<string>('Colegio o Institución Educativa');
  const [brandTeacher, setBrandTeacher] = useState<string>('Profesor/a Titular');
  const [brandFont, setBrandFont] = useState<'sans' | 'serif' | 'mono' | 'grotesk'>('sans');
  const [brandStyle, setBrandStyle] = useState<'classic' | 'modern'>('classic');
  const [brandColor, setBrandColor] = useState<'indigo' | 'emerald' | 'crimson' | 'amber' | 'slate'>('indigo');
  const [selectedBrandingReportType, setSelectedBrandingReportType] = useState<string>('summary');
  const [aiBrandingPrompt, setAiBrandingPrompt] = useState('');
  const [isGeneratingBranding, setIsGeneratingBranding] = useState(false);
  
  // Persistence state
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>({});
  
  // UI states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [offlineProgress, setOfflineProgress] = useState<any>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Input values
  const [customPrompt, setCustomPrompt] = useState('');
  const [chatInput, setChatInput] = useState('');
  
  // Notifications
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formatConflictFile, setFormatConflictFile] = useState<{ file: File; base64: string } | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // PDF Compilation & Preview states
  const [exportModalStep, setExportModalStep] = useState<'customize' | 'compiling' | 'preview'>('customize');
  const [compileProgress, setCompileProgress] = useState(0);
  const [compileStep, setCompileStep] = useState('');
  const [tempBrandStyle, setTempBrandStyle] = useState<'classic' | 'modern'>('classic');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load from Dexie DB on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedFiles = await db.pdfDocuments.toArray();
        if (storedFiles.length > 0) {
          setUploadedFiles(storedFiles);
          setSelectedFileIds([storedFiles[0].id]);
        }

        const storedReports = await db.analysisReports.toArray();
        if (storedReports.length > 0) {
          setReports(storedReports as any);
        }

        const storedChats = await db.chatHistories.toArray();
        if (storedChats.length > 0) {
          const chatMap: Record<string, ChatMessage[]> = {};
          storedChats.forEach(ch => chatMap[ch.id] = ch.messages as any);
          setChats(chatMap);
        }

        const savedBrand = localStorage.getItem('docent_nexus_brand');
        if (savedBrand) {
          try {
            const brand = JSON.parse(savedBrand);
            if (brand.name) setBrandHeader(brand.name);
            if (brand.colors && brand.colors[0]) setBrandColor('indigo');
          } catch(e) {}
        }
      } catch (err) {
        console.warn("Could not load application state from DB:", err);
      }
    };
    loadData();
  }, []);

  // Save changes helper
  const saveFilesToStorage = async (files: PDFDocument[]) => {
    try {
      await db.pdfDocuments.clear();
      await db.pdfDocuments.bulkAdd(files.map(f => ({...f})));
    } catch (e) {
      console.warn("Failed to save PDFs to IndexedDB.", e);
    }
  };

  const saveReportsToStorage = async (updatedReports: AnalysisReport[]) => {
    try {
      await db.analysisReports.clear();
      await db.analysisReports.bulkAdd(updatedReports.map(r => ({...r})));
    } catch (e) {
      console.warn("Failed to save reports to IndexedDB.", e);
    }
  };

  const saveChatsToStorage = async (updatedChats: Record<string, ChatMessage[]>) => {
    try {
      const flatChats = Object.entries(updatedChats).map(([id, messages]) => ({ id, messages: messages as any }));
      await db.chatHistories.clear();
      await db.chatHistories.bulkAdd(flatChats);
    } catch (e) {
      console.warn("Failed to save chat history to IndexedDB.", e);
    }
  };

  // Keep chat scrolled down
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, selectedFileIds, activeTab]);

  // Derive active documents
  const activeFiles = uploadedFiles.filter(f => selectedFileIds.includes(f.id));
  
  // Unify reports and chats using a compound key derived from selected files + activeTab + tone
  const getActiveReportKey = () => {
    if (selectedFileIds.length === 0) return '';
    return [...selectedFileIds].sort().join('_') + '_' + activeTab + '_' + tone;
  };

  const getActiveChatKey = () => {
    if (selectedFileIds.length === 0) return '';
    return [...selectedFileIds].sort().join('_') + '_' + tone;
  };

  const activeReport = reports.find(r => r.pdfId === getActiveReportKey()) || null;
  const activeChatKey = getActiveChatKey();
  const activeChat = activeChatKey ? chats[activeChatKey] || [] : [];

  // Toggle file selection
  const toggleFileSelection = (id: string) => {
    if (isAnalyzing) return;
    setError(null);
    
    setSelectedFileIds(prev => {
      if (prev.includes(id)) {
        // Must keep at least one selected if there are uploaded files
        if (prev.length === 1) return prev;
        return prev.filter(fileId => fileId !== id);
      } else {
        // Enforce maximum of 3 concurrent PDFs for optimal performance
        if (prev.length >= 3) {
          setError(isEn ? 'You can analyze a maximum of 3 documents simultaneously to ensure performance.' : 'Podés analizar un máximo de 3 documentos en simultáneo para asegurar el rendimiento.');
          setTimeout(() => setError(null), 4000);
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Add a document to the library helper
  const addDocumentToLibrary = (name: string, sizeInBytes: number, base64: string) => {
    const sizeStr = (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
    
    // Prevent exact duplicates
    const alreadyExists = uploadedFiles.some(f => f.name === name && f.size === sizeStr);
    if (alreadyExists) {
      setError(isEn ? `The file "${name}" is already in your library.` : `El archivo "${name}" ya se encuentra en tu biblioteca.`);
      setSuccess(null);
      return;
    }

    const newDoc: PDFDocument = {
      id: Math.random().toString(36).substring(2, 11),
      name: name,
      size: sizeStr,
      base64: base64,
      uploadedAt: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    const updatedFiles = [...uploadedFiles, newDoc];
    setUploadedFiles(updatedFiles);
    saveFilesToStorage(updatedFiles);
    
    // Automatically add to selected active group
    setSelectedFileIds(prev => {
      if (prev.length < 3) {
        return [...prev, newDoc.id];
      }
      return [newDoc.id];
    });

    setSuccess(isEn ? `"${name}" uploaded successfully.` : `"${name}" cargado exitosamente.`);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Read base64 and auto-detect file type/extension
  const processFile = (file: File) => {
    if (file.size > 18 * 1024 * 1024) {
      setError(isEn ? 'The file exceeds the recommended limit of 18MB.' : 'El archivo excede el límite recomendado de 18MB.');
      return;
    }

    setError(null);
    setSuccess(isEn ? 'Analyzing file...' : 'Analizando archivo...');

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const base64 = reader.result as string;
        
        // Try to identify extension or MIME type
        const extension = file.name.split('.').pop()?.toLowerCase();
        const mimeType = file.type?.toLowerCase();

        // Check if there is NO extension, or if it's a generic file without one
        const hasNoRealExtension = !extension || extension === file.name.toLowerCase() || /^\d+\s*\(\d+\)$/.test(file.name) || extension.length > 5;

        let detectedType: 'pdf' | 'docx' | 'text' | null = null;

        // Magic byte check in base64
        const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, "");

        if (cleanBase64.startsWith("JVBERi")) {
          detectedType = 'pdf';
        } else if (cleanBase64.startsWith("UEsDBB")) {
          detectedType = 'docx';
        } else if (mimeType === 'application/pdf') {
          detectedType = 'pdf';
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') {
          detectedType = 'docx';
        } else if (extension === 'pdf') {
          detectedType = 'pdf';
        } else if (extension === 'docx') {
          detectedType = 'docx';
        } else if (extension && ['txt', 'csv', 'json', 'md', 'html', 'xml'].includes(extension)) {
          detectedType = 'text';
        } else if (mimeType && (mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'application/xml')) {
          detectedType = 'text';
        }

        if (detectedType) {
          // Keep/assign correct extension
          let finalName = file.name;
          if (hasNoRealExtension) {
            finalName = `${file.name}.${detectedType}`;
          }
          
          let finalBase64 = base64;
          if (detectedType === 'pdf' && !base64.startsWith('data:application/pdf;base64,')) {
            finalBase64 = `data:application/pdf;base64,${cleanBase64}`;
          } else if (detectedType === 'docx' && !base64.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,')) {
            finalBase64 = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${cleanBase64}`;
          } else if (detectedType === 'text' && !base64.startsWith('data:text/plain;base64,')) {
            finalBase64 = `data:text/plain;base64,${cleanBase64}`;
          }

          addDocumentToLibrary(finalName, file.size, finalBase64);
        } else {
          // If we can't identify the type automatically, let the user resolve it!
          setFormatConflictFile({ file, base64 });
          setSuccess(null);
        }

      } catch (err) {
        setError(isEn ? 'Error processing the file. Please try again.' : 'Error al procesar el archivo. Inténtalo de nuevo.');
      }
    };
    reader.onerror = () => {
      setError(isEn ? 'Failed to read the file.' : 'Fallo al leer el archivo.');
    };
    reader.readAsDataURL(file);
  };

  // Delete PDF
  const deleteFile = (id: string, name: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== id);
    setUploadedFiles(updatedFiles);
    saveFilesToStorage(updatedFiles);

    // Clear selections
    const updatedSelections = selectedFileIds.filter(selId => selId !== id);
    if (updatedSelections.length === 0 && updatedFiles.length > 0) {
      setSelectedFileIds([updatedFiles[0].id]);
    } else {
      setSelectedFileIds(updatedSelections);
    }

    // Clean up corresponding reports
    const updatedReports = reports.filter(r => !r.pdfId.includes(id));
    setReports(updatedReports);
    saveReportsToStorage(updatedReports);

    // Clean up corresponding chats
    const updatedChats = { ...chats };
    Object.keys(updatedChats).forEach(key => {
      if (key.includes(id)) {
        delete updatedChats[key];
      }
    });
    setChats(updatedChats);
    saveChatsToStorage(updatedChats);

    setSuccess(isEn ? `Deleted "${name}".` : `Se eliminó "${name}".`);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Run Backend cognitive analysis (Supports multi-file natively)
  const runAnalysis = async (actionType: 'summary' | 'compare' | 'extract' | 'custom' | 'chat', overridePrompt?: string) => {
    if (activeFiles.length === 0) {
      setError(isEn ? 'Please select at least one file by checking it in your library.' : 'Por favor, seleccioná al menos un archivo tildándolo en tu biblioteca.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    // Visual loading steps based on parameters
    const documentPluralText = activeFiles.length > 1 ? 'los documentos' : 'el documento';
    if (actionType === 'summary') {
      setAnalysisStep(isEn ? `Starting global synthesis of ${activeFiles.length} document(s)...` : `Iniciando síntesis global de ${activeFiles.length} documento/s...`);
    } else if (actionType === 'compare') {
      setAnalysisStep(isEn ? 'Generating comparative chart and analyzing unified coherence...' : 'Generando cuadro comparativo y analizando coherencia unificada...');
    } else if (actionType === 'extract') {
      setAnalysisStep(isEn ? `Generating 10-question exam and glossary of ${activeFiles.length} document(s)...` : `Generando examen de 10 preguntas y glosario de ${activeFiles.length} documento/s...`);
    } else {
      setAnalysisStep(isEn ? 'Processing cognitive query with Gemini 2.5...' : 'Procesando consulta cognitiva con Gemini 2.5...');
    }

    try {
      let response;
      let isFallback = false;
      let overrideAction = actionType;
      let finalQuestion = actionType === 'custom' ? (overridePrompt || customPrompt) : undefined;
      
      if (actionType === 'extract') {
        overrideAction = 'custom';
        finalQuestion = 'Actúa como un profesor experto. A partir de los documentos proporcionados, crea un EXAMEN de 10 preguntas de opción múltiple (con una sola respuesta correcta) y luego elabora un GLOSARIO con los 5 términos más importantes. Formatea todo el resultado de manera hermosa usando Markdown.';
      }

      try {
        response = await fetch('/api/analyze-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pdfs: activeFiles.map(f => ({ base64: f.base64, name: f.name })),
            action: overrideAction,
            question: finalQuestion,
            tone: tone
          })
        });
        if (!response.ok) throw new Error('API Error');
      } catch (networkError) {
        console.warn('Network error or API failure, falling back to Offline AI...', networkError);
        isFallback = true;
        setIsOfflineMode(true);
        
        const model = await OfflineAI.getInstance(progress => setOfflineProgress(progress));
        const fakeText = "Extracto recuperado sin conexión: " + (activeFiles.map(f => f.name).join(", ")); 
        const summary = await OfflineAI.generateSummary(fakeText);
        
        response = {
          ok: true,
          json: async () => ({ result: (isEn ? "## [OFFLINE MODE] Emergency Summary\n\n" : "## [MODO OFFLINE] Resumen de Emergencia\n\n") + summary })
        };
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || (isEn ? 'An unexpected error occurred while analyzing the documents.' : 'Ocurrió un error inesperado al analizar los documentos.'));
      }

      const data = await response.json();
      
      const newReport: AnalysisReport = {
        id: Math.random().toString(36).substring(2, 11),
        pdfId: getActiveReportKey(), // Store with active compound key
        type: actionType === 'custom' ? 'custom' : actionType as any,
        content: data.result,
        generatedAt: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        query: actionType === 'custom' ? (overridePrompt || customPrompt) : undefined
      };

      // Filter previous report with the same compound key
      const filteredReports = reports.filter(r => r.pdfId !== newReport.pdfId);
      const updatedReports = [...filteredReports, newReport];
      setReports(updatedReports);
      saveReportsToStorage(updatedReports);

      if (actionType === 'custom') {
        setCustomPrompt('');
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || (isEn ? 'Connection error with the Artificial Intelligence service.' : 'Error de conexión con el servicio de Inteligencia Artificial.'));
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Conversational Chat with Multi-PDF context
  const sendChatMessage = async () => {
    if (!chatInput.trim() || activeFiles.length === 0 || isAnalyzing) return;

    const userMessageText = chatInput.trim();
    setChatInput('');

    // Register user chat message
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 11),
      role: 'user',
      content: userMessageText,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    const currentChatHistory = [...activeChat, userMsg];
    const updatedChats = {
      ...chats,
      [activeChatKey]: currentChatHistory
    };
    setChats(updatedChats);
    saveChatsToStorage(updatedChats);

    setIsAnalyzing(true);
    setAnalysisStep(isEn ? 'Scanning multiple documentary contexts...' : 'Escaneando múltiples contextos documentales...');

    try {
      let response;
      let isFallback = false;
      try {
        response = await fetch('/api/analyze-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
          pdfs: activeFiles.map(f => ({ base64: f.base64, name: f.name })),
          action: 'chat',
          question: userMessageText,
          chatHistory: currentChatHistory.slice(-8), // Pass historical messages for continuity
          tone: tone
        })
        });
        if (!response.ok) throw new Error('API Error');
      } catch (networkError) {
        console.warn('Network error or API failure, falling back to Offline AI...', networkError);
        isFallback = true;
        setIsOfflineMode(true);
        
        const model = await OfflineAI.getInstance(progress => setOfflineProgress(progress));
        const fakeText = "Extracto recuperado sin conexión: " + (activeFiles.map(f => f.name).join(", ")); 
        const summary = await OfflineAI.generateSummary(fakeText);
        
        response = {
          ok: true,
          json: async () => ({ result: (isEn ? "## [OFFLINE MODE] Emergency Summary\n\n" : "## [MODO OFFLINE] Resumen de Emergencia\n\n") + summary })
        };
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || (isEn ? 'Could not get a response.' : 'No se pudo obtener respuesta.'));
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 11),
        role: 'assistant',
        content: data.result,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };

      const finalChatHistory = [...currentChatHistory, assistantMsg];
      const nextChats = {
        ...chats,
        [activeChatKey]: finalChatHistory
      };
      setChats(nextChats);
      saveChatsToStorage(nextChats);

    } catch (err: any) {
      console.error(err);
      setError(err.message || (isEn ? 'Communication failure in chat room.' : 'Fallo de comunicación en sala de chat.'));
      
      // Revert user message on complete error to keep UI tidy
      const revertedHistory = currentChatHistory.filter(m => m.id !== userMsg.id);
      setChats({ ...chats, [activeChatKey]: revertedHistory });
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  // Clear Chat history for active key
  const clearActiveChat = () => {
    if (!activeChatKey) return;
    const nextChats = { ...chats };
    delete nextChats[activeChatKey];
    setChats(nextChats);
    saveChatsToStorage(nextChats);
  };

  // Logo presets configuration for educational institutions
  const logoPresets = [
    {
      id: 'crest',
      name: isEn ? 'School Crest' : 'Escudo Escolar',
      svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23b45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/></svg>`
    },
    {
      id: 'book',
      name: isEn ? 'Study Book' : 'Libro de Estudio',
      svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%234f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10"/></svg>`
    },
    {
      id: 'science',
      name: isEn ? 'Science Atom' : 'Átomo Ciencia',
      svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`
    }
  ];

  // Helper color mappings for A4 student worksheet templates
  const colorThemes = {
    indigo: {
      text: 'text-indigo-600',
      border: 'border-indigo-600',
      bgLight: 'bg-indigo-50/50',
      borderLight: 'border-indigo-100',
      prose: 'prose-indigo',
      bgSolid: 'bg-indigo-600'
    },
    emerald: {
      text: 'text-emerald-600',
      border: 'border-emerald-600',
      bgLight: 'bg-emerald-50/50',
      borderLight: 'border-emerald-100',
      prose: 'prose-emerald',
      bgSolid: 'bg-emerald-600'
    },
    crimson: {
      text: 'text-rose-600',
      border: 'border-rose-600',
      bgLight: 'bg-rose-50/50',
      borderLight: 'border-rose-100',
      prose: 'prose-rose',
      bgSolid: 'bg-rose-600'
    },
    amber: {
      text: 'text-amber-600',
      border: 'border-amber-600',
      bgLight: 'bg-amber-50/50',
      borderLight: 'border-amber-100',
      prose: 'prose-amber',
      bgSolid: 'bg-amber-600'
    },
    slate: {
      text: 'text-slate-200',
      border: 'border-slate-800',
      bgLight: 'bg-slate-800/50/50',
      borderLight: 'border-slate-800',
      prose: 'prose-slate',
      bgSolid: 'bg-slate-800'
    }
  };

  // AI Brand Setup assistant
  const handleAiBrandingHelp = async () => {
    if (!aiBrandingPrompt.trim()) return;
    setIsGeneratingBranding(true);
    setError(null);
    try {
      let response;
      let isFallback = false;
      try {
        response = await fetch('/api/analyze-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
          pdfs: activeFiles.map(f => ({ base64: f.base64, name: f.name })),
          action: 'custom',
          question: isEn ? `Generate EXCLUSIVELY a JSON format block without explanations with the structure:
          {"header": "REPORT TITLE", "authors": "Author or Department", "font": "sans" or "serif" or "mono" or "grotesk", "style": "classic" or "modern"}
          According to the user's design request: "${aiBrandingPrompt}".
          Do not add any additional text outside the JSON.` : `Genera EXCLUSIVAMENTE un bloque de formato JSON sin explicaciones con la estructura:
          {"header": "TITULO DEL INFORME", "authors": "Autor o Departamento", "font": "sans" o "serif" o "mono" o "grotesk", "style": "classic" o "modern"}
          De acuerdo al siguiente pedido de diseño del usuario: "${aiBrandingPrompt}".
          No agregues ningún texto adicional por fuera del JSON.`
        })
        });
        if (!response.ok) throw new Error('API Error');
      } catch (networkError) {
        console.warn('Network error or API failure, falling back to Offline AI...', networkError);
        isFallback = true;
        setIsOfflineMode(true);
        
        const model = await OfflineAI.getInstance(progress => setOfflineProgress(progress));
        const fakeText = "Extracto recuperado sin conexión: " + (activeFiles.map(f => f.name).join(", ")); 
        const summary = await OfflineAI.generateSummary(fakeText);
        
        response = {
          ok: true,
          json: async () => ({ result: (isEn ? "## [OFFLINE MODE] Emergency Summary\n\n" : "## [MODO OFFLINE] Resumen de Emergencia\n\n") + summary })
        };
      }

      if (response.ok) {
        const data = await response.json();
        const text = data.result || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.header) setBrandHeader(parsed.header.toUpperCase());
          if (parsed.authors) setBrandAuthors(parsed.authors);
          if (parsed.font) setBrandFont(parsed.font);
          if (parsed.style) setBrandStyle(parsed.style);
          setSuccess(isEn ? 'Brand generated and automatically configured with AI!' : '¡Marca generada y configurada automáticamente con IA!');
          setTimeout(() => setSuccess(null), 3000);
          setAiBrandingPrompt('');
        } else {
          setBrandHeader(aiBrandingPrompt.toUpperCase());
        }
      } else {
        throw new Error(isEn ? 'Failed to query branding AI' : 'Fallo al consultar la IA de branding');
      }
    } catch (err: any) {
      console.warn("Error running AI branding assistant:", err);
      setBrandHeader(aiBrandingPrompt.toUpperCase());
      setSuccess(isEn ? 'Header updated with the indicated text.' : 'Se actualizó el encabezado con el texto indicado.');
      setTimeout(() => setSuccess(null), 3000);
    } finally {
      setIsGeneratingBranding(false);
    }
  };

  // Trigger custom customization and export modal
  const triggerCustomExportFlow = (type: string) => {
    setSelectedBrandingReportType(type);
    setExportModalStep('customize');
    setCompileProgress(0);
    setTempBrandStyle(brandStyle);
    setShowExportModal(true);
  };

  // Handle Simulated PDF Compilation and rendering process
  const startCompileAndPreview = () => {
    setExportModalStep('compiling');
    setCompileProgress(0);
    setCompileStep(isEn ? 'Starting compilation of educational material...' : 'Iniciando compilación del material educativo...');

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 5; // Add 5-12% each step
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setCompileProgress(100);
        setCompileStep(isEn ? 'Material successfully compiled!' : '¡Material compilado con éxito!');
        setTimeout(() => {
          setExportModalStep('preview');
        }, 500);
      } else {
        setCompileProgress(currentProgress);
        if (currentProgress < 20) {
          setCompileStep(isEn ? 'Initializing page structures and margins...' : 'Inicializando estructuras de página y márgenes...');
        } else if (currentProgress < 45) {
          setCompileStep(isEn ? 'Applying design, fonts and alignments...' : 'Aplicando diseño, fuentes y alineaciones...');
        } else if (currentProgress < 65) {
          setCompileStep(isEn ? 'Inserting institutional logo and badges...' : 'Insertando logotipo institucional e insignias...');
        } else if (currentProgress < 85) {
          setCompileStep(isEn ? 'Aligning color themes and contrasts...' : 'Alineando temas de color y contrastes...');
        } else {
          setCompileStep(isEn ? 'Rendering interactive previews...' : 'Renderizando previsualizaciones interactivas...');
        }
      }
    }, 120);
  };

  const convertOklchToRgb = (oklchStr: string): string => {
    try {
      const cleaned = oklchStr.trim().toLowerCase();
      const match = cleaned.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+(?:deg|rad|turn)?)\s*(?:\/\s*([\d.]+%?))?\s*\)/) ||
                    cleaned.match(/oklch\(\s*([\d.]+%?),?\s*([\d.]+),?\s*([\d.]+(?:deg|rad|turn)?)(?:,?\s*([\d.]+%?))?\s*\)/);
                    
      if (!match) {
        if (cleaned.includes('0.9') || cleaned.includes('50%')) {
          return 'rgb(248, 250, 252)';
        }
        return 'rgb(79, 70, 229)';
      }
      
      let lStr = match[1];
      let l = parseFloat(lStr);
      if (lStr.endsWith('%')) {
        l = l / 100;
      }
      
      let c = parseFloat(match[2]);
      
      let hStr = match[3];
      let h = parseFloat(hStr);
      if (hStr.endsWith('rad')) {
        h = (parseFloat(hStr) * 180) / Math.PI;
      } else if (hStr.endsWith('turn')) {
        h = parseFloat(hStr) * 360;
      }
      
      let aStr = match[4];
      let alpha = 1;
      if (aStr) {
        alpha = parseFloat(aStr);
        if (aStr.endsWith('%')) {
          alpha = alpha / 100;
        }
      }
      
      l = Math.max(0, Math.min(1, l));
      c = Math.max(0, Math.min(2, c));
      h = ((h % 360) + 360) % 360;
      
      const hRad = (h * Math.PI) / 180;
      const aVal = c * Math.cos(hRad);
      const bVal = c * Math.sin(hRad);
      
      const l_ = l + 0.3963377774 * aVal + 0.2158037573 * bVal;
      const m_ = l - 0.1055613458 * aVal - 0.0638541728 * bVal;
      const s_ = l - 0.0894841775 * aVal - 1.2914855480 * bVal;
      
      const l_cube = l_ * l_ * l_;
      const m_cube = m_ * m_ * m_;
      const s_cube = s_ * s_ * s_;
      
      const r_lin = +4.0767416621 * l_cube - 3.3077115913 * m_cube + 0.2309699292 * s_cube;
      const g_lin = -1.2684380046 * l_cube + 2.6097574011 * m_cube - 0.3413193965 * s_cube;
      const b_lin = -0.0041960863 * l_cube - 0.7034186147 * m_cube + 1.7076147010 * s_cube;
      
      const convert = (val: number) => {
        if (val <= 0.0031308) {
          return 12.92 * val;
        } else {
          return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
        }
      };
      
      const r = Math.round(Math.max(0, Math.min(1, convert(r_lin))) * 255);
      const g = Math.round(Math.max(0, Math.min(1, convert(g_lin))) * 255);
      const b = Math.round(Math.max(0, Math.min(1, convert(b_lin))) * 255);
      
      if (alpha !== 1) {
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      return `rgb(${r}, ${g}, ${b})`;
    } catch (err) {
      console.error('Error parsing oklch color:', oklchStr, err);
      return 'rgb(79, 70, 229)';
    }
  };

  const replaceColorFunctionInString = (str: string): string => {
    if (typeof str !== 'string' || (!str.includes('oklch') && !str.includes('oklab'))) {
      return str;
    }
    let result = str.replace(/oklch\([^\)]+\)/gi, (match) => {
      return convertOklchToRgb(match);
    });
    // Fallback for oklab
    result = result.replace(/oklab\([^\)]+\)/gi, 'rgb(128, 128, 128)');
    return result;
  };

  const downloadAsPDF = async () => {
    setSuccess(isEn ? "Starting PDF download..." : "Iniciando la descarga del archivo PDF...");
    
    try {
      const activeContent = getBrandedReportContent();
      
      // Mapeo de colores 
      const colorMap = {
        indigo: '#4f46e5',
        emerald: '#10b981',
        crimson: '#e11d48',
        amber: '#f59e0b',
        slate: '#334155'
      };
      
      const selectedColor = colorMap[brandColor as keyof typeof colorMap] || '#4f46e5';

      const blob = await pdf(
        <DocentPDFTemplate 
           header={brandHeader || 'Reporte Docent'} 
           authors={brandAuthors || 'Institución'} 
           content={activeContent}
           brandColor={selectedColor}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(brandHeader || 'recurso-didactico').toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      setSuccess(isEn ? "PDF downloaded successfully!" : "¡PDF descargado con éxito!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error generating native PDF:', err);
      setError(isEn ? `Error generating PDF.` : `Error generando el PDF.`);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle custom logo file uploads in customization flow
  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setBrandLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to get active formatted text
  const getBrandedReportContent = () => {
    if (selectedBrandingReportType === 'mock') {
      return isEn ? `## 1. Executive Coherence Summary
This report consolidates key data extracted from the provided technical and financial analysis documents. A **94%** coherence in the general chronological planning has been determined, with insignificant operational deviations located exclusively in the final audit phase.

## 2. Key Points and Central Findings
* **Strategic Alignment**: Operational goals of phases 1 and 2 fully coincide with the original contractual schedules proposed by the consortium.
* **Estimated Budget**: A **12%** contingency rate is confirmed, providing full coverage against unforeseen external exchange fluctuations and variations.
* **Active Risk Mitigation**: Three critical oversight areas were identified and integrated into the unified operations matrix.

## 3. General Conclusion
The unified analysis validates the project's feasibility, recommending proceeding with the subsequent budget allocation and agreement signing phase.` : `## 1. Resumen Ejecutivo de Coherencia
El presente informe consolida los datos clave extraídos de los documentos de análisis técnico y financiero provistos. Se ha determinado una coherencia del **94%** en la planificación cronológica general, con desviaciones operativas insignificantes localizadas exclusivamente en la fase final de auditoría.

## 2. Puntos Clave y Hallazgos Centrales
* **Alineación Estratégica**: Las metas operativas de las fases 1 y 2 coinciden plenamente con los calendarios contractuales propuestos originalmente por el consorcio.
* **Presupuesto Estimado**: Se confirma una tasa de contingencia del **12%**, lo cual ofrece cobertura total contra fluctuaciones y variaciones cambiarias externas imprevistas.
* **Mitigación Activa de Riesgos**: Se identificaron tres áreas críticas de supervisión, las cuales han sido integradas en la matriz unificada de operaciones.

## 3. Conclusión General
El análisis unificado valida la viabilidad del proyecto, recomendando proceder con la fase subsiguiente de asignación presupuestaria y firma de convenios.`;
    }

    const sortedIds = [...selectedFileIds].sort().join('_');
    const matchedReport = reports.find(r => r.pdfId.startsWith(sortedIds) && r.pdfId.includes(selectedBrandingReportType));

    if (matchedReport) {
      return matchedReport.content;
    }

    return isEn ? `### 💡 No analysis generated for the selected option.

You can change the source to **"Demonstration Text"** to preview styles, or go to the corresponding tab to generate an executive summary, comparative chart, or custom AI analysis first.` : `### 💡 No se encontró ningún análisis generado para la opción seleccionada.

Podés cambiar la fuente a **"Texto de Demostración"** para previsualizar los estilos, o ir a la pestaña correspondiente para generar un resumen ejecutivo, cuadro comparativo o análisis personalizado con Inteligencia Artificial primero.`;
  };

  return (
    <div className="min-h-screen bg-slate-950/50 flex flex-col font-sans select-none overflow-hidden">
      
      {/* Top Header */}
      <header className="bg-slate-900/60 backdrop-blur-xl border border-white/5 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-md text-white">
            <BrainCircuit className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950 font-sans flex items-center gap-2">
              RAICEP PDF exclusive
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
                Multi-Doc Workspace
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">{isEn ? 'Document coherence analysis, comparison and cross-chat with Gemini 2.5' : 'Análisis de coherencia documental, comparación y chat cruzado con Gemini 2.5'}</p>
          </div>
        </div>

        {/* Global Notifications Panel */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsTutorialOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-lg"
          >
            <HelpCircle size={18} />
            <span>Tutorial</span>
          </button>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 border border-red-100 max-w-sm"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="truncate">{error}</span>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors ml-1">
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 border border-emerald-100"
              >
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>{isEn ? 'Engine Ready' : 'Motor Listo'}</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Upload, selection checkbox table & catalog */}
        <section className="w-80 border-r border-slate-800 bg-slate-900/60 backdrop-blur-xl border border-white/5 flex flex-col shrink-0 overflow-y-auto">
          
          {/* Upload Widget */}
          <div className="p-4 border-b border-slate-800/50 bg-slate-950/20">
            <label 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`group flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 ${
                isDragActive 
                  ? 'border-indigo-500 bg-indigo-50/50' 
                  : 'border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50'
              }`}
            >
              <input 
                type="file" 
                accept=".pdf,.docx,.txt,.csv,.json,.md,.html,.xml" 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <div className={`p-2.5 rounded-xl mb-2 transition-colors duration-200 ${
                isDragActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-950 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'
              }`}>
                <UploadCloud className="h-5.5 w-5.5" />
              </div>
              <p className="text-xs font-bold text-slate-200 mb-0.5 group-hover:text-indigo-600">{isEn ? 'Upload Document' : 'Subir Documento'}</p>
              <p className="text-[10px] text-slate-400 font-medium">{isEn ? 'Supports PDF, Word (DOCX) and Text' : 'Soporta PDF, Word (DOCX) y Texto'}</p>
            </label>
          </div>

          {/* Library Section header with selections check status */}
          <div className="px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/50 border-b border-slate-800/50">
            <span>{isEn ? 'Your library' : 'Tu biblioteca'}</span>
            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {isEn ? `${selectedFileIds.length} checked` : `${selectedFileIds.length} tildado${selectedFileIds.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          <div className="p-3 bg-slate-950 border-b border-slate-800/50 text-[11px] text-slate-500 font-medium leading-relaxed">
            {isEn ? '💡 Check 1, 2 or up to 3 files for the Gemini engine to analyze, summarize, compare or debate together.' : '💡 Tildá 1, 2 o hasta 3 archivos para que el motor Gemini los analice, resuma, compare o debata de forma conjunta.'}
          </div>

          {/* Catalog items list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {uploadedFiles.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-400">{isEn ? 'No documents yet.' : 'Sin documentos aún.'}</p>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{isEn ? 'Upload your files to start the unified or comparative analysis.' : 'Subí tus archivos para empezar el análisis unificado o comparativo.'}</p>
              </div>
            ) : (
              uploadedFiles.map((file) => {
                const isSelected = selectedFileIds.includes(file.id);
                return (
                  <div
                    key={file.id}
                    onClick={() => toggleFileSelection(file.id)}
                    className={`group w-full flex items-center justify-between p-3 rounded-xl transition-all text-left border cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-50/50 border-indigo-200/80 text-indigo-950 shadow-sm' 
                        : 'bg-transparent border-slate-800/50/40 hover:bg-slate-950 hover:border-slate-800/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 overflow-hidden min-w-0">
                      
                      {/* Checkbox wrapper */}
                      <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-slate-900/60 backdrop-blur-xl border border-white/5 group-hover:border-indigo-400'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate pr-1 text-slate-200 group-hover:text-indigo-950">{file.name}</p>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium mt-0.5">
                          <span className="font-mono text-[9px] bg-slate-800/50 px-1 py-0.2 rounded text-slate-500">{file.size}</span>
                          <span>•</span>
                          <span>{file.uploadedAt}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(file.id, file.name);
                      }}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="p-4 border-t border-slate-800/50 bg-slate-950/50">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1.5">
              <Sparkle className="h-3.5 w-3.5 text-indigo-500" /> {isEn ? 'Cross Coherence' : 'Coherencia Cruzada'}
            </h4>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              {isEn ? 'By processing multiple documents, Gemini correlates concepts, extracts contradictions and consolidates data coherence across all selected documents in a single cognitive reading.' : 'Al procesar múltiples documentos, Gemini correlaciona conceptos, extrae contradicciones y consolida la coherencia de datos a lo largo de todos los documentos seleccionados en una sola lectura cognitiva.'}
            </p>
          </div>
        </section>

        {/* Right Side Workspace Frame */}
        <section className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
          
          {activeFiles.length === 0 ? (
            /* Empty State: No active selection */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100/50 text-indigo-600 mb-4 shadow-sm">
                <BrainCircuit className="h-10 w-10 animate-pulse" />
              </div>
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">{isEn ? 'Let\'s start your unified analysis' : 'Comencemos tu análisis unificado'}</h2>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">
                {isEn ? 'Check one or more files in the sidebar to see the advanced tools for summary, modern matrix comparisons, or start conversational queries.' : 'Tildá uno o más archivos en la barra lateral para ver las herramientas avanzadas de resumen, comparaciones moderno de matriz, o iniciar consultas de conversación.'}
              </p>

              {/* Tips block */}
              <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-white/5 border border-slate-800/80 rounded-2xl p-5 text-left shadow-sm">
                <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{isEn ? 'Limitless Analysis' : 'Análisis sin límites'}</span>
                <h3 className="text-xs font-bold text-slate-200 mt-3">{isEn ? 'Immediate analysis rigor' : 'Rigor de análisis inmediato'}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {isEn ? 'You can upload a contract, a financial report and a technical manual together. Gemini will respond by weaving the three with absolute coherence in real time.' : 'Podés subir un contrato, un reporte financiero y un manual técnico juntos. Gemini responderá hilando los tres con absoluta coherencia en tiempo real.'}
                </p>
              </div>
            </div>
          ) : (
            /* Active Analysis Environment */
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Workspace Header Panel: Displays selected files and Tone Selector */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 border-b border-slate-800 px-6 py-4 shrink-0 flex flex-col space-y-4 shadow-sm z-10">
                
                {/* Active Files Summary list */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800/50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-800/60">
                      {isEn ? 'Workspace' : 'Entorno de Trabajo'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {activeFiles.length === 1 
                        ? (isEn ? 'Analyzing 1 document' : 'Analizando 1 documento') 
                        : (isEn ? `Analyzing ${activeFiles.length} documents simultaneously` : `Analizando ${activeFiles.length} documentos en simultáneo`)
                      }
                    </span>
                  </div>

                  {/* Visual listing of chosen filenames */}
                  <div className="flex items-center space-x-1.5 max-w-[50%] overflow-x-auto">
                    {activeFiles.map(file => (
                      <span key={file.id} className="text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-100 rounded-md px-2 py-0.5 truncate max-w-[140px] flex items-center space-x-1 shrink-0">
                        <FileText className="h-3 w-3 shrink-0 text-indigo-500" />
                        <span className="truncate">{file.name}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cognitive Style / Tone Selection Row */}
                <div className="border-t border-slate-800/50 pt-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 shrink-0">
                    <FileSliders className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-200">{isEn ? 'Analysis Style & Tone:' : 'Estilo de Análisis & Tono:'}</span>
                  </div>

                  {/* Tone grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full md:w-auto">
                    <button
                      onClick={() => setTone('argentino')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all border flex items-center justify-center space-x-1.5 ${
                        tone === 'argentino'
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-slate-900/60 backdrop-blur-xl border border-white/5 hover:bg-slate-950 text-slate-600 border-slate-800'
                      }`}
                    >
                      <span>🇦🇷</span>
                      <span>{isEn ? 'Argentine' : 'Argentino'}</span>
                    </button>

                    <button
                      onClick={() => setTone('humano')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all border flex items-center justify-center space-x-1.5 ${
                        tone === 'humano'
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-slate-900/60 backdrop-blur-xl border border-white/5 hover:bg-slate-950 text-slate-600 border-slate-800'
                      }`}
                    >
                      <Smile className="h-3.5 w-3.5" />
                      <span>{isEn ? 'Human' : 'Humano'}</span>
                    </button>

                    <button
                      onClick={() => setTone('moderno')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all border flex items-center justify-center space-x-1.5 ${
                        tone === 'moderno'
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-slate-900/60 backdrop-blur-xl border border-white/5 hover:bg-slate-950 text-slate-600 border-slate-800'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isEn ? 'Modern' : 'Moderno'}</span>
                    </button>

                    <button
                      onClick={() => setTone('standard')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all border flex items-center justify-center space-x-1.5 ${
                        tone === 'standard'
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-slate-900/60 backdrop-blur-xl border border-white/5 hover:bg-slate-950 text-slate-600 border-slate-800'
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>{isEn ? 'Standard' : 'Estándar'}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Subnavigation Tabs */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 border-b border-slate-800/80 px-6 pt-3 flex items-end justify-start shrink-0">
                <div className="flex space-x-6">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`pb-3 text-xs font-bold tracking-wide border-b-2 transition-all flex items-center space-x-2 ${
                      activeTab === 'summary' 
                        ? 'border-indigo-600 text-indigo-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-200'
                    }`}
                    title={isEn ? 'Get a structured summary of the content' : 'Obtén un resumen estructurado del contenido'}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{activeFiles.length > 1 ? (isEn ? 'Analysis and Coherence' : 'Análisis y Coherencia') : (isEn ? 'Executive Summary' : 'Resumen Ejecutivo')}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('compare')}
                    className={`pb-3 text-xs font-bold tracking-wide border-b-2 transition-all flex items-center space-x-2 ${
                      activeTab === 'compare' 
                        ? 'border-indigo-600 text-indigo-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-200'
                    }`}
                    title={isEn ? 'Compare different documents in a chart' : 'Compara diferentes documentos en una tabla'}
                  >
                    <Scale className="h-4 w-4" />
                    <span>{isEn ? 'Comparative Chart' : 'Cuadro Comparativo'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('extract')}
                    className={`pb-3 text-xs font-bold tracking-wide border-b-2 transition-all flex items-center space-x-2 ${
                      activeTab === 'extract' 
                        ? 'border-indigo-600 text-indigo-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-200'
                    }`}
                    title={isEn ? 'Extract structured data from your files' : 'Extrae datos estructurados de tus archivos'}
                  >
                    <Database className="h-4 w-4" />
                    <span>{isEn ? 'Data Extraction' : 'Extracción de Datos'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('custom')}
                    className={`pb-3 text-xs font-bold tracking-wide border-b-2 transition-all flex items-center space-x-2 ${
                      activeTab === 'custom' 
                        ? 'border-indigo-600 text-indigo-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-200'
                    }`}
                    title={isEn ? 'Perform custom analysis using prompts' : 'Realiza análisis personalizados mediante prompts'}
                  >
                    <Code className="h-4 w-4" />
                    <span>{isEn ? 'Custom Analysis' : 'Análisis Personalizado'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`pb-3 text-xs font-bold tracking-wide border-b-2 transition-all flex items-center space-x-2 ${
                      activeTab === 'chat' 
                        ? 'border-indigo-600 text-indigo-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-200'
                    }`}
                    title={isEn ? 'Chat with your document information' : 'Chatea con la información de tus documentos'}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{isEn ? 'Cross Chat' : 'Chat Cruzado'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('branding')}
                    className={`pb-3 text-xs font-bold tracking-wide border-b-2 transition-all flex items-center space-x-2 ${
                      activeTab === 'branding' 
                        ? 'border-indigo-600 text-indigo-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-200'
                    }`}
                    title={isEn ? 'Customize colors, logos and export PDF' : 'Personaliza colores, logos y exporta PDF'}
                  >
                    <Award className="h-4 w-4" />
                    <span>{isEn ? 'Brand and Export' : 'Marca y Exportar'}</span>
                  </button>
                </div>
              </div>

              {/* Workspace Main scrollable region */}
              <div className="flex-1 overflow-y-auto min-h-0 relative">
                
                {/* Loader Overlay */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl border border-white/5/75 backdrop-blur-[2px] flex flex-col items-center justify-center z-25">
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 px-6 py-6 rounded-2xl shadow-xl border border-slate-800/50 max-w-sm w-full text-center space-y-4">
                      <div className="flex justify-center">
                        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-100">{isEn ? 'Processing Gemini Query' : 'Procesando Consulta Gemini'}</p>
                        <p className="text-[11px] text-indigo-600 font-semibold mt-1 animate-pulse">{analysisStep}</p>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {isEn ? 'Selected tone:' : 'Tono seleccionado:'} <span className="font-bold text-slate-600 uppercase">{tone}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Render Selected View */}
                <div className="p-6 md:p-8 max-w-4xl mx-auto h-full flex flex-col">
                  
                  {activeTab === 'summary' && (
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 border border-slate-800/80 rounded-2xl shadow-sm p-6 md:p-8 flex-1 flex flex-col overflow-y-auto">
                      {activeReport ? (
                        <div>
                          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/50">
                            <div>
                              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                                {isEn ? 'Cognitive Synthesis' : 'Síntesis Cognitiva'} ({tone})
                              </span>
                              <p className="text-[10px] text-slate-400 mt-1">{isEn ? 'Generated just now' : 'Generado hace un momento'}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => triggerCustomExportFlow('summary')}
                                className="text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-all flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl shadow-sm hover:shadow-md"
                              >
                                <Printer className="h-4 w-4" />
                                <span>{isEn ? 'Download PDF for Students' : 'Descargar PDF para Alumnos'}</span>
                              </button>
                              <button
                                onClick={() => runAnalysis('summary')}
                                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors flex items-center space-x-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-950"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span>{isEn ? 'Update report' : 'Actualizar reporte'}</span>
                              </button>
                            </div>
                          </div>
                          <div className="prose max-w-none">
                            <MarkdownRenderer content={activeReport.content} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                          <div className="bg-indigo-50 text-indigo-600 p-4.5 rounded-full mb-3">
                            <Sparkles className="h-7 w-7" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-200">
                            {activeFiles.length > 1 ? (isEn ? 'Start Multi-document Synthesis' : 'Iniciar Síntesis Multidocumento') : (isEn ? 'Generate Executive Summary' : 'Generar Resumen Ejecutivo')}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                            {activeFiles.length > 1 
                              ? (isEn ? 'Analyzes the unified coherence thread between the chosen documents, identifying similarities and contradictions.' : 'Analiza el hilo de coherencia unificado entre los documentos elegidos, identificando similitudes y contradicciones.')
                              : (isEn ? 'In-depth scans the general structure and delivers a complete report of the file.' : 'Escanea en profundidad la estructura general y entrega un informe completo del archivo.')
                            }
                          </p>
                          <button
                            onClick={() => runAnalysis('summary')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all mt-6 flex items-center space-x-2"
                          >
                            <span>{isEn ? 'Scan and Generate' : 'Escanear y Generar'}</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'compare' && (
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 border border-slate-800/80 rounded-2xl shadow-sm p-6 md:p-8 flex-1 flex flex-col overflow-y-auto">
                      {activeReport ? (
                        <div>
                          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/50">
                            <div>
                              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                                {isEn ? 'Structured Comparative Matrix' : 'Matriz Comparativa Estructurada'} ({tone})
                              </span>
                              <p className="text-[10px] text-slate-400 mt-1">{isEn ? 'Generated just now' : 'Generado hace un momento'}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => triggerCustomExportFlow('compare')}
                                className="text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-all flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl shadow-sm hover:shadow-md"
                              >
                                <Printer className="h-4 w-4" />
                                <span>{isEn ? 'Download PDF for Students' : 'Descargar PDF para Alumnos'}</span>
                              </button>
                              <button
                                onClick={() => runAnalysis('compare')}
                                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors flex items-center space-x-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-950"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span>{isEn ? 'Generate again' : 'Generar de nuevo'}</span>
                              </button>
                            </div>
                          </div>
                          <div className="prose max-w-none">
                            <MarkdownRenderer content={activeReport.content} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                          <div className="bg-emerald-50 text-emerald-600 p-4.5 rounded-full mb-3">
                            <Scale className="h-7 w-7" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-200">{isEn ? 'Generate Modern Comparative Chart' : 'Generar Cuadro Comparativo Moderno'}</h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                            {isEn ? 'Organize all your PDFs side-by-side. Structure a matrix comparing topics, key figures, valuable conclusions, and add integrated reasoning.' : 'Organiza de forma side-by-side todos tus PDFs. Estructura una matriz comparando temas, cifras clave, conclusiones de valor, y agrega un razonamiento integrado.'}
                          </p>
                          <button
                            onClick={() => runAnalysis('compare')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all mt-6 flex items-center space-x-2"
                          >
                            <span>{isEn ? 'Structure Comparative Chart' : 'Estructurar Cuadro Comparativo'}</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'extract' && (
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 border border-slate-800/80 rounded-2xl shadow-sm p-6 md:p-8 flex-1 flex flex-col overflow-y-auto">
                      {activeReport ? (
                        <div>
                          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/50">
                            <div>
                              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                                {isEn ? 'Integrated Extraction' : 'Extracción Integrada'} ({tone})
                              </span>
                              <p className="text-[10px] text-slate-400 mt-1">{isEn ? 'Extracted just now' : 'Extraído hace un momento'}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => triggerCustomExportFlow('extract')}
                                className="text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-all flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl shadow-sm hover:shadow-md"
                              >
                                <Printer className="h-4 w-4" />
                                <span>{isEn ? 'Download PDF for Students' : 'Descargar PDF para Alumnos'}</span>
                              </button>
                              <button
                                onClick={() => runAnalysis('extract')}
                                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors flex items-center space-x-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-950"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span>{isEn ? 'Scan again' : 'Escanear de nuevo'}</span>
                              </button>
                            </div>
                          </div>
                          <div className="prose max-w-none">
                            <MarkdownRenderer content={activeReport.content} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                          <div className="bg-purple-50 text-purple-600 p-4.5 rounded-full mb-3">
                            <Database className="h-7 w-7" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-200">{isEn ? 'Educational Material (Quizzes) & Figures' : 'Material Didáctico (Quizzes) & Cifras'}</h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                            {isEn ? 'Automatically isolate dates, money amounts, contacts, references and generate tables with clean numerical data.' : 'Aísla automáticamente fechas, montos de dinero, contactos, referencias y genera tablas con datos numéricos limpios.'}
                          </p>
                          <button
                            onClick={() => runAnalysis('extract')}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all mt-6 flex items-center space-x-2"
                          >
                            <span>{isEn ? 'Start Extraction' : 'Iniciar Extracción'}</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'custom' && (
                    <div className="flex-1 flex flex-col space-y-6">
                      
                      {/* Configuration prompt form */}
                      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 border border-slate-800/80 rounded-2xl shadow-sm p-5 md:p-6">
                        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">{isEn ? 'Custom Cognitive Command' : 'Comando Cognitivo Personalizado'}</h3>
                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                          {isEn ? `Indicate what detailed analysis you want to do on the unified group of PDFs (${activeFiles.length} selected).` : `Indicá qué análisis detallado querés hacer sobre el grupo unificado de PDFs (${activeFiles.length} seleccionado/s).`}
                        </p>
                        
                        <div className="flex space-x-3 items-end">
                          <div className="flex-1">
                            <textarea
                              value={customPrompt}
                              onChange={(e) => setCustomPrompt(e.target.value)}
                              placeholder={isEn ? "E.g. 'Analyze if the first document contradicts any execution date of the second document...'" : "Ej. 'Analizá si el primer documento contradice alguna fecha de ejecución del segundo documento...'"}
                              className="w-full text-xs p-3 rounded-xl border border-slate-800 focus:border-indigo-500 focus:outline-none min-h-[70px] resize-none leading-relaxed bg-slate-950/50"
                            />
                          </div>
                          <button
                            onClick={() => runAnalysis('custom')}
                            disabled={!customPrompt.trim() || isAnalyzing}
                            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0 ${
                              (!customPrompt.trim() || isAnalyzing) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <span>{isEn ? 'Execute' : 'Ejecutar'}</span>
                            <Sparkles className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Presets */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-center">{isEn ? 'Examples:' : 'Ejemplos:'}</span>
                          <button 
                            onClick={() => {
                              setCustomPrompt(isEn ? "Are there differences or discrepancies in budgets or deadlines between the documents? List them in a comparative chart." : "¿Existen diferencias o discrepancias presupuestarias o de plazos entre los documentos? Listalos en un cuadro comparativo.");
                            }}
                            className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600 bg-slate-800/50 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            {isEn ? 'Detect discrepancies' : 'Detectar discrepancias'}
                          </button>
                          <button 
                            onClick={() => {
                              setCustomPrompt(isEn ? "Write a formal email unifying the central points of the selected documents." : "Redactá un correo electrónico formal unificando los puntos centrales de los documentos seleccionados.");
                            }}
                            className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600 bg-slate-800/50 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            {isEn ? 'Make executive email' : 'Hacer correo ejecutivo'}
                          </button>
                          <button 
                            onClick={() => {
                              setCustomPrompt(isEn ? "Search for all contacts, signatures and responsible parties listed in each text." : "Buscá todos los contactos, firmas y responsables que figuran en cada texto.");
                            }}
                            className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600 bg-slate-800/50 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            {isEn ? 'List responsible parties' : 'Listar responsables'}
                          </button>
                        </div>
                      </div>

                      {/* Custom Analysis Output */}
                      {activeReport && activeReport.type === 'custom' && (
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 border border-slate-800/80 rounded-2xl shadow-sm p-6 md:p-8 flex-1 overflow-y-auto">
                          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800/50">
                            <div>
                              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                                {isEn ? 'Custom Analysis' : 'Análisis Personalizado'} ({tone})
                              </span>
                              <p className="text-xs font-bold text-slate-200 mt-1.5 truncate max-w-lg">"{activeReport.query}"</p>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0">
                              <button
                                onClick={() => triggerCustomExportFlow('custom')}
                                className="text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-all flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl shadow-sm hover:shadow-md"
                              >
                                <Printer className="h-4 w-4" />
                                <span>{isEn ? 'Download PDF for Students' : 'Descargar PDF para Alumnos'}</span>
                              </button>
                              <span className="text-[10px] text-slate-400 font-medium hidden md:inline">{isEn ? 'Executed at' : 'Ejecutado a las'} {activeReport.generatedAt}</span>
                            </div>
                          </div>
                          <div className="prose max-w-none">
                            <MarkdownRenderer content={activeReport.content} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'chat' && (
                    <div className="flex-1 flex flex-col bg-slate-900/60 backdrop-blur-xl border border-white/5 border border-slate-800/80 rounded-2xl shadow-sm overflow-hidden h-[540px]">
                      
                      {/* Chat Header */}
                      <div className="bg-slate-950 px-5 py-3 border-b border-slate-800/50 flex items-center justify-between shrink-0">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4 text-indigo-600 animate-pulse" />
                          <span className="text-xs font-bold text-slate-200">
                            {isEn ? 'Cross Consultation Room' : 'Sala de Consulta Cruzada'} ({tone})
                          </span>
                        </div>
                        {activeChat.length > 0 && (
                          <button
                            onClick={clearActiveChat}
                            className="text-[10px] font-bold text-slate-500 hover:text-red-500 transition-colors bg-slate-900/60 backdrop-blur-xl border border-white/5 px-2.5 py-1 rounded-lg border border-slate-800 shadow-sm"
                          >
                            {isEn ? 'Clear History' : 'Limpiar Historial'}
                          </button>
                        )}
                      </div>

                      {/* Chat Messages scroll area */}
                      <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {activeChat.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6">
                            <div className="bg-indigo-50 text-indigo-500 p-4 rounded-full mb-3 animate-bounce">
                              <MessageSquare className="h-6 w-6" />
                            </div>
                            <h4 className="text-xs font-bold text-slate-200">{isEn ? 'Active multi-context chat' : 'Chat multicontexto activo'}</h4>
                            <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed font-medium">
                              {activeFiles.length > 1 
                                ? (isEn ? `Make continuous queries crossing the ${activeFiles.length} documents. Gemini will keep the logical thread weaving the sources with the configured tone.` : `Hacé consultas continuas cruzando los ${activeFiles.length} documentos. Gemini mantendrá el hilo lógico hilando las fuentes con el tono configurado.`)
                                : (isEn ? 'Ask Gemini any detail about the PDF and get quotes with excellent conversational precision.' : 'Preguntale a Gemini cualquier detalle sobre el PDF y obtené citas con excelente precisión conversacional.')
                              }
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {activeChat.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                                  msg.role === 'user'
                                    ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                                    : 'bg-slate-950 text-slate-200 border border-slate-800/50 rounded-tl-none font-normal'
                                }`}>
                                  <div className="prose prose-sm prose-invert select-text">
                                    <MarkdownRenderer content={msg.content} />
                                  </div>
                                  <div className={`text-[9px] mt-2 flex items-center justify-end font-medium ${
                                    msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                                  }`}>
                                    <span>{msg.timestamp}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Chat Input Footer */}
                      <div className="p-3 border-t border-slate-800/50 bg-slate-950/50 shrink-0">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={
                              activeFiles.length > 1 
                                ? (isEn ? `Ask about ${activeFiles.length} documents simultaneously...` : `Preguntá sobre ${activeFiles.length} documentos en simultáneo...`)
                                : (isEn ? "Write your query and press Enter..." : "Escribe tu consulta y presiona Enter...")
                            }
                            className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl border border-white/5 focus:outline-none focus:border-indigo-500"
                            disabled={isAnalyzing}
                          />
                          <button
                            onClick={sendChatMessage}
                            disabled={!chatInput.trim() || isAnalyzing}
                            className={`p-2.5 rounded-xl text-white shadow bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center shrink-0 ${
                              (!chatInput.trim() || isAnalyzing) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                  {activeTab === 'branding' && (
                    <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full overflow-hidden min-h-[580px]">
                      
                      {/* Left Control Panel: Form / Customization */}
                      <div className="w-full lg:w-[400px] flex flex-col space-y-5 bg-slate-900/60 backdrop-blur-xl border border-white/5 border border-slate-800/80 rounded-2xl shadow-sm p-5 md:p-6 overflow-y-auto shrink-0 max-h-full no-print">
                        
                        <div>
                          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-1.5">
                            <Award className="h-4 w-4 text-indigo-600" />
                            <span>{isEn ? 'Report Design and Brand' : 'Diseño y Marca del Reporte'}</span>
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {isEn ? 'Customize the document preview without altering the original AI text.' : 'Personalizá la previsualización del documento sin alterar el texto original de la IA.'}
                          </p>
                        </div>

                        {/* Interactive AI Brand Agent (Pregúntame y lo agrego automáticamente) */}
                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 space-y-2">
                          <label className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center space-x-1">
                            <Sparkle className="h-3.5 w-3.5" />
                            <span>{isEn ? 'AI Design Assistant' : 'Asistente AI de Diseño'}</span>
                          </label>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            {isEn ? 'Write what it is about or who signs it and the AI will configure the header, authors and style automatically.' : 'Escribí de qué se trata o quién lo firma y la IA configurará el encabezado, autores y estilo automáticamente.'}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={aiBrandingPrompt}
                              onChange={(e) => setAiBrandingPrompt(e.target.value)}
                              placeholder={isEn ? "E.g. Cost report signed by Eng. Leonardo..." : "Ej: Informe de costos firmado por Ing. Leonardo..."}
                              className="flex-1 text-[11px] px-3 py-2 rounded-lg border border-slate-800 bg-slate-900/60 backdrop-blur-xl border border-white/5 focus:outline-none focus:border-indigo-500 font-medium"
                              disabled={isGeneratingBranding}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAiBrandingHelp();
                                }
                              }}
                            />
                            <button
                              onClick={handleAiBrandingHelp}
                              disabled={!aiBrandingPrompt.trim() || isGeneratingBranding}
                              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[11px] font-bold rounded-lg transition-all shrink-0 flex items-center justify-center cursor-pointer"
                            >
                              {isGeneratingBranding ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <span>{isEn ? 'Apply' : 'Aplicar'}</span>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Manual Customization options */}
                        <div className="space-y-4 pt-1">
                          
                          {/* Logo selector / uploader */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                              <ImageIcon className="h-3.5 w-3.5" />
                              <span>{isEn ? 'Institutional Logo' : 'Logotipo Institucional'}</span>
                            </label>
                            
                            {/* Logo File upload */}
                            <div className="flex items-center space-x-3 bg-slate-950 p-2.5 rounded-xl border border-dashed border-slate-800">
                              <label className="cursor-pointer bg-slate-900/60 backdrop-blur-xl border border-white/5 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-950 transition-all shrink-0">
                                <span>{isEn ? 'Upload File' : 'Subir Archivo'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        if (event.target?.result) {
                                          setBrandLogo(event.target.result as string);
                                          setSuccess(isEn ? 'Logo loaded successfully.' : 'Logotipo cargado correctamente.');
                                          setTimeout(() => setSuccess(null), 3000);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                              <span className="text-[10px] text-slate-400 truncate flex-1">
                                {brandLogo ? (isEn ? 'Image loaded' : 'Imagen cargada') : 'PNG, JPG (máx. 1MB)'}
                              </span>
                              {brandLogo && (
                                <button
                                  onClick={() => setBrandLogo(null)}
                                  className="text-[10px] font-bold text-red-500 hover:text-red-700 bg-slate-900/60 backdrop-blur-xl border border-white/5 px-2 py-1 rounded-lg border border-slate-800 shadow-sm shrink-0 cursor-pointer"
                                >
                                  {isEn ? 'Delete' : 'Eliminar'}
                                </button>
                              )}
                            </div>

                            {/* Logo Presets (No manual) */}
                            <div className="grid grid-cols-3 gap-1.5 mt-2">
                              {logoPresets.map(preset => (
                                <button
                                  key={preset.id}
                                  onClick={() => setBrandLogo(preset.svg)}
                                  className={`p-2 border rounded-xl flex flex-col items-center justify-center transition-all bg-slate-900/60 backdrop-blur-xl border border-white/5 hover:bg-slate-950 cursor-pointer ${
                                    brandLogo === preset.svg 
                                      ? 'border-indigo-600 ring-2 ring-indigo-50' 
                                      : 'border-slate-800'
                                  }`}
                                >
                                  <img src={preset.svg} className="h-5 w-5 mb-1" alt={preset.name} referrerPolicy="no-referrer" />
                                  <span className="text-[9px] font-bold text-slate-500 text-center truncate w-full">{preset.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Header Text */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                              <FileText className="h-3.5 w-3.5" />
                              <span>{isEn ? 'Header / Report Title' : 'Encabezado / Título de Reporte'}</span>
                            </label>
                            <input
                              type="text"
                              value={brandHeader}
                              onChange={(e) => setBrandHeader(e.target.value)}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                              placeholder={isEn ? "E.g. MULTI-CONTRACT COHERENCE REPORT" : "Ej: INFORME DE COHERENCIA MULTI-CONTRATO"}
                            />
                          </div>

                          {/* Authors Text */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                              <Users className="h-3.5 w-3.5" />
                              <span>{isEn ? 'Author / Organization' : 'Autor / Organismo'}</span>
                            </label>
                            <input
                              type="text"
                              value={brandAuthors}
                              onChange={(e) => setBrandAuthors(e.target.value)}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                              placeholder={isEn ? "E.g. Dept. of Engineering and Infrastructure" : "Ej: Dpto. de Ingeniería e Infraestructura"}
                            />
                          </div>

                          {/* Font Selector */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                              <Type className="h-3.5 w-3.5" />
                              <span>{isEn ? 'Typographic Style' : 'Estilo Tipográfico'}</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setBrandFont('sans')}
                                className={`p-2 rounded-xl border text-left transition-all bg-slate-900/60 backdrop-blur-xl border border-white/5 hover:bg-slate-950 cursor-pointer ${
                                  brandFont === 'sans' ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-slate-800'
                                }`}
                              >
                                <span className="text-[11px] font-bold block text-slate-200 font-sans">Jakarta Sans</span>
                                <span className="text-[9px] text-slate-400 block font-sans">Sleek, Modern UI</span>
                              </button>
                              <button
                                onClick={() => setBrandFont('serif')}
                                className={`p-2 rounded-xl border text-left transition-all bg-slate-900/60 backdrop-blur-xl border border-white/5 hover:bg-slate-950 cursor-pointer ${
                                  brandFont === 'serif' ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-slate-800'
                                }`}
                              >
                                <span className="text-[11px] font-bold block text-slate-200 font-serif">Playfair Serif</span>
                                <span className="text-[9px] text-slate-400 block font-serif">Academic Brief</span>
                              </button>
                              <button
                                onClick={() => setBrandFont('grotesk')}
                                className={`p-2 rounded-xl border text-left transition-all bg-slate-900/60 backdrop-blur-xl border border-white/5 hover:bg-slate-950 cursor-pointer ${
                                  brandFont === 'grotesk' ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-slate-800'
                                }`}
                              >
                                <span className="text-[11px] font-bold block text-slate-200 font-grotesk">Grotesk Tech</span>
                                <span className="text-[9px] text-slate-400 block font-grotesk">Geometric Startup</span>
                              </button>
                              <button
                                onClick={() => setBrandFont('mono')}
                                className={`p-2 rounded-xl border text-left transition-all bg-slate-900/60 backdrop-blur-xl border border-white/5 hover:bg-slate-950 cursor-pointer ${
                                  brandFont === 'mono' ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-slate-800'
                                }`}
                              >
                                <span className="text-[11px] font-bold block text-slate-200 font-mono">Code Mono</span>
                                <span className="text-[9px] text-slate-400 block font-mono">Data Technical</span>
                              </button>
                            </div>
                          </div>

                          {/* Source report content selection */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                              <FileText className="h-3.5 w-3.5" />
                              <span>{isEn ? 'Content to Export' : 'Contenido a Exportar'}</span>
                            </label>
                            <select
                              value={selectedBrandingReportType}
                              onChange={(e) => setSelectedBrandingReportType(e.target.value)}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 bg-slate-900/60 backdrop-blur-xl border border-white/5 font-medium"
                            >
                              <option value="summary">{isEn ? 'Executive Summary / Coherence' : 'Resumen Ejecutivo / Coherencia'}</option>
                              <option value="compare">{isEn ? 'Comparative Chart' : 'Cuadro Comparativo'}</option>
                              <option value="extract">{isEn ? 'Data Extraction' : 'Extracción de Datos'}</option>
                              <option value="custom">{isEn ? 'Custom Analysis' : 'Análisis Personalizado'}</option>
                              <option value="mock">{isEn ? 'Demonstration Text (Quick preview)' : 'Texto de Demostración (Vista previa rápida)'}</option>
                            </select>
                          </div>

                        </div>

                      </div>

                      {/* Right Paper Layout Previews */}
                      <div className="flex-1 flex flex-col space-y-4 h-full overflow-hidden min-h-[500px]">
                        
                        {/* Upper Bar: Previews selector and Export triggers */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 border border-slate-800/80 rounded-2xl shadow-sm p-4 flex items-center justify-between no-print flex-wrap gap-3 shrink-0">
                          
                          {/* Option Previews Toggles */}
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">{isEn ? 'Template Style:' : 'Estilo de Plantilla:'}</span>
                            <button
                              onClick={() => setBrandStyle('classic')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all border flex items-center space-x-1.5 cursor-pointer ${
                                brandStyle === 'classic'
                                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                  : 'bg-slate-900/60 backdrop-blur-xl border border-white/5 hover:bg-slate-950 text-slate-600 border-slate-800'
                              }`}
                            >
                              <Layout className="h-3.5 w-3.5" />
                              <span>{isEn ? 'Option A: Executive Memo' : 'Opción A: Memoria Ejecutiva'}</span>
                            </button>
                            <button
                              onClick={() => setBrandStyle('modern')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all border flex items-center space-x-1.5 cursor-pointer ${
                                brandStyle === 'modern'
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                  : 'bg-slate-900/60 backdrop-blur-xl border border-white/5 hover:bg-slate-950 text-slate-600 border-slate-800'
                              }`}
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>{isEn ? 'Option B: Avant-garde Report' : 'Opción B: Reporte Vanguardista'}</span>
                            </button>
                          </div>

                          {/* Export Button */}
                          <button
                            onClick={() => triggerCustomExportFlow(selectedBrandingReportType)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow hover:shadow-md transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
                          >
                            <Printer className="h-4 w-4" />
                            <span>{isEn ? 'Print / Export PDF' : 'Imprimir / Exportar PDF'}</span>
                          </button>
                        </div>

                        {/* Interactive Paper Viewport */}
                        <div className="flex-1 overflow-y-auto bg-slate-800/50 rounded-2xl border border-slate-800/50 p-4 md:p-8 flex items-start justify-center">
                          
                          {/* Physical A4/Letter Paper Simulation Container */}
                          <div
                            id="on-screen-brand-preview"
                            className={`w-full max-w-2xl bg-slate-900/60 backdrop-blur-xl border border-white/5 shadow-xl border border-slate-800/60 rounded-lg p-8 md:p-12 min-h-[780px] flex flex-col justify-between transition-all duration-300 relative ${
                              brandFont === 'serif' ? 'font-serif' : brandFont === 'mono' ? 'font-mono' : brandFont === 'grotesk' ? 'font-grotesk' : 'font-sans'
                            }`}
                          >
                            
                            {/* Layout Option A: Classic Memoir */}
                            {brandStyle === 'classic' ? (
                              <div className="flex-1 flex flex-col">
                                
                                {/* Centered Classic Top Header with dividers */}
                                <div className="text-center pb-6 border-b border-slate-800/80 mb-8 flex flex-col items-center">
                                  {brandLogo && (
                                    <div className="mb-4 bg-slate-950/50 p-2 rounded-xl border border-slate-800/50 flex items-center justify-center">
                                      <img src={brandLogo} className="h-10 w-10 object-contain" alt="Logo de Marca" referrerPolicy="no-referrer" />
                                    </div>
                                  )}
                                  <span className="text-[10px] tracking-[0.2em] font-semibold text-slate-500 uppercase">
                                    {brandAuthors || (isEn ? 'SCHOOL OR EDUCATIONAL INSTITUTION' : 'COLEGIO O INSTITUCIÓN EDUCATIVA')} {brandTeacher && `• ${brandTeacher.toUpperCase()}`}
                                  </span>
                                  <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-2 mb-1 uppercase font-serif">
                                    {brandHeader || (isEn ? 'LEARNING AND STUDY GUIDE' : 'GUÍA DE APRENDIZAJE Y ESTUDIO')}
                                  </h1>
                                  <div className="text-[9px] text-slate-400 mt-1 tracking-wider font-mono">
                                    {isEn ? 'Study Material for Students • Generated on:' : 'Material de Estudio para Alumnos • Generado el:'} {new Date().toLocaleDateString('es-AR')}
                                  </div>
                                </div>

                                {/* Body Content */}
                                <div className={`flex-1 prose max-w-none ${colorThemes[brandColor]?.prose || 'prose-indigo'}`}>
                                  <MarkdownRenderer 
                                    content={getBrandedReportContent()} 
                                    fontClass={brandFont === 'serif' ? 'font-serif' : brandFont === 'mono' ? 'font-mono' : brandFont === 'grotesk' ? 'font-grotesk' : 'font-sans'}
                                  />
                                </div>

                                {/* Classic Minimal Footer */}
                                <div className="mt-12 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-400 font-serif">
                                  <span>{isEn ? 'Educational material ready to distribute to students • Commercial sale prohibited' : 'Material didáctico listo para distribuir a los estudiantes • Prohibida su venta comercial'}</span>
                                </div>

                              </div>
                            ) : (
                              
                              /* Layout Option B: Modern Corporate */
                              <div className="flex-1 flex flex-col">
                                
                                {/* Modern Left-Aligned Bold Header Panel with color accents */}
                                <div className={`flex items-start justify-between pb-6 border-b-2 ${colorThemes[brandColor]?.border || 'border-indigo-600'} mb-8`}>
                                  <div className="space-y-1 max-w-[80%]">
                                    <div className="flex items-center space-x-2">
                                      <span className={`text-[10px] font-bold ${colorThemes[brandColor]?.text || 'text-indigo-600'} ${colorThemes[brandColor]?.bgLight || 'bg-indigo-50'} px-2.5 py-1 rounded-full uppercase tracking-wider`}>
                                        {isEn ? 'LEARNING GUIDE' : 'GUÍA DE APRENDIZAJE'}
                                      </span>
                                    </div>
                                    <h1 className="text-2xl font-black text-slate-100 tracking-tight leading-none pt-1 uppercase font-grotesk">
                                      {brandHeader || (isEn ? 'LEARNING AND STUDY GUIDE' : 'GUÍA DE APRENDIZAJE Y ESTUDIO')}
                                    </h1>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2">
                                      <span className="text-[10px] text-slate-500 font-semibold">
                                        {isEn ? 'Institution:' : 'Institución:'} <span className="text-slate-200">{brandAuthors || (isEn ? 'School or Educational Institution' : 'Colegio o Institución Educativa')}</span>
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-semibold">
                                        {isEn ? 'Teacher:' : 'Docente:'} <span className="text-slate-200">{brandTeacher || (isEn ? 'Head Teacher' : 'Profesor/a Titular')}</span>
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {isEn ? 'Date:' : 'Fecha:'} {new Date().toLocaleDateString('es-AR')}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {brandLogo && (
                                    <div className={`${colorThemes[brandColor]?.bgLight || 'bg-indigo-50/50'} p-2.5 rounded-2xl border ${colorThemes[brandColor]?.borderLight || 'border-indigo-100'} flex items-center justify-center shrink-0 shadow-sm`}>
                                      <img src={brandLogo} className="h-12 w-12 object-contain" alt="Logo de Marca" referrerPolicy="no-referrer" />
                                    </div>
                                  )}
                                </div>

                                {/* Body Content */}
                                <div className={`flex-1 prose max-w-none ${colorThemes[brandColor]?.prose || 'prose-indigo'} font-sans`}>
                                  <MarkdownRenderer 
                                    content={getBrandedReportContent()} 
                                    fontClass={brandFont === 'serif' ? 'font-serif' : brandFont === 'mono' ? 'font-mono' : brandFont === 'grotesk' ? 'font-grotesk' : 'font-sans'}
                                  />
                                </div>

                                {/* Modern Tech Footer with tag-like blocks */}
                                <div className="mt-12 pt-4 border-t border-slate-800/50 flex items-center justify-between text-[9px] text-slate-400 font-medium">
                                  <span>© {new Date().getFullYear()} {brandAuthors || (isEn ? 'Educational Institution' : 'Institución Educativa')} {brandTeacher && (isEn ? `• Teacher: ${brandTeacher}` : `• Docente: ${brandTeacher}`)}</span>
                                  <span className="bg-slate-800/50 px-2 py-0.5 rounded font-mono text-slate-500">{isEn ? 'EDUCATIONAL RESOURCE' : 'RECURSO DIDÁCTICO'}</span>
                                </div>

                              </div>
                            )}

                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

        </section>

      </main>

      {/* Global Print-Only Container */}
      <div className="hidden print:block" id="printable-brand-report">
        <div
          className={`w-full bg-slate-900/60 backdrop-blur-xl border border-white/5 p-12 min-h-screen flex flex-col justify-between ${
            brandFont === 'serif' ? 'font-serif' : brandFont === 'mono' ? 'font-mono' : brandFont === 'grotesk' ? 'font-grotesk' : 'font-sans'
          }`}
        >
          {/* Layout Option A: Classic Memoir */}
          {brandStyle === 'classic' ? (
            <div className="flex-1 flex flex-col">
              <div className="text-center pb-6 border-b border-slate-800/80 mb-8 flex flex-col items-center">
                {brandLogo && (
                  <div className="mb-4 bg-slate-950/50 p-2 rounded-xl border border-slate-800/50 flex items-center justify-center">
                    <img src={brandLogo} className="h-10 w-10 object-contain" alt="Logo de Marca" referrerPolicy="no-referrer" />
                  </div>
                )}
                <span className="text-[10px] tracking-[0.2em] font-semibold text-slate-500 uppercase text-center block max-w-full">
                  {brandAuthors || (isEn ? 'SCHOOL OR EDUCATIONAL INSTITUTION' : 'COLEGIO O INSTITUCIÓN EDUCATIVA')} {brandTeacher && `• ${brandTeacher.toUpperCase()}`}
                </span>
                <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-2 mb-1 uppercase font-serif">
                  {brandHeader || (isEn ? 'LEARNING AND STUDY GUIDE' : 'GUÍA DE APRENDIZAJE Y ESTUDIO')}
                </h1>
                <div className="text-[9px] text-slate-400 mt-1 tracking-wider font-mono">
                  {isEn ? 'Study Material for Students • Generated on:' : 'Material de Estudio para Alumnos • Generado el:'} {new Date().toLocaleDateString('es-AR')}
                </div>
              </div>

              <div className={`flex-1 prose max-w-none ${colorThemes[brandColor]?.prose || 'prose-indigo'}`}>
                <MarkdownRenderer 
                  content={getBrandedReportContent()} 
                  fontClass={brandFont === 'serif' ? 'font-serif' : brandFont === 'mono' ? 'font-mono' : brandFont === 'grotesk' ? 'font-grotesk' : 'font-sans'}
                />
              </div>

              <div className="mt-12 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-400 font-serif">
                <span>{isEn ? 'Educational material ready to distribute to students • Commercial sale prohibited • Teacher:' : 'Material didáctico listo para distribuir a los estudiantes • Prohibida su venta comercial • Profesor:'} {brandTeacher || (isEn ? 'Head Teacher' : 'Profesor/a Titular')}</span>
              </div>
            </div>
          ) : (
            /* Layout Option B: Modern Corporate */
            <div className="flex-1 flex flex-col">
              <div className={`flex items-start justify-between pb-6 border-b-2 ${colorThemes[brandColor]?.border || 'border-indigo-600'} mb-8`}>
                <div className="space-y-1 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold ${colorThemes[brandColor]?.text || 'text-indigo-600'} ${colorThemes[brandColor]?.bgLight || 'bg-indigo-50'} px-2.5 py-1 rounded-full uppercase tracking-wider`}>
                      {isEn ? 'LEARNING GUIDE' : 'GUÍA DE APRENDIZAJE'}
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-100 tracking-tight leading-none pt-1 uppercase font-grotesk">
                    {brandHeader || (isEn ? 'LEARNING AND STUDY GUIDE' : 'GUÍA DE APRENDIZAJE Y ESTUDIO')}
                  </h1>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2">
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {isEn ? 'Institution:' : 'Institución:'} <span className="text-slate-200">{brandAuthors || (isEn ? 'School or Educational Institution' : 'Colegio o Institución Educativa')}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {isEn ? 'Teacher:' : 'Docente:'} <span className="text-slate-200">{brandTeacher || (isEn ? 'Head Teacher' : 'Profesor/a Titular')}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {isEn ? 'Date:' : 'Fecha:'} {new Date().toLocaleDateString('es-AR')}
                    </span>
                  </div>
                </div>

                {brandLogo && (
                  <div className={`${colorThemes[brandColor]?.bgLight || 'bg-indigo-50/50'} p-2.5 rounded-2xl border ${colorThemes[brandColor]?.borderLight || 'border-indigo-100'} flex items-center justify-center shrink-0 shadow-sm`}>
                    <img src={brandLogo} className="h-12 w-12 object-contain" alt="Logo de Marca" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              <div className={`flex-1 prose max-w-none ${colorThemes[brandColor]?.prose || 'prose-indigo'} font-sans`}>
                <MarkdownRenderer 
                  content={getBrandedReportContent()} 
                  fontClass={brandFont === 'serif' ? 'font-serif' : brandFont === 'mono' ? 'font-mono' : brandFont === 'grotesk' ? 'font-grotesk' : 'font-sans'}
                />
              </div>

              <div className="mt-12 pt-4 border-t border-slate-800/50 flex items-center justify-between text-[9px] text-slate-400 font-medium">
                <span>© {new Date().getFullYear()} {brandAuthors || (isEn ? 'Educational Institution' : 'Institución Educativa')} {brandTeacher && (isEn ? `• Teacher: ${brandTeacher}` : `• Docente: ${brandTeacher}`)}</span>
                <span className="bg-slate-800/50 px-2 py-0.5 rounded font-mono text-slate-500">{isEn ? 'EDUCATIONAL RESOURCE' : 'RECURSO DIDÁCTICO'}</span>
              </div>
              <div className="mt-12 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-400 font-serif">
                <span>Material didáctico listo para distribuir a los estudiantes • Prohibida su venta comercial • Profesor: {brandTeacher || 'Profesor/a Titular'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual format selection modal when automatic detection fails */}
      {formatConflictFile && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl border border-slate-800/50 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 text-indigo-600">
                <HelpCircle className="h-5 w-5" />
                <h3 className="text-sm font-bold text-slate-100">{isEn ? 'What format is this file?' : '¿Qué formato tiene este archivo?'}</h3>
              </div>
              <button 
                onClick={() => setFormatConflictFile(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-950 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isEn ? 'We could not detect the automatic extension for the file' : 'No pudimos detectar la extensión automática para el archivo'} <span className="font-bold text-slate-200">"{formatConflictFile.file.name}"</span>. 
              {isEn ? 'Select an option so that the Gemini engine can read and interpret its text correctly:' : 'Seleccioná una opción para que el motor Gemini pueda leer e interpretar su texto correctamente:'}
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => {
                  const cleanBase64 = formatConflictFile.base64.replace(/^data:[^;]+;base64,/, "");
                  const finalBase64 = `data:application/pdf;base64,${cleanBase64}`;
                  const finalName = formatConflictFile.file.name.includes('.') ? formatConflictFile.file.name : `${formatConflictFile.file.name}.pdf`;
                  addDocumentToLibrary(finalName, formatConflictFile.file.size, finalBase64);
                  setFormatConflictFile(null);
                }}
                className="flex items-center justify-between p-3.5 border border-slate-800 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/20 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">📄</span>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block group-hover:text-indigo-950">{isEn ? 'It is a PDF document' : 'Es un documento PDF'}</span>
                    <span className="text-[10px] text-slate-400 block">{isEn ? 'Blueprints, signed contracts, scanned reports' : 'Planos, contratos firmados, reportes escaneados'}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => {
                  const cleanBase64 = formatConflictFile.base64.replace(/^data:[^;]+;base64,/, "");
                  const finalBase64 = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${cleanBase64}`;
                  const finalName = formatConflictFile.file.name.includes('.') ? formatConflictFile.file.name : `${formatConflictFile.file.name}.docx`;
                  addDocumentToLibrary(finalName, formatConflictFile.file.size, finalBase64);
                  setFormatConflictFile(null);
                }}
                className="flex items-center justify-between p-3.5 border border-slate-800 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/20 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">📝</span>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block group-hover:text-indigo-950">{isEn ? 'It is a Word document (DOCX)' : 'Es un documento Word (DOCX)'}</span>
                    <span className="text-[10px] text-slate-400 block">{isEn ? 'Rich text documents or Word minutes' : 'Documentos de texto enriquecido o minutas de Word'}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => {
                  const cleanBase64 = formatConflictFile.base64.replace(/^data:[^;]+;base64,/, "");
                  const finalBase64 = `data:text/plain;base64,${cleanBase64}`;
                  const finalName = formatConflictFile.file.name.includes('.') ? formatConflictFile.file.name : `${formatConflictFile.file.name}.txt`;
                  addDocumentToLibrary(finalName, formatConflictFile.file.size, finalBase64);
                  setFormatConflictFile(null);
                }}
                className="flex items-center justify-between p-3.5 border border-slate-800 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/20 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🔤</span>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block group-hover:text-indigo-950">Es un archivo de Texto (TXT, CSV, etc.)</span>
                    <span className="text-[10px] text-slate-400 block">Texto plano, planillas csv, markdown o código</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setFormatConflictFile(null)}
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-200 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium PDF Customization Modal before Download */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div 
            className={`bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl border border-slate-800/50 w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 no-print transition-all duration-300 ${
              exportModalStep === 'preview' ? 'max-w-4xl' : 'max-w-lg'
            }`}
          >
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800/50 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-100 flex items-center space-x-2">
                  <Printer className="h-5 w-5 text-rose-600 animate-pulse" />
                  <span>
                    {exportModalStep === 'customize' && "1. Personalizar Recurso Didáctico"}
                    {exportModalStep === 'compiling' && "2. Compilando Documento..."}
                    {exportModalStep === 'preview' && "3. Comparar y Elegir la Mejor Opción"}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {exportModalStep === 'customize' && "Ingresá los datos de tu institución y docente para dar un formato profesional:"}
                  {exportModalStep === 'compiling' && "Preparando el material y aplicando reglas estéticas avanzadas:"}
                  {exportModalStep === 'preview' && "Previsualizá y elegí el formato que mejor se adapte a tu grupo de alumnos:"}
                </p>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-950 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Step 1: Customize Form */}
            {exportModalStep === 'customize' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Institution Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Nombre de la Institución Educativa
                  </label>
                  <input
                    type="text"
                    value={brandAuthors}
                    onChange={(e) => setBrandAuthors(e.target.value)}
                    placeholder="Ej. Colegio Nacional N° 1"
                    className="w-full text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 bg-slate-950/50 font-medium"
                  />
                </div>

                {/* Teacher / Profesor Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Nombre del Profesor / Docente
                  </label>
                  <input
                    type="text"
                    value={brandTeacher}
                    onChange={(e) => setBrandTeacher(e.target.value)}
                    placeholder="Ej. Prof. Leonardo Morales"
                    className="w-full text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 bg-slate-950/50 font-medium"
                  />
                </div>

                {/* Title Header */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Título de la Guía o Documento
                  </label>
                  <input
                    type="text"
                    value={brandHeader}
                    onChange={(e) => setBrandHeader(e.target.value)}
                    placeholder="Ej. GUÍA DE APRENDIZAJE: FISICA DINÁMICA"
                    className="w-full text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 bg-slate-950/50 font-bold uppercase"
                  />
                </div>

                {/* Logo Selection Section */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Logotipo de la Institución
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {logoPresets.map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setBrandLogo(preset.svg)}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all bg-slate-900/60 backdrop-blur-xl border border-white/5 hover:bg-slate-950 cursor-pointer ${
                          brandLogo === preset.svg ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-slate-800'
                        }`}
                      >
                        <img src={preset.svg} className="h-8 w-8 object-contain mb-1" alt={preset.name} referrerPolicy="no-referrer" />
                        <span className="text-[9px] font-medium text-slate-600 truncate max-w-full text-center">{preset.name}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setBrandLogo(null)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all bg-slate-900/60 backdrop-blur-xl border border-white/5 hover:bg-slate-950 cursor-pointer ${
                        brandLogo === null ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-slate-800'
                      }`}
                    >
                      <span className="text-lg font-bold text-slate-400 mb-1">✕</span>
                      <span className="text-[9px] font-medium text-slate-600 text-center">Sin Logo</span>
                    </button>
                  </div>

                  {/* Upload Custom Logo Button */}
                  <div className="mt-2.5">
                    <label className="flex items-center justify-center px-4 py-2 border border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/30 rounded-xl cursor-pointer text-xs font-semibold text-slate-600 transition-all">
                      <UploadCloud className="h-4 w-4 mr-1.5 text-slate-400" />
                      <span>Subir logotipo personalizado (PNG/JPG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCustomLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {brandLogo && !logoPresets.some(p => p.svg === brandLogo) && (
                      <div className="mt-2 flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <div className="flex items-center space-x-2">
                          <img src={brandLogo} className="h-6 w-6 object-contain rounded" alt="Logo subido" referrerPolicy="no-referrer" />
                          <span className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">Logotipo subido</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setBrandLogo(null)}
                          className="text-[9px] font-bold text-rose-600 hover:underline"
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Format Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Color Temático Principal (Formato)
                  </label>
                  <div className="flex space-x-3.5 pt-1">
                    {(Object.keys(colorThemes) as Array<keyof typeof colorThemes>).map((cKey) => {
                      const colorDetails = colorThemes[cKey];
                      const bgClass = cKey === 'indigo' ? 'bg-indigo-600' :
                                      cKey === 'emerald' ? 'bg-emerald-600' :
                                      cKey === 'crimson' ? 'bg-rose-600' :
                                      cKey === 'amber' ? 'bg-amber-600' : 'bg-slate-800';
                      return (
                        <button
                          key={cKey}
                          type="button"
                          onClick={() => setBrandColor(cKey)}
                          className={`h-7 w-7 rounded-full ${bgClass} cursor-pointer transition-transform duration-200 hover:scale-110 flex items-center justify-center relative ${
                            brandColor === cKey ? 'ring-4 ring-offset-2 ring-slate-400 scale-105' : ''
                          }`}
                          title={`Color ${cKey}`}
                        >
                          {brandColor === cKey && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Typography Font Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Tipografía de Lectura
                  </label>
                  <select
                    value={brandFont}
                    onChange={(e) => setBrandFont(e.target.value as 'sans' | 'serif' | 'mono' | 'grotesk')}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 bg-slate-950/50 font-medium"
                  >
                    <option value="sans">Jakarta Sans (Limpia / Moderna)</option>
                    <option value="serif">Playfair Serif (Formato Académico / Tradicional)</option>
                    <option value="grotesk">Space Grotesk (Foco Tecnológico)</option>
                    <option value="mono">JetBrains Mono (Ficha Técnica / Código)</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-4 border-t border-slate-800/50">
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    className="flex-1 py-3 bg-slate-800/50 hover:bg-slate-200 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={startCompileAndPreview}
                    className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer text-center flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="h-4 w-4 text-white" />
                    <span>Compilar y Generar Previsualizaciones</span>
                  </button>
                </div>

              </div>
            )}

            {/* Step 2: Compiling State with Progress Bar */}
            {exportModalStep === 'compiling' && (
              <div className="flex flex-col items-center justify-center py-10 px-4 space-y-6 text-center animate-in fade-in duration-200">
                <div className="relative flex items-center justify-center">
                  <div className="absolute h-20 w-20 rounded-full border-4 border-rose-100/40 animate-ping"></div>
                  <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin flex items-center justify-center">
                    <Printer className="h-6 w-6 text-indigo-600 animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-200">Procesando y compilando PDF...</h4>
                  <p className="text-xs text-indigo-600 font-semibold font-mono h-4">{compileStep}</p>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full max-w-xs bg-slate-800/50 h-2.5 rounded-full overflow-hidden border border-slate-800/50 relative shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-rose-600 h-full rounded-full transition-all duration-150 ease-out"
                    style={{ width: `${compileProgress}%` }}
                  ></div>
                </div>

                <span className="text-xs font-black text-slate-300 font-mono bg-slate-800/50 px-3 py-1 rounded-full">{compileProgress}%</span>
              </div>
            )}

            {/* Step 3: Comparison View between Option A and Option B */}
            {exportModalStep === 'preview' && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Option A Card (Classic) */}
                  <div 
                    onClick={() => setTempBrandStyle('classic')}
                    className={`border-2 rounded-2xl p-5 cursor-pointer transition-all relative flex flex-col justify-between h-[360px] bg-slate-900/60 backdrop-blur-xl border border-white/5 group hover:shadow-lg ${
                      tempBrandStyle === 'classic' 
                        ? 'border-indigo-600 ring-4 ring-indigo-50 shadow-md' 
                        : 'border-slate-800/80 hover:border-slate-300'
                    }`}
                  >
                    {/* Selected Indicator Badge */}
                    {tempBrandStyle === 'classic' && (
                      <span className="absolute top-3 right-3 bg-indigo-600 text-white p-1 rounded-full text-xs shadow">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}

                    <div>
                      {/* Badge Name */}
                      <span className="text-[9px] font-extrabold tracking-wider bg-slate-800/50 text-slate-300 px-2 py-1 rounded-full uppercase block w-max mb-3">
                        Opción A: Clásico Escolar
                      </span>

                      {/* Mini Simulation of A4 sheet */}
                      <div className="bg-slate-950 border border-slate-800/50 rounded-lg p-4 text-center space-y-2 h-[200px] overflow-y-auto select-none pointer-events-none text-[8px] font-serif leading-tight">
                        {brandLogo && (
                          <div className="flex justify-center mb-1">
                            <img src={brandLogo} className="h-5 w-5 object-contain" alt="mini-logo" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <div className="text-[6px] tracking-widest text-slate-400 uppercase font-bold">{brandAuthors || "INSTITUCIÓN EDUCATIVA"} {brandTeacher && `• ${brandTeacher.toUpperCase()}`}</div>
                        <div className="font-bold text-[10px] text-slate-200 uppercase border-b border-slate-300 pb-1.5">{brandHeader || "GUÍA DE APRENDIZAJE"}</div>
                        
                        <div className="text-left text-slate-500 space-y-1.5 pt-1.5 text-[7px] font-serif">
                          <p className="font-bold text-slate-300">1. Resumen de Contenidos</p>
                          <p>Material educativo adaptado con formatos tradicionales y espaciados ideales para distribución impresa a alumnos...</p>
                          <p className="font-bold text-slate-300">2. Metodología de Estudio</p>
                          <p>Se recomienda la lectura comprensiva e individual del recurso para fijar conceptos claves.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/50 text-center">
                      <p className="text-[11px] font-bold text-slate-300 group-hover:text-indigo-600">Diseño Académico Tradicional</p>
                      <p className="text-[9px] text-slate-400">Centrado, sobrio y optimizado para fotocopias.</p>
                    </div>
                  </div>

                  {/* Option B Card (Modern) */}
                  <div 
                    onClick={() => setTempBrandStyle('modern')}
                    className={`border-2 rounded-2xl p-5 cursor-pointer transition-all relative flex flex-col justify-between h-[360px] bg-slate-900/60 backdrop-blur-xl border border-white/5 group hover:shadow-lg ${
                      tempBrandStyle === 'modern' 
                        ? 'border-indigo-600 ring-4 ring-indigo-50 shadow-md' 
                        : 'border-slate-800/80 hover:border-slate-300'
                    }`}
                  >
                    {/* Selected Indicator Badge */}
                    {tempBrandStyle === 'modern' && (
                      <span className="absolute top-3 right-3 bg-indigo-600 text-white p-1 rounded-full text-xs shadow">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}

                    <div>
                      {/* Badge Name */}
                      <span className="text-[9px] font-extrabold tracking-wider bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full uppercase block w-max mb-3">
                        Opción B: Moderno Vanguardista
                      </span>

                      {/* Mini Simulation of A4 sheet */}
                      <div className="bg-slate-950 border border-slate-800/50 rounded-lg p-4 space-y-2 h-[200px] overflow-y-auto select-none pointer-events-none text-[8px] font-sans leading-tight">
                        <div className={`flex items-start justify-between pb-1 border-b-2 ${
                          brandColor === 'indigo' ? 'border-indigo-600' :
                          brandColor === 'emerald' ? 'border-emerald-600' :
                          brandColor === 'crimson' ? 'border-rose-600' :
                          brandColor === 'amber' ? 'border-amber-600' : 'border-slate-800'
                        }`}>
                          <div>
                            <span className={`text-[5px] font-bold px-1.5 py-0.5 rounded-full ${
                              brandColor === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                              brandColor === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                              brandColor === 'crimson' ? 'bg-rose-50 text-rose-600' :
                              brandColor === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-slate-800/50 text-slate-200'
                            }`}>GUÍA DE APRENDIZAJE</span>
                            <div className="font-extrabold text-[9px] text-slate-200 uppercase mt-0.5">{brandHeader || "GUÍA DE APRENDIZAJE"}</div>
                          </div>
                          {brandLogo && <img src={brandLogo} className="h-4 w-4 object-contain" alt="mini-logo" referrerPolicy="no-referrer" />}
                        </div>
                        
                        <div className="text-[6px] text-slate-400 font-mono">Institución: {brandAuthors || "Colegio o Institución Educativa"} | Docente: {brandTeacher || "Profesor Titular"}</div>

                        <div className="text-left text-slate-500 space-y-1.5 pt-1 text-[7px] font-sans">
                          <p className={`font-bold ${
                            brandColor === 'indigo' ? 'text-indigo-600' :
                            brandColor === 'emerald' ? 'text-emerald-600' :
                            brandColor === 'crimson' ? 'text-rose-600' :
                            brandColor === 'amber' ? 'text-amber-600' : 'text-slate-200'
                          }`}>1. Introducción al Tema</p>
                          <p>Contenido estructurado en base a formatos modernos, ideales para lectura digital o impresión de alta resolución...</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/50 text-center">
                      <p className="text-[11px] font-bold text-slate-300 group-hover:text-indigo-600">Diseño Corporativo & Moderno</p>
                      <p className="text-[9px] text-slate-400">Encabezados asimétricos con acentos de color elegidos.</p>
                    </div>
                  </div>

                </div>

                {/* Print Guide / Iframe Notice Info Box */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-slate-600 text-[11px] space-y-1 leading-relaxed">
                  <p className="font-bold text-slate-200 flex items-center space-x-1">
                    <span>💡 Consejo de Impresión y Descarga:</span>
                  </p>
                  <p>
                    Para un PDF perfecto, recordá activar la opción <strong className="text-slate-100">"Gráficos de fondo"</strong> (Background graphics) en la configuración de impresión de tu navegador. Si el diálogo no aparece, podés usar el botón "Imprimir" directamente de la barra de herramientas principal.
                  </p>
                </div>

                {/* Footer buttons for step 3 */}
                <div className="flex items-center space-x-3 pt-4 border-t border-slate-800/50">
                  <button
                    type="button"
                    onClick={() => setExportModalStep('customize')}
                    className="flex-1 py-3 bg-slate-800/50 hover:bg-slate-200 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                  >
                    ← Volver a Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Apply chosen style
                      setBrandStyle(tempBrandStyle);
                      setShowExportModal(false);
                      // Wait briefly for DOM to update with chosen style and trigger download
                      setTimeout(() => {
                        downloadAsPDF();
                      }, 250);
                    }}
                    className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer text-center flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4 text-white" />
                    <span>Confirmar y Descargar PDF</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />

      <footer className="w-full text-center py-8 text-slate-400 text-xs border-t border-slate-800/50">
        <p>© {new Date().getFullYear()} RAICEP. Derechos reservados.</p>
        <p>Registro Argentino de Institución y Homologación de Estudios Profesionales</p>
      </footer>
    </div>
  );
}
