import React, { useState, useEffect } from "react";
import { 
  Sparkles, ClipboardList, HelpCircle, AlertCircle, 
  Settings, CheckSquare, RefreshCw, Trash2, PlayCircle, Clock,
  Share2, Download, Upload, Copy, Check, FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Exam, QuestionType } from "./types";
import { createExamOffline } from "./OracleAI";
import { useLanguage } from "../../contexts/LanguageContext";

const EXAM_LOADING_QUOTES = {
  es: [
    "«El genio se hace con un 1% de talento y un 99% de trabajo.» — Albert Einstein",
    "«La perseverancia es el trabajo duro que haces después de cansarte del trabajo duro que ya hiciste.» — Newt Gingrich",
    "«Estudiando patrones y construyendo preguntas de alto nivel cognitivo...»",
    "«Generando distractores realistas y explicaciones formativas profundas...»",
    "«Diseñando estudios de caso realistas para evaluar la transferencia de conocimiento...»"
  ],
  en: [
    "\"Genius is 1% talent and 99% hard work.\" — Albert Einstein",
    "\"Perseverance is the hard work you do after you get tired of the hard work you already did.\" — Newt Gingrich",
    "\"Studying patterns and building high-level cognitive questions...\"",
    "\"Generating realistic distractors and deep formative explanations...\"",
    "\"Designing realistic case studies to evaluate knowledge transfer...\""
  ]
};

const T = {
  es: {
    setupTitle: "Parámetros del Examen",
    sourceTextLabel: "Material de Estudio o Tema Base",
    sourceTextDesc: "Pega un fragmento de lectura, introduce apuntes de clase, o simplemente escribe el tema que quieres evaluar (ej. \"Revolución Industrial\" o \"Programación Funcional\").",
    sourceTextPlaceholder: "Escribe el tema o pega el texto formativo aquí...",
    difficultyLabel: "Dificultad",
    difficultyEasy: "Fácil (Formativo)",
    difficultyMedium: "Medio (Normal)",
    difficultyHard: "Difícil (Análisis)",
    difficultyMix: "Mixto (Progresivo)",
    questionsCountLabel: "Cant. Preguntas",
    questionsCount3: "3 Preguntas (Rápido)",
    questionsCount5: "5 Preguntas (Estándar)",
    questionsCount8: "8 Preguntas (Completo)",
    questionsCount12: "12 Preguntas (Exhaustivo)",
    variantsLabel: "Variantes de Pregunta Permitidas",
    customInstructionsLabel: "Instrucciones Especiales para Gemini",
    customInstructionsOptional: "Opcional",
    customInstructionsPlaceholder: "Indica a la IA cómo estructurar las preguntas, enfoque didáctico, estilo, temas prioritarios, o pide que use un formato específico (ej. 'haz que las preguntas sean bilingües' o 'concéntrate en casos prácticos').",
    generateBtn: "Generar Examen",
    generatingBtn: "Generando con Gemini...",
    savedExamsHeader: "Exámenes Disponibles",
    importBtn: "Importar Examen",
    closeImportBtn: "Cerrar Importador",
    importLabel: "Importar Examen (.json)",
    importPlaceholder: "Pega el código JSON del examen aquí...",
    importLoadBtn: "Cargar Código",
    importUploadBtn: "Subir Archivo .json",
    importUploadDesc: "Sube un examen exportado",
    emptyHistoryHeader: "Banco de Exámenes Vacío",
    emptyHistoryDesc: "Una vez que generes un examen con el formulario de la izquierda o desde el Conversor, aparecerá en esta lista listo para jugar o imprimir.",
    emptyHistoryImport: "Importar un Examen Externo",
    mcLabel: "Opción Múltiple",
    tfLabel: "Verdadero o Falso",
    fbLabel: "Completar Espacio",
    matchingLabel: "Emparejar Columnas",
    scenarioLabel: "Estudio de Caso",
    openEndedLabel: "Desarrollo (AI Graded)",
    errorTextEmpty: "Por favor provee un texto base, tema o material de estudio para poder elaborar las preguntas.",
    errorAIInvalid: "El servicio de IA no devolvió preguntas válidas. Intenta cambiar el texto base o simplificar las instrucciones.",
    examDefaultTitle: "Examen de Evaluación Interactiva",
    examDefaultDesc: "Un examen educativo riguroso y dinámico hecho con IA.",
    shareBtn: "Compartir",
    deleteBtn: "Eliminar",
    runBtn: "Rendir Examen",
    shareDrawerTitle: "Enlace Interactivo de Evaluación",
    shareDrawerDesc: "Los alumnos rinden el examen directamente",
    shareDrawerHelp: "Este enlace inteligente codifica la evaluación completa. Al hacer clic, los alumnos ingresan directamente a una Evaluación Activa dedicada, pudiendo calificar preguntas de desarrollo con IA sin requerir registro de profesor.",
    downloadBtn: "Descargar (.json)",
    copyCodeBtn: "Copiar Código",
    copiedCodeBtn: "Código Copiado",
    copiedLinkBtn: "Copiado",
    copyLinkBtn: "Copiar Enlace",
    formatFormat: "Formato Educraft",
    pedagogicTipTitle: "Tip Pedagógico:",
    pedagogicTipDesc: "Los exámenes admiten 3 modos de presentación interactiva (Modo Práctica didáctico con retroalimentación, Modo Real contra reloj, y Modo Desafío gamificado con vidas y multiplicadores de puntaje). Selecciónalo al iniciar la evaluación.",
    questionsCount: "Preguntas:",
    createdAtLabel: "Creado:",
    importErrorEmpty: "El código o texto JSON está vacío.",
    importErrorInvalid: "El formato del examen es inválido. Debe contener 'title' y una lista de 'questions'.",
    importSuccessMsg: "¡Examen importado con éxito! Cargado en la biblioteca."
  },
  en: {
    setupTitle: "Exam Parameters",
    sourceTextLabel: "Study Material or Base Topic",
    sourceTextDesc: "Paste a reading excerpt, class notes, or simply enter the topic you want to evaluate (e.g., \"Industrial Revolution\" or \"Functional Programming\").",
    sourceTextPlaceholder: "Write the topic or paste the educational text here...",
    difficultyLabel: "Difficulty",
    difficultyEasy: "Easy (Formative)",
    difficultyMedium: "Medium (Normal)",
    difficultyHard: "Hard (Analysis)",
    difficultyMix: "Mixed (Progressive)",
    questionsCountLabel: "Questions Count",
    questionsCount3: "3 Questions (Quick)",
    questionsCount5: "5 Questions (Standard)",
    questionsCount8: "8 Questions (Full)",
    questionsCount12: "12 Questions (Exhaustive)",
    variantsLabel: "Allowed Question Variants",
    customInstructionsLabel: "Special Instructions for Gemini",
    customInstructionsOptional: "Optional",
    customInstructionsPlaceholder: "Direct the AI on how to structure the questions, educational approach, style, priority topics, or request specific formats (e.g., 'make questions bilingual' or 'focus on practical cases').",
    generateBtn: "Generate Exam",
    generatingBtn: "Generating with Gemini...",
    savedExamsHeader: "Available Exams",
    importBtn: "Import Exam",
    closeImportBtn: "Close Importer",
    importLabel: "Import Exam (.json)",
    importPlaceholder: "Paste the exam JSON code here...",
    importLoadBtn: "Load Code",
    importUploadBtn: "Upload .json File",
    importUploadDesc: "Upload an exported exam",
    emptyHistoryHeader: "Empty Exam Bank",
    emptyHistoryDesc: "Once you generate an exam using the form on the left or from the Converter, it will appear in this list ready to play or print.",
    emptyHistoryImport: "Import an External Exam",
    mcLabel: "Multiple Choice",
    tfLabel: "True or False",
    fbLabel: "Fill in Blanks",
    matchingLabel: "Match Columns",
    scenarioLabel: "Case Study",
    openEndedLabel: "Essay (AI Graded)",
    errorTextEmpty: "Please provide a base text, topic, or study material to draft the questions.",
    errorAIInvalid: "The AI service did not return valid questions. Try changing the base text or simplifying the instructions.",
    examDefaultTitle: "Interactive Evaluation Exam",
    examDefaultDesc: "A rigorous and dynamic educational exam generated with AI.",
    shareBtn: "Share",
    deleteBtn: "Delete",
    runBtn: "Take Exam",
    shareDrawerTitle: "Interactive Evaluation Link",
    shareDrawerDesc: "Students take the exam directly",
    shareDrawerHelp: "This smart link encodes the full evaluation. By clicking it, students access a dedicated Active Evaluation portal, allowing them to grade essay questions with AI without requiring teacher registration.",
    downloadBtn: "Download (.json)",
    copyCodeBtn: "Copy Code",
    copiedCodeBtn: "Code Copied",
    copiedLinkBtn: "Copied",
    copyLinkBtn: "Copy Link",
    formatFormat: "Educraft Format",
    pedagogicTipTitle: "Pedagogic Tip:",
    pedagogicTipDesc: "Exams support 3 interactive modes (Practice Mode with formative feedback, Real Mode against the clock, and Gamified Challenge Mode with lives and score multipliers). Select it when starting the evaluation.",
    questionsCount: "Questions:",
    createdAtLabel: "Created:",
    importErrorEmpty: "The JSON code or text is empty.",
    importErrorInvalid: "Invalid exam format. It must contain 'title' and a list of 'questions'.",
    importSuccessMsg: "Exam successfully imported! Loaded into the library."
  }
};

interface ExamCreatorProps {
  onSaveExam: (exam: Exam) => void;
  savedExams: Exam[];
  onDeleteExam: (id: string) => void;
  onSelectExamToRun: (exam: Exam) => void;
  prefillSourceText: string;
  prefillTitle: string;
  onClearPrefill: () => void;
}

export default function ExamCreator({
  onSaveExam,
  savedExams,
  onDeleteExam,
  onSelectExamToRun,
  prefillSourceText,
  prefillTitle,
  onClearPrefill
}: ExamCreatorProps) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const t = T[lang || 'es'];

  const [sourceText, setSourceText] = useState("");
  const [difficulty, setDifficulty] = useState<"Fácil" | "Medio" | "Difícil" | "Mixto">("Medio");
  const [numQuestions, setNumQuestions] = useState(5);
  const [customInstructions, setCustomInstructions] = useState("");
  
  // Question types selected
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([
    "multiple_choice", "true_false", "fill_blanks"
  ]);

  const [loading, setLoading] = useState(false);
  const [loadingQuoteIdx, setLoadingQuoteIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // States for sharing & importing
  const [sharingExamId, setSharingExamId] = useState<string | null>(null);
  const [copiedExamId, setCopiedExamId] = useState<string | null>(null);
  const [copiedLinkExamId, setCopiedLinkExamId] = useState<string | null>(null);
  
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  // Sync pre-fill values from content converter
  useEffect(() => {
    if (prefillSourceText) {
      setSourceText(prefillSourceText);
    }
  }, [prefillSourceText]);

  // Loading quote carousel effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const quotes = EXAM_LOADING_QUOTES[lang || 'es'];
    if (loading) {
      interval = setInterval(() => {
        setLoadingQuoteIdx((prev) => (prev + 1) % quotes.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [loading, lang]);

  const toggleQuestionType = (type: QuestionType) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((t) => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sourceText.trim()) {
      setError(t.errorTextEmpty);
      return;
    }

    setLoading(true);
    setLoadingQuoteIdx(0);

    try {
      const data = await createExamOffline(
        sourceText,
        difficulty,
        numQuestions,
        selectedTypes,
        customInstructions,
        lang || 'es'
      );
      
      if (!data || !data.questions || data.questions.length === 0) {
        throw new Error(t.errorAIInvalid);
      }

      const generatedExam: Exam = {
        id: "e_" + Date.now(),
        title: data.title || prefillTitle || t.examDefaultTitle,
        description: data.description || t.examDefaultDesc,
        timeLimit: data.timeLimit || 15,
        difficulty: data.difficulty || difficulty,
        questions: data.questions || [],
        createdAt: new Date().toLocaleDateString(isEn ? "en-US" : "es-ES", {
          day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
        })
      };

      onSaveExam(generatedExam);
      onSelectExamToRun(generatedExam); // Automatically load into runner!
      onClearPrefill(); // Clear prefill states

    } catch (err: any) {
      setError(err.message || (isEn ? "Error connecting to exam generation service." : "Error al conectar con el servicio de generación de exámenes."));
    } finally {
      setLoading(false);
    }
  };

  const generateShareUrl = (exam: Exam) => {
    try {
      const jsonStr = JSON.stringify(exam);
      const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
      return `${window.location.origin}${window.location.pathname}?examData=${base64}`;
    } catch (err) {
      console.error(err);
      return "";
    }
  };

  const handleCopyShareUrl = (exam: Exam) => {
    const url = generateShareUrl(exam);
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLinkExamId(exam.id);
      setTimeout(() => setCopiedLinkExamId(null), 2000);
    }).catch(err => {
      console.error("Could not copy link", err);
    });
  };

  const handleCopyJson = (exam: Exam) => {
    const jsonStr = JSON.stringify(exam, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopiedExamId(exam.id);
      setTimeout(() => setCopiedExamId(null), 2000);
    }).catch(err => {
      console.error("Could not copy JSON", err);
    });
  };

  const handleDownloadExam = (exam: Exam) => {
    const jsonStr = JSON.stringify(exam, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${exam.title.replace(/\s+/g, "_")}_examen.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJson = (text: string) => {
    setImportError(null);
    setImportSuccess(false);
    if (!text.trim()) {
      setImportError(t.importErrorEmpty);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      if (!parsed.title || !parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error(t.importErrorInvalid);
      }

      const imported: Exam = {
        id: "e_" + Date.now(),
        title: parsed.title,
        description: parsed.description || "Imported Exam.",
        timeLimit: Number(parsed.timeLimit) || 15,
        difficulty: parsed.difficulty || "Medio",
        questions: parsed.questions,
        createdAt: new Date().toLocaleDateString(isEn ? "en-US" : "es-ES", {
          day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
        })
      };

      onSaveExam(imported);
      setImportJsonText("");
      setImportSuccess(true);
      setTimeout(() => {
        setIsImportOpen(false);
        setImportSuccess(false);
      }, 1500);
    } catch (err: any) {
      setImportError(err.message || (isEn ? "Error decoding JSON format." : "Error al decodificar el formato JSON."));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        handleImportJson(result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="exam_creator_container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
      {/* LEFT COLUMN: Setup Configuration Form */}
      <div id="exam_creator_setup_card" className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-800">{t.setupTitle}</h2>
        </div>
        
        <form onSubmit={handleCreateExam} className="space-y-5">
          {/* Base Material Input */}
          <div className="space-y-1 text-left">
            <label htmlFor="sourceText" className="text-xs font-bold text-slate-500 uppercase">
              {t.sourceTextLabel}
            </label>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-1">
              {t.sourceTextDesc}
            </p>
            <textarea
              id="sourceText"
              rows={6}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder={t.sourceTextPlaceholder}
              className="w-full text-xs p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100/40 transition-all text-slate-800 placeholder-slate-400 resize-y leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Difficulty selection */}
            <div className="space-y-1 text-left">
              <label htmlFor="difficulty" className="text-xs font-bold text-slate-500 uppercase">
                {t.difficultyLabel}
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e: any) => setDifficulty(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700 font-medium"
              >
                <option value="Fácil">{t.difficultyEasy}</option>
                <option value="Medio">{t.difficultyMedium}</option>
                <option value="Difícil">{t.difficultyHard}</option>
                <option value="Mixto">{t.difficultyMix}</option>
              </select>
            </div>

            {/* Questions count */}
            <div className="space-y-1 text-left">
              <label htmlFor="numQuestions" className="text-xs font-bold text-slate-500 uppercase">
                {t.questionsCountLabel}
              </label>
              <select
                id="numQuestions"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700 font-medium"
              >
                <option value="3">{t.questionsCount3}</option>
                <option value="5">{t.questionsCount5}</option>
                <option value="8">{t.questionsCount8}</option>
                <option value="12">{t.questionsCount12}</option>
              </select>
            </div>
          </div>

          {/* Question types checklist */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase block">
              {t.variantsLabel}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: "multiple_choice", label: t.mcLabel },
                { type: "true_false", label: t.tfLabel },
                { type: "fill_blanks", label: t.fbLabel },
                { type: "matching", label: t.matchingLabel },
                { type: "scenario", label: t.scenarioLabel },
                { type: "open_ended", label: t.openEndedLabel },
              ].map((item) => {
                const isSelected = selectedTypes.includes(item.type as QuestionType);
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => toggleQuestionType(item.type as QuestionType)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer text-left ${
                      isSelected
                        ? "bg-indigo-555 border-indigo-200 text-indigo-700 font-bold shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                      isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white"
                    }`}>
                      {isSelected && <CheckSquare className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced Custom Instructions */}
          <div className="space-y-2 text-left">
            <label htmlFor="customInstructions" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
              <span>{t.customInstructionsLabel}</span>
              <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full uppercase">{t.customInstructionsOptional}</span>
            </label>
            <textarea
              id="customInstructions"
              rows={3}
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder={t.customInstructionsPlaceholder}
              className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100/40 transition-all text-slate-800 placeholder-slate-400 resize-none leading-relaxed"
            />
            
            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: isEn ? "💼 Case studies" : "💼 Casos de negocio", text: isEn ? "Focus on practical business case studies and decision-making." : "Enfócate en casos prácticos de negocio y toma de decisiones." },
                { label: isEn ? "🗣️ Bilingual ES/EN" : "🗣️ Bilingüe ES/EN", text: isEn ? "Write the questions and options in bilingual format (Spanish and English)." : "Escribe las preguntas y opciones en formato bilingüe (Español e Inglés)." },
                { label: isEn ? "🧮 Calculations" : "🧮 Fórmulas y cálculos", text: isEn ? "Prioritize questions that require mathematical logic, formulas, or calculations." : "Prioriza preguntas que requieran fórmulas matemáticas, lógicas o cálculos." },
                { label: isEn ? "🧠 Core concepts" : "🧠 Conceptos clave", text: isEn ? "Focus exclusively on deep theoretical understanding and essential concepts." : "Focalízate exclusivamente en la comprensión teórica profunda y conceptos esenciales." },
                { label: isEn ? "🎭 Fun distractors" : "🎭 Distractores lúdicos", text: isEn ? "Include a touch of subtle humor in the incorrect options to make it fun." : "Incluye un toque de humor sutil en los distractores incorrectos para hacerlo de forma lúdica." }
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    if (customInstructions.includes(chip.text)) {
                      setCustomInstructions(customInstructions.replace(chip.text, "").trim());
                    } else {
                      setCustomInstructions((prev) => (prev ? `${prev} ${chip.text}` : chip.text));
                    }
                  }}
                  className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    customInstructions.includes(chip.text)
                      ? "bg-indigo-100 border-indigo-300 text-indigo-700 font-semibold"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-xl border border-red-150 flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
              loading 
                ? "bg-indigo-550 text-indigo-300 cursor-not-allowed shadow-inner" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-150 active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.generatingBtn}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{t.generateBtn}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: Saved Exams & History */}
      <div id="exam_creator_history_card" className="lg:col-span-7 bg-slate-50 border border-slate-200/60 rounded-3xl p-6 min-h-[500px] flex flex-col justify-between">
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-200">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <ClipboardList className="w-6 h-6 text-indigo-500 absolute top-5 left-5 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {isEn ? "Designing Exam with AI" : "Diseñando Examen con IA"}
            </h3>
            <div className="max-w-md bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <p className="text-sm italic text-slate-600">
                {EXAM_LOADING_QUOTES[lang || 'es'][loadingQuoteIdx]}
              </p>
            </div>
          </div>
        ) : savedExams.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-left">
            <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-3xl flex items-center justify-center text-slate-400 mb-4 shadow-inner">
              <ClipboardList className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{t.emptyHistoryHeader}</h3>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed text-center">
              {t.emptyHistoryDesc}
            </p>
            
            <div className="mt-6 pt-4 border-t border-slate-200 w-full max-w-xs flex justify-center">
              <button
                type="button"
                onClick={() => setIsImportOpen(!isImportOpen)}
                className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-indigo-700 text-xs font-bold py-2.5 px-4 rounded-xl border border-indigo-200 shadow-sm transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{isImportOpen ? t.closeImportBtn : t.emptyHistoryImport}</span>
              </button>
            </div>

            {/* Inline Import Panel for empty state */}
            <AnimatePresence>
              {isImportOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-white border border-slate-200 rounded-2xl p-4 mt-4 w-full max-w-md space-y-3 shadow-sm text-left"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5 text-indigo-500" /> {t.importLabel}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <textarea
                        rows={3}
                        placeholder={t.importPlaceholder}
                        value={importJsonText}
                        onChange={(e) => setImportJsonText(e.target.value)}
                        className="w-full text-[10px] font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-indigo-500 resize-none leading-relaxed"
                      />
                      <button
                        type="button"
                        onClick={() => handleImportJson(importJsonText)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        {t.importLoadBtn}
                      </button>
                    </div>

                    <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer relative bg-slate-50/50 hover:bg-indigo-50/10 transition-all">
                      <span className="text-[10px] font-bold text-slate-600">{t.importUploadBtn}</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  </div>

                  {importError && (
                    <div className="bg-red-50 text-red-700 text-[10px] p-2.5 rounded-lg border border-red-150 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{importError}</span>
                    </div>
                  )}

                  {importSuccess && (
                    <div className="bg-green-50 text-green-700 text-[10px] p-2.5 rounded-lg border border-green-150 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>{t.importSuccessMsg}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between h-full text-left">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 flex-wrap gap-2">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  {t.savedExamsHeader} ({savedExams.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setIsImportOpen(!isImportOpen)}
                  className="flex items-center gap-1 bg-white hover:bg-slate-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-200 shadow-sm transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isImportOpen ? t.closeImportBtn : t.importBtn}</span>
                </button>
              </div>

              {/* Import Panel */}
              <AnimatePresence>
                {isImportOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-white border border-slate-200 rounded-2xl p-4 mb-4 space-y-3 shadow-inner text-left"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5 text-indigo-500" /> {t.importLabel}
                      </h4>
                      <span className="text-[9px] text-slate-400 font-mono">{t.formatFormat}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <textarea
                          rows={3}
                          placeholder={t.importPlaceholder}
                          value={importJsonText}
                          onChange={(e) => setImportJsonText(e.target.value)}
                          className="w-full text-[10px] font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-indigo-500 resize-none leading-relaxed"
                        />
                        <button
                          type="button"
                          onClick={() => handleImportJson(importJsonText)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          {t.importLoadBtn}
                        </button>
                      </div>

                      <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer relative bg-slate-50/50 hover:bg-indigo-50/10 transition-all">
                        <FileText className="w-7 h-7 text-slate-400 mb-1" />
                        <span className="text-[10px] font-bold text-slate-600">{t.importUploadBtn}</span>
                        <span className="text-[8px] text-slate-400 mt-0.5">{t.importUploadDesc}</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                    </div>

                    {importError && (
                      <div className="bg-red-50 text-red-700 text-[10px] p-2.5 rounded-lg border border-red-150 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{importError}</span>
                      </div>
                    )}

                    {importSuccess && (
                      <div className="bg-green-50 text-green-700 text-[10px] p-2.5 rounded-lg border border-green-150 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>{t.importSuccessMsg}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
 
              <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-1">
                {savedExams.map((exam) => (
                  <div 
                    key={exam.id}
                    className="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col"
                  >
                    <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[9px] font-mono font-bold uppercase bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                            {t.difficultyLabel}: {exam.difficulty}
                          </span>
                          <span className="text-[9px] font-mono font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {exam.timeLimit} min
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-800 truncate mb-1">{exam.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-1.5">{exam.description}</p>
                        <span className="text-[10px] text-slate-400 font-mono block">{t.questionsCount} {exam.questions.length} | {t.createdAtLabel} {exam.createdAt}</span>
                      </div>
  
                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => onSelectExamToRun(exam)}
                          className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>{t.runBtn}</span>
                        </button>
  
                        <div className="flex gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => setSharingExamId(sharingExamId === exam.id ? null : exam.id)}
                            className={`flex-1 p-2 border rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${
                              sharingExamId === exam.id
                                ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm animate-in fade-in duration-200"
                                : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            }`}
                            title={isEn ? "Share exam with students" : "Compartir examen con alumnos"}
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>{t.shareBtn}</span>
                          </button>
 
                          <button
                            type="button"
                            onClick={() => onDeleteExam(exam.id)}
                            className="p-2 border border-slate-200 hover:bg-red-50 hover:text-red-600 rounded-xl text-slate-400 transition-colors cursor-pointer flex items-center justify-center"
                            title={isEn ? "Delete exam" : "Eliminar examen"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
 
                    {/* Sharing drawer dropdown inside card */}
                    <AnimatePresence>
                      {sharingExamId === exam.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-indigo-50/40 border-t border-indigo-100/60 px-5 py-4 space-y-3 text-left overflow-hidden"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                              <Share2 className="w-3.5 h-3.5" /> {t.shareDrawerTitle}
                            </span>
                            <span className="text-[9px] text-slate-400">{t.shareDrawerDesc}</span>
                          </div>
 
                          <div className="space-y-1.5">
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                readOnly
                                value={generateShareUrl(exam)}
                                className="flex-1 text-[10px] bg-white border border-indigo-200 rounded-lg p-2 text-slate-600 font-mono outline-none select-all"
                              />
                              <button
                                type="button"
                                onClick={() => handleCopyShareUrl(exam)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-3.5 rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                              >
                                {copiedLinkExamId === exam.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{t.copiedLinkBtn}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>{t.copyLinkBtn}</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-[9px] text-slate-400/90 leading-relaxed italic">
                              {t.shareDrawerHelp}
                            </p>
                          </div>
 
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleDownloadExam(exam)}
                              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[10px] py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-500" />
                              <span>{t.downloadBtn}</span>
                            </button>
 
                            <button
                              type="button"
                              onClick={() => handleCopyJson(exam)}
                              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[10px] py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              {copiedExamId === exam.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-green-600" />
                                  <span>{t.copiedCodeBtn}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{t.copyCodeBtn}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
 
            <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200/60 mt-6 flex items-start gap-3 text-left">
              <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-500 leading-relaxed">
                <b>{t.pedagogicTipTitle}</b> {t.pedagogicTipDesc}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
