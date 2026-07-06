import React, { useState, useEffect } from "react";
import { 
  Sparkles, GraduationCap, ClipboardList, BookOpen, 
  HelpCircle, ShieldAlert, CheckCircle, Database
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ContentConverter from "./components/ContentConverter";
import ExamCreator from "./components/ExamCreator";
import ExamRunner from "./components/ExamRunner";
import { ConvertedContent, Exam } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"converter" | "creator" | "runner">("converter");
  
  // Local persistence arrays
  const [savedContents, setSavedContents] = useState<ConvertedContent[]>([]);
  const [savedExams, setSavedExams] = useState<Exam[]>([]);
  
  // Active exam selected for running
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Bridges for 1-click exam creator from converted text
  const [prefillSourceText, setPrefillSourceText] = useState("");
  const [prefillTitle, setPrefillTitle] = useState("");

  // Student active view indicator
  const [isStudentView, setIsStudentView] = useState(false);

  // Server health state
  const [health, setHealth] = useState<{ hasApiKey: boolean; message: string } | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedContents = localStorage.getItem("educraft_contents");
      if (storedContents) setSavedContents(JSON.parse(storedContents));
      
      const storedExams = localStorage.getItem("educraft_exams");
      if (storedExams) setSavedExams(JSON.parse(storedExams));
    } catch (e) {
      console.error("No se pudo cargar datos desde localStorage", e);
    }

    // Verify Gemini API Connection
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setHealth({ hasApiKey: data.hasApiKey, message: data.message }))
      .catch(() => setHealth({ hasApiKey: false, message: "Error al comunicarse con el servidor Express backend." }));

    // Check if an exam is shared via URL query param
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const examDataParam = urlParams.get("examData");
      if (examDataParam) {
        const decodedStr = decodeURIComponent(
          atob(examDataParam)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const sharedExam = JSON.parse(decodedStr) as Exam;
        if (sharedExam && sharedExam.questions && sharedExam.questions.length > 0) {
          setSelectedExam(sharedExam);
          setActiveTab("runner");
          setIsStudentView(true);
        }
      }
    } catch (e) {
      console.error("No se pudo decodificar el examen compartido por URL.", e);
    }
  }, []);

  const handleExitStudentView = () => {
    setIsStudentView(false);
    // Remove query param from browser address bar without reloading
    const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({ path: newurl }, '', newurl);
    setSelectedExam(null);
    setActiveTab("converter");
  };

  const handleSaveContent = (content: ConvertedContent) => {
    const updated = [content, ...savedContents];
    setSavedContents(updated);
    localStorage.setItem("educraft_contents", JSON.stringify(updated));
  };

  const handleSaveExam = (exam: Exam) => {
    const updated = [exam, ...savedExams];
    setSavedExams(updated);
    localStorage.setItem("educraft_exams", JSON.stringify(updated));
  };

  const handleDeleteExam = (id: string) => {
    const updated = savedExams.filter((e) => e.id !== id);
    setSavedExams(updated);
    localStorage.setItem("educraft_exams", JSON.stringify(updated));
    if (selectedExam?.id === id) {
      setSelectedExam(null);
      setActiveTab("creator");
    }
  };

  const handleTriggerExamGeneration = (sourceText: string, title: string) => {
    setPrefillSourceText(sourceText);
    setPrefillTitle(title);
    setActiveTab("creator"); // Switch tab to exam creator
  };

  const handleSelectExamToRun = (exam: Exam) => {
    setSelectedExam(exam);
    setActiveTab("runner");
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 font-sans antialiased">
      {/* Printable Area overrides page padding via css */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-print-area, .certificate-print-area * {
            visibility: visible;
          }
          .certificate-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        {isStudentView ? (
          <header className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-indigo-900 text-white p-6 rounded-3xl shadow-md border border-indigo-950 animate-fade-in text-left">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-inner">
                <GraduationCap className="w-6 h-6 text-indigo-200" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                  Portal de Evaluación <span className="text-[10px] bg-emerald-500 text-white px-2.5 py-0.5 rounded-full font-bold uppercase font-mono tracking-wider">Modo Alumno</span>
                </h1>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Evaluación interactiva activa: <span className="font-extrabold text-white">{selectedExam?.title}</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleExitStudentView}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-xl border border-white/20 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 self-stretch sm:self-auto justify-center"
            >
              <span>Panel del Profesor / Academia</span>
            </button>
          </header>
        ) : (
          <header className="no-print flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  Academia Inteligente <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase font-mono">Full-Stack AI</span>
                </h1>
                <p className="text-xs text-slate-500">
                  Unión de Creador de Exámenes de Vanguardia & Conversor de Contenido Educativo Multiformato
                </p>
              </div>
            </div>

            {/* Database indicator */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-500 font-medium">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Datos locales persistentes</span>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </header>
        )}

        {/* Tab Selection Navigation */}
        {!isStudentView && (
          <nav className="no-print flex border-b border-slate-200 mb-8 max-w-md bg-white p-1 rounded-2xl border">
            <button
              onClick={() => setActiveTab("converter")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "converter"
                  ? "bg-sky-50 text-sky-700 font-extrabold shadow-sm border border-sky-100"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Conversor de Contenido</span>
            </button>

            <button
              onClick={() => setActiveTab("creator")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "creator"
                  ? "bg-indigo-50 text-indigo-700 font-extrabold shadow-sm border border-indigo-100"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Creador de Exámenes</span>
            </button>

            <button
              disabled={!selectedExam}
              onClick={() => {
                if (selectedExam) setActiveTab("runner");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                !selectedExam 
                  ? "opacity-30 cursor-not-allowed text-slate-300" 
                  : activeTab === "runner"
                  ? "bg-violet-50 text-violet-700 font-extrabold shadow-sm border border-violet-100 cursor-pointer"
                  : "text-slate-500 hover:text-slate-800 cursor-pointer"
              }`}
              title={!selectedExam ? "Genera o elige un examen primero para ingresar al evaluador activo" : ""}
            >
              <Sparkles className="w-4 h-4" />
              <span>Evaluación Activa</span>
            </button>
          </nav>
        )}

        {/* View switching panel with transitions */}
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

      {/* Decorative footer */}
      <footer className="no-print max-w-7xl mx-auto px-4 py-12 mt-12 border-t border-slate-200 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Academia de Aprendizaje Inteligente. Desarrollado con el SDK de Google @google/genai.</p>
        <p className="mt-1 font-mono text-[10px]">Model: gemini-3.5-flash | Interface optimized for active-recall and self-directed study.</p>
      </footer>
    </div>
  );
}
