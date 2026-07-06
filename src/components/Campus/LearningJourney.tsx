import React, { useState, useEffect } from 'react';
import { Module } from '../campusTypes';
import { 
  Play, 
  Lock, 
  CheckCircle, 
  BookOpen, 
  Sparkles, 
  ExternalLink, 
  Clock, 
  Upload,
  AlertCircle,
  FileText,
  Video,
  Check,
  ChevronRight,
  GraduationCap,
  Wrench,
  Trash2,
  Edit3,
  PlusCircle,
  HelpCircle,
  Image as ImageIcon,
  Brain,
  Award,
  ListTodo,
  CheckSquare
} from 'lucide-react';
import { motion } from 'motion/react';

interface LearningJourneyProps {
  modules: Module[];
  userCompletedNodes: string[];
  userActiveNodeId: string;
  onSelectNode: (module: Module) => void;
  selectedModule: Module | null;
  onSubmitChallenge: (moduleId: string, text: string, link: string) => void;
  submissions: any[];
  activeRole?: 'student' | 'teacher';
  activeCourseId?: string | null;
  onAddModuleToCourse?: (courseId: string, module: Module) => void;
  onUpdateModules?: (updatedModules: Module[]) => void;
}

export default function LearningJourney({
  modules,
  userCompletedNodes,
  userActiveNodeId,
  selectedModule,
  onSelectNode,
  onSubmitChallenge,
  submissions,
  activeRole = 'student',
  activeCourseId = null,
  onAddModuleToCourse,
  onUpdateModules
}: LearningJourneyProps) {
  const [submissionText, setSubmissionText] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Moodle In-Context Editing Controls
  const [inEditMode, setInEditMode] = useState(false);
  const [showAddInlineForm, setShowAddInlineForm] = useState(false);

  // Form states for adding a new section/activity like Moodle selector
  const [newInlineTitle, setNewInlineTitle] = useState('');
  const [newInlineShortDesc, setNewInlineShortDesc] = useState('');
  const [newInlineDuration, setNewInlineDuration] = useState('2 horas estimadas');
  const [newInlineContent, setNewInlineContent] = useState('');
  const [newInlineChallenge, setNewInlineChallenge] = useState('');
  const [newInlineXp, setNewInlineXp] = useState(150);

  // Attachment states for the new inline module (Google Drive, PDFs)
  const [inlineRes1Name, setInlineRes1Name] = useState('Guía de Estudio PDF');
  const [inlineRes1Url, setInlineRes1Url] = useState('');
  const [inlineRes2Name, setInlineRes2Name] = useState('Enlace de Drive o Plantilla');
  const [inlineRes2Url, setInlineRes2Url] = useState('');
  
  // Moodle Activity Type Selector State
  const [newModuleType, setNewModuleType] = useState<'lesson' | 'assignment' | 'quiz' | 'ai-eval'>('assignment');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800');

  // Moodle Quiz Questions State
  const [quizQ1, setQuizQ1] = useState('¿Cuál es la regla fundamental de este concepto comercial o técnico?');
  const [quizQ1OptA, setQuizQ1OptA] = useState('Optimizar la simetría y rentabilidad sin descuidar la calidad');
  const [quizQ1OptB, setQuizQ1OptB] = useState('Hacer todo lo más rápido posible sin planificar');
  const [quizQ1OptC, setQuizQ1OptC] = useState('Esperar a que el cliente resuelva los problemas técnicos');
  const [quizQ1Correct, setQuizQ1Correct] = useState(0); // 0 = A, 1 = B, 2 = C

  const [quizQ2, setQuizQ2] = useState('¿Qué herramienta o protocolo docent es clave para homologar resultados?');
  const [quizQ2OptA, setQuizQ2OptA] = useState('La firma digital criptográfica de la red descentralizada');
  const [quizQ2OptB, setQuizQ2OptB] = useState('Un cuaderno anotador físico tradicional');
  const [quizQ2OptC, setQuizQ2OptC] = useState('No se requiere ningún tipo de validación o control');
  const [quizQ2Correct, setQuizQ2Correct] = useState(0);

  // Form states for in-place editing of current selected module
  const [isEditingCurrentNode, setIsEditingCurrentNode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editShortDesc, setEditShortDesc] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editChallenge, setEditChallenge] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editModuleType, setEditModuleType] = useState<'lesson' | 'assignment' | 'quiz' | 'ai-eval'>('assignment');
  const [editResourcesText, setEditResourcesText] = useState('');

  // Student quiz interaction state
  const [studentAnswers, setStudentAnswers] = useState<Record<string, number>>({});
  const [quizFeedback, setQuizFeedback] = useState<{ checked: boolean; correctCount: number; message: string } | null>(null);

  // Synchronize helper fields when selectedModule changes
  useEffect(() => {
    if (selectedModule) {
      setEditTitle(selectedModule.title);
      setEditShortDesc(selectedModule.shortDesc);
      setEditDuration(selectedModule.duration);
      setEditContent(selectedModule.content);
      setEditChallenge(selectedModule.challenge);
      setEditImageUrl(selectedModule.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800');
      setEditModuleType(selectedModule.moduleType || 'assignment');
      
      const resText = selectedModule.resources 
        ? selectedModule.resources.map(r => r.name).join(', ') 
        : 'Guía práctica del módulo';
      setEditResourcesText(resText);
    }
    setIsEditingCurrentNode(false);
    setQuizFeedback(null);
    setStudentAnswers({});
  }, [selectedModule]);

  // Auto-select first or active module
  useEffect(() => {
    if (!selectedModule && modules && modules.length > 0) {
      const active = modules.find(m => m.id === userActiveNodeId) || modules[0];
      onSelectNode(active);
    }
  }, [modules, userActiveNodeId, selectedModule, onSelectNode]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;
    onSubmitChallenge(selectedModule.id, submissionText, submissionLink);
    setSubmissionText('');
    setSubmissionLink('');
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  // Submit multiple choice quiz
  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule || !selectedModule.quizQuestions) return;

    let correctCount = 0;
    const questions = selectedModule.quizQuestions;

    questions.forEach((q, idx) => {
      if (studentAnswers[q.id] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const passed = correctCount === questions.length;
    
    if (passed) {
      setQuizFeedback({
        checked: true,
        correctCount,
        message: `🎉 ¡Excelente! Respondiste el 100% correcto (${correctCount}/${questions.length}). Has aprobado este cuestionario.`
      });
      // Submit automatically to complete node
      onSubmitChallenge(
        selectedModule.id, 
        `Cuestionario Autoevaluativo Completado con Éxito. Puntaje perfecto: ${correctCount}/${questions.length} respuestas correctas.`, 
        'Intranet docent System'
      );
    } else {
      setQuizFeedback({
        checked: true,
        correctCount,
        message: `⚠️ Obtuviste ${correctCount} de ${questions.length} respuestas correctas. Por favor, revisa tus opciones e inténtalo de nuevo.`
      });
    }
  };

  // Student just clicks "complete lesson"
  const handleMarkLessonComplete = () => {
    if (!selectedModule) return;
    onSubmitChallenge(
      selectedModule.id,
      `Unidad teórica leída e internalizada formalmente de manera autodidacta.`,
      'Lectura Certificada'
    );
  };

  // Handler for adding a new section directly in place like Moodle
  const handleInlineAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInlineTitle.trim() || !activeCourseId || !onAddModuleToCourse) return;

    const order = modules.length + 1;
    
    // Build questions array if Moodle quiz was selected
    const quizQuestions = newModuleType === 'quiz' ? [
      {
        id: `q-${Date.now()}-1`,
        question: quizQ1,
        options: [quizQ1OptA, quizQ1OptB, quizQ1OptC].filter(o => o.trim() !== ''),
        correctAnswerIndex: Number(quizQ1Correct)
      },
      {
        id: `q-${Date.now()}-2`,
        question: quizQ2,
        options: [quizQ2OptA, quizQ2OptB, quizQ2OptC].filter(o => o.trim() !== ''),
        correctAnswerIndex: Number(quizQ2Correct)
      }
    ] : undefined;

    const inlineResources: { name: string; url: string }[] = [];
    if (inlineRes1Name.trim() && inlineRes1Url.trim()) {
      inlineResources.push({ name: inlineRes1Name.trim(), url: inlineRes1Url.trim() });
    }
    if (inlineRes2Name.trim() && inlineRes2Url.trim()) {
      inlineResources.push({ name: inlineRes2Name.trim(), url: inlineRes2Url.trim() });
    }
    if (inlineResources.length === 0) {
      inlineResources.push({ name: 'Documento soporte homologación', url: '#' });
    }

    const newModuleItem: Module = {
      id: `module-${Date.now()}`,
      title: newInlineTitle,
      shortDesc: newInlineShortDesc || 'Descripción general',
      duration: newInlineDuration || '1 hora recomendada',
      content: newInlineContent || 'Contenido o consignas detalladas del profesor.',
      challenge: newInlineChallenge || 'Instrucciones del examen o de resolución.',
      order,
      status: order === 1 ? 'active' : 'locked',
      xpReward: Number(newInlineXp) || 150,
      moduleType: newModuleType,
      imageUrl: newImageUrl,
      quizQuestions,
      resources: inlineResources
    };

    onAddModuleToCourse(activeCourseId, newModuleItem);
    
    // Reset inputs
    setNewInlineTitle('');
    setNewInlineShortDesc('');
    setNewInlineContent('');
    setNewInlineChallenge('');
    setInlineRes1Name('Guía de Estudio PDF');
    setInlineRes1Url('');
    setInlineRes2Name('Enlace de Drive o Plantilla');
    setInlineRes2Url('');
    setShowAddInlineForm(false);
    
    // Auto select
    onSelectNode(newModuleItem);
  };

  // Handler for updating an existing module in-place
  const handleUpdateCurrentModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule || !onUpdateModules) return;

    const parsedResources = editResourcesText.split(',').map(name => ({
      name: name.trim(),
      url: '#'
    })).filter(r => r.name.length > 0);

    const updated = modules.map(m => {
      if (m.id === selectedModule.id) {
        return {
          ...m,
          title: editTitle,
          shortDesc: editShortDesc,
          duration: editDuration,
          content: editContent,
          challenge: editChallenge,
          imageUrl: editImageUrl,
          moduleType: editModuleType,
          resources: parsedResources.length > 0 ? parsedResources : m.resources
        };
      }
      return m;
    });

    onUpdateModules(updated);
    setIsEditingCurrentNode(false);
  };

  // Handler for deleting current selected module
  const handleDeleteCurrentModule = () => {
    if (!selectedModule || !onUpdateModules) return;
    if (!window.confirm(`¿Está seguro que desea eliminar la sección "${selectedModule.title}"?`)) return;

    const updated = modules
      .filter(m => m.id !== selectedModule.id)
      .map((m, idx) => ({ ...m, order: idx + 1 }));

    onUpdateModules(updated);
    setIsEditingCurrentNode(false);
    onSelectNode(updated[0] || null);
  };

  const currentSubmission = selectedModule 
    ? submissions.find(s => s.moduleId === selectedModule.id)
    : null;

  return (
    <div className="space-y-6 my-4 text-left font-sans">
      
      {/* 🔮 TEACHER/MOODLE CONTROL DE EVALUACIONES Y RECURSOS */}
      {activeRole === 'teacher' && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2.5xl bg-indigo-650 flex items-center justify-center text-xl shadow-md shrink-0">
                🛠️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-indigo-300 tracking-widest uppercase font-sans">Gestor Académico Moodle docent</h4>
                  <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Activo</span>
                </div>
                <h3 className="text-sm font-extrabold text-white">Diseño del Módulo del Cursado</h3>
                <p className="text-[11px] text-slate-350">
                  Como docente, puedes inyectar actividades para evaluación, cuestionarios interactivos con opciones múltiples, material teórico con imágenes explicativas e incluso preparar la autoevaluación con IA.
                </p>
              </div>
            </div>
            <button
              onClick={() => setInEditMode(!inEditMode)}
              className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-black tracking-wide cursor-pointer transition-all border-0 shadow-sm shrink-0 flex items-center justify-center gap-2 ${
                inEditMode 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <span>{inEditMode ? '🟢 Edición Mautífica Activada' : '⚙️ Activar Panel "Añadir de Actividades"'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Moodle Style Header Info Panel */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider block mb-1">
            Plataforma Campus Virtual (docent)
          </span>
          <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Aula Virtual & Planificación Interactiva
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            En esta consola interactiva administras o cursas las unidades pedagógicas. Haz clic en el temario de la izquierda para estudiar cada bloque de contenido independiente.
          </p>
        </div>
        
        {modules.length > 0 && (
          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-3xs text-center shrink-0 w-full md:w-auto">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Tu Progreso</span>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="text-sm font-black text-indigo-600">
                {userCompletedNodes.length} de {modules.length}
              </span>
              <span className="text-[10px] text-slate-500 font-medium font-sans">unidades</span>
            </div>
            {/* Progress bar */}
            <div className="w-24 bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden mx-auto">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min((userCompletedNodes.length / (modules.length || 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Navigation Index (Moodle Course Index Sidebar) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-3xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
              Syllabus y Unidades
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal mt-1">
              Navega para realizar entregas o autoevaluaciones.
            </p>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {modules.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4">
                <p className="text-xs text-slate-400 italic">No hay temas estructurados.</p>
                {activeRole === 'teacher' && (
                  <p className="text-[10px] text-indigo-650 font-bold mt-1">⚠️ ¡Habilita el banner de arriba para diseñar!</p>
                )}
              </div>
            ) : (
              modules.map((mod, index) => {
                const isCompleted = userCompletedNodes.includes(mod.id);
                const isTeacher = activeRole === 'teacher';
                const isActive = mod.id === userActiveNodeId;
                const isLocked = !isTeacher && !isCompleted && !isActive && mod.order > (modules.find(m => m.id === userActiveNodeId)?.order || 99);
                const isSelected = selectedModule?.id === mod.id;

                let badgeIcon = '📝';
                if (mod.moduleType === 'quiz') badgeIcon = '☑️';
                if (mod.moduleType === 'lesson') badgeIcon = '📖';
                if (mod.moduleType === 'ai-eval') badgeIcon = '🧠';

                return (
                  <button
                    key={mod.id}
                    disabled={isLocked}
                    onClick={() => onSelectNode(mod)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                        : isLocked
                        ? 'bg-slate-50/50 border-slate-100 text-slate-300 opacity-60 cursor-not-allowed'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-3xs'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold border ${
                      isSelected 
                        ? 'bg-white/10 border-white/20 text-white'
                        : isCompleted
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        : isLocked
                        ? 'bg-slate-100 border-slate-200 text-slate-400'
                        : 'bg-indigo-50 border-indigo-100 text-indigo-750'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span>{badgeIcon}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[8px] font-bold uppercase tracking-widest ${
                          isSelected ? 'text-indigo-305' : 'text-slate-400'
                        }`}>
                          {mod.moduleType === 'quiz' ? 'Cuestionario' : mod.moduleType === 'lesson' ? 'Lección' : mod.moduleType === 'ai-eval' ? 'Certificación IA' : 'Tarea Práctica'} • Unidad {mod.order}
                        </span>
                      </div>
                      
                      <h4 className={`text-xs font-bold leading-snug truncate mt-0.5 ${
                        isSelected ? 'text-white' : 'text-slate-800'
                      }`}>
                        {mod.title}
                      </h4>
                      <p className={`text-[10px] truncate mt-0.5 ${
                        isSelected ? 'text-slate-300' : 'text-slate-400'
                      }`}>
                        {mod.shortDesc}
                      </p>
                    </div>

                    <ChevronRight className={`w-4 h-4 mt-2 shrink-0 opacity-40 ${
                      isSelected ? 'text-white' : 'text-slate-500'
                    }`} />
                  </button>
                );
              })
            )}
          </div>

          {/* 🛠️ ADVANCED PARADIGM: MOODLE "AÑADIR UNA ACTIVIDAD O UN RECURSO" DIALOG SELECTOR */}
          {inEditMode && (
            <div className="border-t border-slate-100 pt-4 mt-2 font-sans text-left">
              <button
                onClick={() => setShowAddInlineForm(!showAddInlineForm)}
                className="w-full py-3 px-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border-0 cursor-pointer shadow-sm transition-all"
                type="button"
              >
                <PlusCircle className="w-4 h-4 text-white" />
                <span>{showAddInlineForm ? 'Cerrar Panel Moodle' : '＋ Añadir una actividad o un recurso'}</span>
              </button>
              
              {showAddInlineForm && (
                <div className="mt-3 bg-slate-50/95 border border-slate-200 p-4 rounded-2.5xl space-y-4">
                  
                  {/* Selector Header mimicking the Moodle classic popup */}
                  <div className="border-b border-slate-200 pb-2.5">
                    <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">Paradigmas Moodle</span>
                    <h4 className="text-xs font-black text-slate-800">Añadir una actividad o un recurso</h4>
                    <p className="text-[10px] text-slate-500 leading-snug">Selecciona qué tipo de bloque quieres insertar en la currícula del cursado virtual.</p>
                  </div>

                  {/* 4 Interactive Type Grid (Just like user requested & uploaded model!) */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewModuleType('assignment')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col space-y-1 transition-all cursor-pointer ${
                        newModuleType === 'assignment' 
                          ? 'bg-white border-indigo-600 ring-1 ring-indigo-600' 
                          : 'bg-white/80 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <span className="text-base text-indigo-600 font-sans">📝</span>
                      <strong className="text-[10px] font-bold text-slate-850">Tarea</strong>
                      <span className="text-[8.5px] leading-tight text-slate-500 block">El alumno sube un texto, link o evidencia del trabajo.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewModuleType('quiz')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col space-y-1 transition-all cursor-pointer ${
                        newModuleType === 'quiz' 
                          ? 'bg-white border-indigo-600 ring-1 ring-indigo-600' 
                          : 'bg-white/80 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <span className="text-base text-indigo-600 font-sans">☑️</span>
                      <strong className="text-[10px] font-bold text-slate-850">Cuestionario</strong>
                      <span className="text-[8.5px] leading-tight text-slate-500 block">Evaluación de opción múltiple interactiva autocalificada.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewModuleType('lesson')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col space-y-1 transition-all cursor-pointer ${
                        newModuleType === 'lesson' 
                          ? 'bg-white border-indigo-600 ring-1 ring-indigo-600' 
                          : 'bg-white/80 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <span className="text-base text-indigo-600 font-sans">📖</span>
                      <strong className="text-[10px] font-bold text-slate-850">Lección / Imagen</strong>
                      <span className="text-[8.5px] leading-tight text-slate-500 block">Teorías, contenidos textuales oficializados y fotos instructivas.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewModuleType('ai-eval')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col space-y-1 transition-all cursor-pointer ${
                        newModuleType === 'ai-eval' 
                          ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' 
                          : 'bg-slate-100/50 border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-base text-emerald-600 font-sans">🧠</span>
                        <span className="text-[8px] bg-emerald-550 text-white font-extrabold px-1 rounded uppercase scale-90">IA</span>
                      </div>
                      <strong className="text-[10px] font-bold text-slate-850">Examen con IA</strong>
                      <span className="text-[8.5px] leading-tight text-slate-500 block">(Próximamente evaluador inteligente docent).</span>
                    </button>
                  </div>

                  {/* Context dynamic fields based on selected Moodle Type */}
                  <form onSubmit={handleInlineAddModule} className="space-y-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Título del Recurso:</label>
                      <input
                        type="text"
                        required
                        value={newInlineTitle}
                        onChange={(e) => setNewInlineTitle(e.target.value)}
                        placeholder="Ej: Lección Teórica: Volúmenes Simétricos"
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Bajada / Descripción Breve:</label>
                      <input
                        type="text"
                        required
                        value={newInlineShortDesc}
                        onChange={(e) => setNewInlineShortDesc(e.target.value)}
                        placeholder="Ej: Introducción para principiantes"
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Explicación teórica o texto principal:</label>
                      <textarea
                        required
                        value={newInlineContent}
                        onChange={(e) => setNewInlineContent(e.target.value)}
                        placeholder="Escribe todo el contenido educativo que el alumno leerá..."
                        rows={3}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    {/* RENDER INLINE FIELDS FOR QUIZ TYPE (Múltiple Opción!) */}
                    {newModuleType === 'quiz' && (
                      <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/80 space-y-3">
                        <span className="text-[9px] font-black text-indigo-900 block flex items-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5" />
                          Configuración de Evaluación Opción Múltiple
                        </span>
                        
                        {/* Question 1 Builder */}
                        <div className="space-y-2 p-2 bg-white rounded-lg border border-indigo-50">
                          <div>
                            <span className="text-[8px] font-bold text-slate-450 block uppercase">Pregunta N° 1</span>
                            <input
                              type="text"
                              value={quizQ1}
                              onChange={(e) => setQuizQ1(e.target.value)}
                              className="w-full text-[11px] p-1.5 focus:outline-none focus:bg-slate-55 border-b border-slate-100"
                            />
                          </div>
                          <div className="space-y-1 pl-1">
                            {/* Option A */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold text-slate-400">A)</span>
                              <input
                                type="text"
                                value={quizQ1OptA}
                                onChange={(e) => setQuizQ1OptA(e.target.value)}
                                className="text-[10px] w-full border-b border-slate-50 bg-transparent p-0.5"
                              />
                              <input 
                                type="radio" 
                                name="q1_correct_new" 
                                checked={quizQ1Correct === 0} 
                                onChange={() => setQuizQ1Correct(0)} 
                              />
                            </div>
                            {/* Option B */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold text-slate-400">B)</span>
                              <input
                                type="text"
                                value={quizQ1OptB}
                                onChange={(e) => setQuizQ1OptB(e.target.value)}
                                className="text-[10px] w-full border-b border-slate-50 bg-transparent p-0.5"
                              />
                              <input 
                                type="radio" 
                                name="q1_correct_new" 
                                checked={quizQ1Correct === 1} 
                                onChange={() => setQuizQ1Correct(1)} 
                              />
                            </div>
                            {/* Option C */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold text-slate-400">C)</span>
                              <input
                                type="text"
                                value={quizQ1OptC}
                                onChange={(e) => setQuizQ1OptC(e.target.value)}
                                className="text-[10px] w-full border-b border-slate-50 bg-transparent p-0.5"
                              />
                              <input 
                                type="radio" 
                                name="q1_correct_new" 
                                checked={quizQ1Correct === 2} 
                                onChange={() => setQuizQ1Correct(2)} 
                              />
                            </div>
                          </div>
                          <span className="text-[8.5px] text-indigo-700 font-bold block pt-1 font-mono">El botón circular marca la respuesta correcta</span>
                        </div>

                        {/* Question 2 Builder */}
                        <div className="space-y-2 p-2 bg-white rounded-lg border border-indigo-50">
                          <div>
                            <span className="text-[8px] font-bold text-slate-450 block uppercase">Pregunta N° 2</span>
                            <input
                              type="text"
                              value={quizQ2}
                              onChange={(e) => setQuizQ2(e.target.value)}
                              className="w-full text-[11px] p-1.5 focus:outline-none focus:bg-slate-55 border-b border-slate-100"
                            />
                          </div>
                          <div className="space-y-1 pl-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold text-slate-400">A)</span>
                              <input
                                type="text"
                                value={quizQ2OptA}
                                onChange={(e) => setQuizQ2OptA(e.target.value)}
                                className="text-[10px] w-full border-b border-slate-50 bg-transparent p-0.5"
                              />
                              <input 
                                type="radio" 
                                name="q2_correct_new" 
                                checked={quizQ2Correct === 0} 
                                onChange={() => setQuizQ2Correct(0)} 
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold text-slate-400">B)</span>
                              <input
                                type="text"
                                value={quizQ2OptB}
                                onChange={(e) => setQuizQ2OptB(e.target.value)}
                                className="text-[10px] w-full border-b border-slate-50 bg-transparent p-0.5"
                              />
                              <input 
                                type="radio" 
                                name="q2_correct_new" 
                                checked={quizQ2Correct === 1} 
                                onChange={() => setQuizQ2Correct(1)} 
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold text-slate-400">C)</span>
                              <input
                                type="text"
                                value={quizQ2OptC}
                                onChange={(e) => setQuizQ2OptC(e.target.value)}
                                className="text-[10px] w-full border-b border-slate-50 bg-transparent p-0.5"
                              />
                              <input 
                                type="radio" 
                                name="q2_correct_new" 
                                checked={quizQ2Correct === 2} 
                                onChange={() => setQuizQ2Correct(2)} 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* RENDER PICTURE SELECTION FOR LESSON TYPE */}
                    {newModuleType === 'lesson' && (
                      <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 space-y-2">
                        <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">Imagen o Isotipo del Tema:</label>
                        <input
                          type="text"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="Pega un enlace de la imagen explicativa"
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-205 bg-white"
                        />
                        {/* Interactive Image Choice Presets */}
                        <div className="grid grid-cols-3 gap-1 pt-1">
                          {[
                            { name: '💻 Código', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500' },
                            { name: '🔬 Ciencia', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500' },
                            { name: '🎨 Diseño', url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500' }
                          ].map((item) => (
                            <button
                              key={item.name}
                              type="button"
                              onClick={() => setNewImageUrl(item.url)}
                              className={`text-[9px] font-bold p-1 rounded border text-center cursor-pointer transition-all ${
                                newImageUrl === item.url ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 hover:bg-slate-200 border-slate-200'
                              }`}
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* RENDER ASSIGNMENT FIELDS */}
                    {newModuleType === 'assignment' && (
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Consigna o Reto Evaluativo (Lo que debe hacer el alumno):</label>
                        <input
                          type="text"
                          required
                          value={newInlineChallenge}
                          onChange={(e) => setNewInlineChallenge(e.target.value)}
                          placeholder="Ej: Resuelve el modelado simétrico de volumetrías y sube tu análisis escrito aquí."
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    )}

                    {/* RESOURCE ATTACHMENTS (Drive/Dropbox/PDF external links) */}
                    <div className="bg-slate-150 p-3 rounded-xl border border-slate-200 text-left space-y-3">
                      <div className="text-[9.5px] leading-snug text-slate-500">
                        📁 **Añadir Recursos Externos:** Agrega enlaces públicos de **Google Drive, Dropbox o PDFs**. Recuerda marcar el archivo en tu Drive como público («Cualquier persona con el enlace puede ver») para que tus alumnos puedan descargarlo externamente.
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                        <div className="space-y-1">
                          <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">PDF Nombre / Hito 1:</label>
                          <input
                            type="text"
                            value={inlineRes1Name}
                            onChange={(e) => setInlineRes1Name(e.target.value)}
                            placeholder="Anexo de Apoyo PDF"
                            className="w-full text-[10px] p-2 rounded-lg border border-slate-200 bg-white"
                          />
                          <input
                            type="text"
                            value={inlineRes1Url}
                            onChange={(e) => setInlineRes1Url(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="w-full text-[10px] p-2 rounded-lg border border-slate-200 bg-white font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Drive Recurso / Hito 2:</label>
                          <input
                            type="text"
                            value={inlineRes2Name}
                            onChange={(e) => setInlineRes2Name(e.target.value)}
                            placeholder="Planilla de Trabajo Drive"
                            className="w-full text-[10px] p-2 rounded-lg border border-slate-200 bg-white"
                          />
                          <input
                            type="text"
                            value={inlineRes2Url}
                            onChange={(e) => setInlineRes2Url(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="w-full text-[10px] p-2 rounded-lg border border-slate-200 bg-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PREVIEW OF XP REWARD */}
                    <div className="flex justify-between items-center bg-slate-100 p-2 rounded-lg">
                      <span className="text-[9px] font-bold text-slate-500 font-sans">RECOMPENSA ACADÉMICA:</span>
                      <span className="text-[10px] font-black text-indigo-750">💎 +150 XP</span>
                    </div>

                    <button
                      type="submit"
                      disabled={newModuleType === 'ai-eval'} /* AI-eval requested to be locked/placeholder title only */
                      className={`w-full py-3 text-white rounded-2xl text-xs font-bold cursor-pointer transition-all border-0 shadow-sm ${
                        newModuleType === 'ai-eval' 
                          ? 'bg-slate-350 cursor-not-allowed opacity-50' 
                          : 'bg-indigo-600 hover:bg-indigo-500'
                      }`}
                    >
                      {newModuleType === 'ai-eval' ? 'Inteligencia IA Offline en Preview' : '＋ Homologar e Inyectar en Syllabus'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Module Study Room Panel */}
        <div className="lg:col-span-8">
          {selectedModule ? (
            <motion.div
              key={selectedModule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-3xs"
            >
              {/* Module Header Title */}
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/70 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-black bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-full border border-indigo-150">
                      {selectedModule.moduleType === 'quiz' ? 'Cuestionario Autónomo' : selectedModule.moduleType === 'lesson' ? 'Lección Educativa' : selectedModule.moduleType === 'ai-eval' ? 'Evaluación IA' : 'Entrega Evaluativa'} • Unidad {selectedModule.order}
                    </span>
                    <span className="text-[10px] font-sans text-slate-550 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {selectedModule.duration}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base md:text-lg text-slate-905 tracking-tight font-sans mt-2">
                    {selectedModule.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">
                    {selectedModule.shortDesc}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                  <div className="bg-indigo-650/10 text-indigo-800 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-indigo-150 text-center select-none">
                    💎 +{selectedModule.xpReward || 150} XP
                  </div>
                  {/* IN-PLACE UNIT EDITING TRIGGER FOR TEACHERS */}
                  {inEditMode && !isEditingCurrentNode && (
                    <button
                      onClick={() => setIsEditingCurrentNode(true)}
                      className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-850 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editar Unidad Completa
                    </button>
                  )}
                </div>
              </div>

              {/* IN-PLACE SECTION EDITOR BOX */}
              {isEditingCurrentNode ? (
                <form onSubmit={handleUpdateCurrentModule} className="p-6 bg-indigo-50/20 border-b border-indigo-100 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-indigo-100">
                    <span className="text-xs font-black text-indigo-900 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-indigo-700" />
                      Modificar Unidad {selectedModule.order} ({selectedModule.moduleType || 'Completa'})
                    </span>
                    <button
                      type="button"
                      onClick={handleDeleteCurrentModule}
                      className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer border border-red-200 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar Sección
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Título del Tema:</label>
                      <input
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-205 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Resumen Corto:</label>
                      <input
                        type="text"
                        required
                        value={editShortDesc}
                        onChange={(e) => setEditShortDesc(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-205 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Duración Estimada:</label>
                      <input
                        type="text"
                        required
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-205 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                        Guías PDFs o Lecturas (Separar por comas):
                      </label>
                      <input
                        type="text"
                        value={editResourcesText}
                        onChange={(e) => setEditResourcesText(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-205 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Explicación Teórica de la Clase:</label>
                    <textarea
                      required
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-205 bg-white"
                    />
                  </div>

                  {selectedModule.moduleType !== 'quiz' && selectedModule.moduleType !== 'lesson' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Consigna o Reto Evaluativo de Carga Obligatoria:</label>
                      <input
                        type="text"
                        required
                        value={editChallenge}
                        onChange={(e) => setEditChallenge(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-205 bg-white"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors border-0 shadow-3xs"
                    >
                      Guardar Cambios de Unidad 
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingCurrentNode(false)}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer transition-colors border-0"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : null}

              {/* Moodle Classic Learning Sections Organizer inside selected Unit */}
              <div className="p-6 space-y-6 text-left">
                
                {/* 1. SECCIÓN MATERIALES: LECTURAS Y DOCUMENTOS */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-slate-705 border-b border-slate-100 pb-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Sección 1: Material de Lectura y Explicación
                    </h4>
                  </div>
                  
                  {/* Conceptual Lesson text summary */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-line">
                    <strong className="text-slate-800 block mb-1">Conceptos Clave de la Clase:</strong>
                    {selectedModule.content}
                  </div>

                  {/* Document link attachment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {selectedModule.resources && selectedModule.resources.map((res, i) => {
                      const isDriveLink = res.url && (res.url.includes('drive.google.com') || res.url.includes('drive.google') || res.url.includes('docs.google.com'));
                      return (
                        <a 
                          key={i} 
                          href={res.url && res.url !== '#' ? res.url : undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (!res.url || res.url === '#') {
                              e.preventDefault();
                              alert("Este es un recurso educativo de muestra. Sube un enlace de Drive o PDF válido desde el panel del profesor o el constructor de cursos.");
                            }
                          }}
                          className="bg-white hover:bg-slate-50 border hover:border-indigo-300 rounded-xl p-3.5 flex items-center justify-between group transition-all decoration-transparent"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-750 flex items-center justify-center font-bold text-base shrink-0 select-none">
                              {isDriveLink ? '📁' : '📖'}
                            </div>
                            <div className="text-left">
                              <span className="text-xs font-bold text-slate-700 block truncate max-w-[170px]" title={res.name}>
                                {res.name}
                              </span>
                              <span className="text-[9px] text-slate-400 block font-mono">
                                {isDriveLink ? 'Enlace de Google Drive ↗' : 'Guía de Lectura PDF ↗'}
                              </span>
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* 2. OPTIONAL RECOG / IMAGE ATTACHED (Addresses 'la imagen' chosen by the teacher!) */}
                {selectedModule.imageUrl && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-705 border-b border-slate-100 pb-2">
                      <ImageIcon className="w-4 h-4 text-violet-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Sección 2: Imagen o Isotipo Ilustrativo
                      </h4>
                    </div>
                    
                    <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm max-h-72 bg-slate-900 flex items-center justify-center">
                      <img 
                        src={selectedModule.imageUrl} 
                        alt={selectedModule.title} 
                        className="w-full h-full object-cover max-h-72 hover:scale-101 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}

                {/* 3. DYNAMIC RENDERING OF ASSESSMENTS (CUBRES EXAMENES O MULTIPLE OPCION SELECCIONA POR EL USUARIO!) */}
                
                {/* A. MULTIPLE CHOICE QUIZ DISPLAY */}
                {selectedModule.moduleType === 'quiz' && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-705 border-b border-slate-100 pb-2">
                      <CheckSquare className="w-4 h-4 text-indigo-650" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Sección 3: Cuestionario Interactivo de Evaluación
                      </h4>
                    </div>

                    {userCompletedNodes.includes(selectedModule.id) ? (
                      <div className="bg-emerald-50 border border-emerald-250 p-5 rounded-2.5xl space-y-2 flex items-center gap-4">
                        <span className="text-3xl">🎉</span>
                        <div>
                          <h5 className="text-xs font-black text-emerald-800 uppercase tracking-wider leading-none">¡Felicidades! Cuestionario Aprobado</h5>
                          <p className="text-xs text-emerald-700 font-sans mt-1">Has respondido correctamente todas las preguntas planteadas en este examen autónomo. Los puntos de XP han sido inyectados e integrados con tu sello institucional.</p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleQuizSubmit} className="bg-slate-50 border border-slate-200 rounded-2.5xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase text-indigo-750 tracking-wider">Cuestionario Práctico de Autoevaluación</span>
                          <span className="text-[9px] bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold px-2 py-0.5 rounded-full select-none">
                            Obligatorio para Aprobar
                          </span>
                        </div>

                        {selectedModule.quizQuestions && selectedModule.quizQuestions.length > 0 ? (
                          <div className="space-y-4">
                            {selectedModule.quizQuestions.map((q, idx) => (
                              <div key={q.id || idx} className="space-y-2 p-3 bg-white rounded-xl border border-slate-150">
                                <h5 className="text-xs font-extrabold text-slate-800 leading-normal">
                                  {idx + 1}. {q.question}
                                </h5>
                                <div className="space-y-1.5 pl-1.5">
                                  {q.options.map((opt, oIdx) => (
                                    <label 
                                      key={oIdx} 
                                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                                        studentAnswers[q.id] === oIdx 
                                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold' 
                                          : 'border-slate-150 hover:bg-slate-50 text-slate-650'
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`q_std_${q.id}`}
                                        checked={studentAnswers[q.id] === oIdx}
                                        onChange={() => setStudentAnswers({ ...studentAnswers, [q.id]: oIdx })}
                                        className="text-indigo-600"
                                      />
                                      <span>{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}

                            {quizFeedback && (
                              <div className={`p-4 rounded-xl border text-xs font-semibold leading-relaxed ${
                                quizFeedback.message.includes('🎉') 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}>
                                {quizFeedback.message}
                              </div>
                            )}

                            <button
                              type="submit"
                              className="w-full py-3 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border-0 shadow-3xs"
                            >
                              Enviar Respuestas & Calificar
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-450 italic text-center py-4">No se configuraron preguntas en este cuestionario interactivo.</p>
                        )}
                      </form>
                    )}
                  </div>
                )}

                {/* B. ARTIFICIAL INTELLIGENCE AUTO-EVALUATION INTERACTIVE PLACEHOLDER ('sólo título que no funcione') */}
                {selectedModule.moduleType === 'ai-eval' && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-705 border-b border-slate-100 pb-2">
                      <Brain className="w-4 h-4 text-emerald-600 animate-pulse" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                        Cuestionario de Autoevaluación Inteligente con Asistente de IA
                      </h4>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/50 border border-emerald-250 p-6 rounded-2.5xl text-center space-y-4">
                      <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-md">
                        🧠
                      </div>
                      <div className="space-y-1.5 max-w-lg mx-auto">
                        <span className="text-[9px] bg-emerald-550 text-white font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                          MÓDULO IA INTEGRADO EN EL NODO docent
                        </span>
                        <h4 className="text-slate-900 font-extrabold text-sm sm:text-base">Autoevaluación con IA</h4>
                        <p className="text-xs text-slate-550 leading-relaxed font-sans">
                          El Asistente virtual de Inteligencia Artificial analizará en tiempo real tu historial del cursado y redactará un examen oral simulado exclusivo adaptado a los contenidos oficiales del aula de estudio.
                        </p>
                      </div>

                      <div className="border border-dashed border-emerald-300 p-3.5 rounded-xl text-[11px] text-emerald-800 italic bg-white max-w-sm mx-auto">
                        ⏳ Módulo de IA offline por motivos de privacidad en entorno de pruebas. Estará disponible de manera transparente en la red en la próxima actualización.
                      </div>

                      <button
                        type="button"
                        disabled
                        className="px-6 py-2.5 bg-slate-200 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed border-0"
                      >
                        Generar Examen con IA Desactivado
                      </button>
                    </div>
                  </div>
                )}

                {/* C. MANUAL SUBMISSION (CLASSIC ASSIGNMENT OR LESSON COMPLETED TRIDIMENSIONAL CHOOSE) */}
                {(selectedModule.moduleType === 'assignment' || !selectedModule.moduleType) && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-705 border-b border-slate-100 pb-2">
                      <Sparkles className="w-4 h-4 text-indigo-650" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Sección 3: Consola de Entrega de Trabajo Práctico
                      </h4>
                    </div>

                    {/* Context Guidelines box */}
                    <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-5 space-y-3">
                      <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                        Consigna del Docente:
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
                        {selectedModule.challenge}
                      </p>
                    </div>

                    {/* Submission Flow or feedback board */}
                    {currentSubmission ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-xs font-bold text-slate-750">Tu solución ha sido cargada</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${
                            currentSubmission.status === 'reviewed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {currentSubmission.status === 'reviewed' ? 'Calificado / Homologado' : 'Esperando Corrección del Docente'}
                          </span>
                        </div>

                        {/* Student submitted text */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-150 space-y-1">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Tu evidencia guardada:</span>
                          <p className="text-xs text-slate-700 font-sans italic leading-normal">
                            &ldquo;{currentSubmission.textContent}&rdquo;
                          </p>
                          {currentSubmission.workUrl && (
                            <a 
                              href={currentSubmission.workUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs text-indigo-600 font-bold hover:underline inline-flex items-center gap-1 mt-1.5"
                            >
                              🔗 Abrir Enlace Entregado
                            </a>
                          )}
                        </div>

                        {/* Instructor detailed review and status */}
                        {currentSubmission.status === 'reviewed' ? (
                          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-indigo-850">Comentarios del Profesor Evaluador:</span>
                              {currentSubmission.gradeBadge && (
                                <span className="bg-indigo-600 text-white text-[9.5px] font-black px-2.5 py-0.5 rounded-full border border-indigo-700 shadow-sm uppercase select-none">
                                  Insignia {currentSubmission.gradeBadge} ★
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-650 font-sans leading-relaxed">
                              {currentSubmission.feedback}
                            </p>
                          </div>
                        ) : (
                          <div className="text-xs text-amber-750 bg-amber-50/40 p-3 rounded-lg border border-amber-100/50 italic select-none">
                            ⌛ El docente evaluador certificará tu actividad próximamente en la pestaña de gestión. Recibirás feedback inmediato aquí.
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Elegant Submission Form */
                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                            Respuestas, Análisis de tu resolución o Solución redactada:
                          </label>
                          <textarea
                            required
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            placeholder="Indique brevemente cómo encaró la resolución, conclusiones o el desarrollo solicitado por el profesor."
                            className="w-full text-xs p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-650 bg-slate-50/20"
                            rows={4}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                            Enlace opcional de la entrega (Google Drive, Dropbox, Canva, Figma o similar):
                          </label>
                          <input
                            type="url"
                            value={submissionLink}
                            onChange={(e) => setSubmissionLink(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="w-full text-xs p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-650 bg-slate-50/20"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs border-0"
                        >
                          <Upload className="w-4 h-4 text-white" />
                          <span>Entregar Tarea de Unidad {selectedModule.order}</span>
                        </button>

                        {submitSuccess && (
                          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold justify-center pt-1">
                            <Check className="w-4 h-4" />
                            ¡Tarea guardada y enviada al buzón del profesor con éxito!
                          </div>
                        )}
                      </form>
                    )}
                  </div>
                )}

                {/* D. THEORY LESSON READ ONLY COMPLETED SWITCH */}
                {selectedModule.moduleType === 'lesson' && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-705 border-b border-slate-100 pb-2">
                      <GraduationCap className="w-4 h-4 text-green-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Sección 3: Finalización de la Lección
                      </h4>
                    </div>

                    {userCompletedNodes.includes(selectedModule.id) ? (
                      <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        ¡Has leído y completado con éxito este tema teórico! Sumaste +{selectedModule.xpReward || 150} XP.
                      </div>
                    ) : (
                      <div className="bg-indigo-50/30 border border-indigo-150 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <strong className="text-xs text-slate-800 block">Lectura Técnica Autoasistida</strong>
                          <p className="text-[11px] text-slate-500">¿Finalizaste de estudiar los apuntes y analizar las imágenes? Presiona aquí para homologar el avance.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleMarkLessonComplete}
                          className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-xs cursor-pointer border-0 shadow-3xs shrink-0 transition-all"
                        >
                          Marcar como Leído y Completar ✓
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-sans font-medium">Seleccione uno de los Temas del temario de la izquierda para ingresar al aula de estudio interactiva.</p>
              {activeRole === 'teacher' && (
                <button
                  onClick={() => setInEditMode(true)}
                  className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border-0 cursor-pointer"
                >
                  Activar Edición Moodle de Temas ⚙️
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
