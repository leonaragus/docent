import React, { useState, useEffect } from "react";
import { 
  Sparkles, GraduationCap, ClipboardList, BookOpen, 
  Database, Zap, Trophy, WifiOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../../contexts/LanguageContext";
import ContentConverter from "./ContentConverter";
import ExamCreator from "./ExamCreator";
import ExamRunner from "./ExamRunner";
import { ConvertedContent, Exam } from "./types";

interface DocentOracleProps {
  prefillTranscript?: string;
  onClearPrefill?: () => void;
}

export default function DocentOracle({ prefillTranscript, onClearPrefill }: DocentOracleProps) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState<"converter" | "creator" | "runner">(
    prefillTranscript ? "creator" : "converter"
  );
  
  const [savedContents, setSavedContents] = useState<ConvertedContent[]>([]);
  const [savedExams, setSavedExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [prefillSourceText, setPrefillSourceText] = useState(prefillTranscript || "");
  const [prefillTitle, setPrefillTitle] = useState(prefillTranscript ? (isEn ? 'Evaluation from Recorded Class' : "Evaluación desde Clase Grabada") : "");
  const [isStudentView, setIsStudentView] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Check API Key from Nexus branding store
    try {
      const brandData = localStorage.getItem('docent_nexus_brand');
      if (brandData) {
        const parsed = JSON.parse(brandData);
        setHasApiKey(!!parsed.apiKey);
      }
    } catch (e) {}

    // Check for prefill from studio recording (Magnet→Oracle flow)
    const oraclePrefill = localStorage.getItem('docent_oracle_prefill');
    if (oraclePrefill && !prefillTranscript) {
      setPrefillSourceText(oraclePrefill);
      setPrefillTitle(isEn ? 'Evaluation from Recorded Class' : 'Evaluación desde Clase Grabada');
      setActiveTab('creator');
      localStorage.removeItem('docent_oracle_prefill');
    }

    // Load stored data
    try {
      const storedContents = localStorage.getItem("oracle_contents");
      if (storedContents) setSavedContents(JSON.parse(storedContents));
      
      const storedExams = localStorage.getItem("oracle_exams");
      if (storedExams) setSavedExams(JSON.parse(storedExams));
    } catch (e) {
      console.error(isEn ? 'Could not load data from localStorage' : "No se pudo cargar datos desde localStorage", e);
    }
  }, []);

  // When a prefill transcript comes in, auto-switch to creator tab
  useEffect(() => {
    if (prefillTranscript) {
      setPrefillSourceText(prefillTranscript);
      setPrefillTitle(isEn ? 'Evaluation from Recorded Class' : "Evaluación desde Clase Grabada");
      setActiveTab("creator");
    }
  }, [prefillTranscript]);

  const handleExitStudentView = () => {
    setIsStudentView(false);
    setSelectedExam(null);
    setActiveTab("creator");
  };

  const handleSaveContent = (content: ConvertedContent) => {
    const updated = [content, ...savedContents];
    setSavedContents(updated);
    localStorage.setItem("oracle_contents", JSON.stringify(updated));
  };

  const handleSaveExam = (exam: Exam) => {
    const updated = [exam, ...savedExams];
    setSavedExams(updated);
    localStorage.setItem("oracle_exams", JSON.stringify(updated));
    
    // Anexar automáticamente a la clase en el estudio principal
    const event = new CustomEvent("oracle_exam_created", { detail: exam });
    window.dispatchEvent(event);
  };

  const handleDeleteExam = (id: string) => {
    const updated = savedExams.filter((e) => e.id !== id);
    setSavedExams(updated);
    localStorage.setItem("oracle_exams", JSON.stringify(updated));
    if (selectedExam?.id === id) {
      setSelectedExam(null);
      setActiveTab("creator");
    }
  };

  const handleTriggerExamGeneration = (sourceText: string, title: string) => {
    setPrefillSourceText(sourceText);
    setPrefillTitle(title);
    setActiveTab("creator");
    if (onClearPrefill) onClearPrefill();
  };

  const handleSelectExamToRun = (exam: Exam) => {
    setSelectedExam(exam);
    setActiveTab("runner");
  };

  return (
    <div className="min-h-screen bg-[#0d0f1a] text-slate-100 font-sans antialiased">
      {/* Print CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .certificate-print-area, .certificate-print-area * { visibility: visible; }
          .certificate-print-area {
            position: absolute; left: 0; top: 0; width: 100%;
            border: none !important; box-shadow: none !important; background: white !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* SUITE HEADER */}
        {isStudentView ? (
          <header className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-indigo-950/60 backdrop-blur-xl text-white p-6 rounded-2xl shadow-xl border border-indigo-500/20 animate-fade-in text-left">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center shadow-inner border border-white/10">
                <GraduationCap className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">DOCENT SUITE</p>
                <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                  {isEn ? 'Evaluation Portal' : 'Portal de Evaluación'}{" "}
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase font-mono tracking-wider">
                    {isEn ? 'Student Mode' : 'Modo Alumno'}
                  </span>
                </h1>
                <p className="text-xs text-indigo-300 mt-0.5">
                  {isEn ? 'Active evaluation:' : 'Evaluación activa:'}{" "}
                  <span className="font-extrabold text-white">{selectedExam?.title}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleExitStudentView}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-5 rounded-xl border border-white/20 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {isEn ? 'Teacher Panel' : 'Panel del Profesor'}
            </button>
          </header>
        ) : (
          <header className="no-print flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.4)] border border-violet-500/30">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-0.5">DOCENT SUITE</p>
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-sky-300 tracking-tight">
                  DOCENT Oracle
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEn ? 'Smart Evaluation Engine · Multi-format Educational Converter · Auto Certification' : 'Motor de Evaluación Inteligente · Conversor Educativo Multiformato · Certificación Automática'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* API Key Status */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                hasApiKey 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                {hasApiKey ? (
                  <><Zap className="w-3.5 h-3.5" /><span>{isEn ? 'AI Ready' : 'IA Lista'}</span><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /></>
                ) : (
                  <><WifiOff className="w-3.5 h-3.5" /><span>{isEn ? 'No API Key' : 'Sin API Key'}</span></>
                )}
              </div>
              {/* Offline capable indicator */}
              <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-xl text-xs text-slate-400 font-medium">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>Offline Ready</span>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
              </div>
            </div>
          </header>
        )}

        {/* Prefill Banner from Magnet */}
        {prefillTranscript && activeTab === "creator" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="no-print mb-6 flex items-center gap-3 bg-indigo-900/40 border border-indigo-500/30 rounded-xl p-4 backdrop-blur-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-indigo-300">{isEn ? 'Transcript loaded from DOCENT Magnet' : 'Transcripción cargada desde DOCENT Magnet'}</p>
              <p className="text-xs text-slate-400">{isEn ? 'Your class text was pre-loaded. Configure options and generate evaluation automatically.' : 'El texto de tu clase fue pre-cargado. Configurá las opciones y generá la evaluación automáticamente.'}</p>
            </div>
          </motion.div>
        )}

        {/* TAB NAVIGATION */}
        {!isStudentView && (
          <nav className="no-print flex mb-8 bg-slate-900/60 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-700/50 max-w-lg">
            <button
              onClick={() => setActiveTab("converter")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "converter"
                  ? "bg-gradient-to-r from-sky-600/40 to-indigo-600/40 text-sky-300 shadow-sm border border-sky-500/30"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{isEn ? 'Converter' : 'Conversor'}</span>
            </button>

            <button
              onClick={() => setActiveTab("creator")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "creator"
                  ? "bg-gradient-to-r from-indigo-600/40 to-violet-600/40 text-indigo-300 shadow-sm border border-indigo-500/30"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>{isEn ? 'Exams' : 'Exámenes'}</span>
            </button>

            <button
              disabled={!selectedExam}
              onClick={() => { if (selectedExam) setActiveTab("runner"); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                !selectedExam
                  ? "opacity-30 cursor-not-allowed text-slate-600"
                  : activeTab === "runner"
                  ? "bg-gradient-to-r from-violet-600/40 to-purple-600/40 text-violet-300 shadow-sm border border-violet-500/30 cursor-pointer"
                  : "text-slate-500 hover:text-slate-300 cursor-pointer"
              }`}
              title={!selectedExam ? (isEn ? 'Generate or choose an exam first' : "Generá o elegí un examen primero") : ""}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isEn ? 'Active Evaluation' : 'Evaluación Activa'}</span>
            </button>
          </nav>
        )}

        {/* MAIN CONTENT */}
        <main>
          <AnimatePresence mode="wait">
            {activeTab === "converter" && (
              <motion.div
                key="converter"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <ContentConverter
                  onSaveContent={handleSaveContent}
                  savedContents={savedContents}
                  onTriggerExamGeneration={handleTriggerExamGeneration}
                />
              </motion.div>
            )}

            {activeTab === "creator" && (
              <motion.div
                key="creator"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <ExamCreator
                  onSaveExam={handleSaveExam}
                  savedExams={savedExams}
                  onDeleteExam={handleDeleteExam}
                  onSelectExamToRun={handleSelectExamToRun}
                  prefillSourceText={prefillSourceText}
                  prefillTitle={prefillTitle}
                  onClearPrefill={() => {
                    setPrefillSourceText("");
                    setPrefillTitle("");
                  }}
                />
              </motion.div>
            )}

            {activeTab === "runner" && selectedExam && (
              <motion.div
                key="runner"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <ExamRunner
                  exam={selectedExam}
                  onBackToCreator={() => {
                    if (isStudentView) {
                      handleExitStudentView();
                    } else {
                      setActiveTab("creator");
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Footer */}
      <footer className="no-print max-w-7xl mx-auto px-4 py-10 mt-12 border-t border-slate-800/50 text-center text-xs text-slate-600">
        <p>© {new Date().getFullYear()} {isEn ? 'DOCENT Oracle · DOCENT Suite · AI Evaluation Engine' : 'DOCENT Oracle · DOCENT Suite · Motor de Evaluación con IA'}</p>
        <p className="mt-1 font-mono text-[10px]">{isEn ? 'Works offline for evaluation · Requires connection for AI generation' : 'Funciona offline para evaluar · Requiere conexión para generar con IA'}</p>
      </footer>
    </div>
  );
}
