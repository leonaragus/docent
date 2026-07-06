import React, { useState, useEffect } from 'react';
import { Course, Module, TallerVivo, Submission, UserState, Academy, RecordedClass } from '../types';
import { 
  PlusCircle, 
  MapPin, 
  BookOpen, 
  Clock, 
  Layers, 
  Award, 
  Users, 
  CheckCircle,
  FileText,
  AlertCircle,
  FolderOpen,
  Settings,
  Sparkles,
  Link,
  Laptop,
  Palette,
  CloudLightning,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import RaicepLogo from './RaicepLogo';

interface CreatorPortalProps {
  courses: Course[];
  talleres: TallerVivo[];
  students: UserState[];
  activeAcademy: Academy;
  onAddCourse: (course: Course) => void;
  onAddModuleToCourse: (courseId: string, module: Module) => void;
  onAddRecordedClass: (courseId: string, recClass: RecordedClass) => void;
  onAddTaller: (taller: TallerVivo) => void;
  onGradeSubmission: (submissionId: string, gradeBadge: 'Bronce' | 'Plata' | 'Oro', feedback: string) => void;
  onUpdateAcademySettings: (settings: { name: string; subdomain: string; logoUrl: string; bannerUrl: string; themeId: string }) => void;
  onCreateStudent: (name: string, avatar: string, level: number, xp: number) => void;
}

export default function CreatorPortal({
  courses,
  talleres,
  students,
  activeAcademy,
  onAddCourse,
  onAddModuleToCourse,
  onAddRecordedClass,
  onAddTaller,
  onGradeSubmission,
  onUpdateAcademySettings,
  onCreateStudent
}: CreatorPortalProps) {
  // New layout tab: review profiles vs create content vs settings
  const [portalTab, setPortalTab] = useState<'performance' | 'builder' | 'settings'>('performance');
  
  // Selected student for diploma demo view
  const [selectedDiplomaStudent, setSelectedDiplomaStudent] = useState<{ student: UserState; course: Course } | null>(null);

  // Academy Settings custom state
  const [acadName, setAcadName] = useState(activeAcademy.name);
  const [acadSubdomain, setAcadSubdomain] = useState(activeAcademy.subdomain);
  const [acadLogoUrl, setAcadLogoUrl] = useState(activeAcademy.logoUrl || '');
  const [acadBannerUrl, setAcadBannerUrl] = useState(activeAcademy.bannerUrl || '');
  const [acadThemeId, setAcadThemeId] = useState(activeAcademy.themeId);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    setAcadName(activeAcademy.name);
    setAcadSubdomain(activeAcademy.subdomain);
    setAcadLogoUrl(activeAcademy.logoUrl || '');
    setAcadBannerUrl(activeAcademy.bannerUrl || '');
    setAcadThemeId(activeAcademy.themeId);
  }, [activeAcademy]);

  // Course creation state
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState('Tecnología Interactiva');
  const [courseInstructor, setCourseInstructor] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseSuccess, setCourseSuccess] = useState(false);

  // Module creation state
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');

  // Recorded class creation state
  const [recTitle, setRecTitle] = useState('');
  const [recDesc, setRecDesc] = useState('');
  const [recUrl, setRecUrl] = useState('');
  const [recTrans, setRecTrans] = useState('');
  const [recTransFileName, setRecTransFileName] = useState('');
  const [recModuleId, setRecModuleId] = useState('');
  const [recSuccess, setRecSuccess] = useState(false);

  useEffect(() => {
    if (courses.length > 0 && (!selectedCourseId || !courses.some(c => c.id === selectedCourseId))) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleShortDesc, setModuleShortDesc] = useState('');
  const [moduleDuration, setModuleDuration] = useState('2 horas estimadas');
  const [moduleContent, setModuleContent] = useState('');
  const [moduleChallenge, setModuleChallenge] = useState('');
  const [moduleXp, setModuleXp] = useState(150);
  const [moduleSuccess, setModuleSuccess] = useState(false);

  // Module attachment links (Drive, PDFs)
  const [res1Name, setRes1Name] = useState('Guía de Estudio PDF');
  const [res1Url, setRes1Url] = useState('');
  const [res2Name, setRes2Name] = useState('Enlace de Drive o Plantilla');
  const [res2Url, setRes2Url] = useState('');

  // Taller creation state
  const [tallerTitle, setTallerTitle] = useState('');
  const [tallerInstructor, setTallerInstructor] = useState('');
  const [tallerDate, setTallerDate] = useState('Mié, 10 Jun');
  const [tallerTime, setTallerTime] = useState('18:00');
  const [tallerType, setTallerType] = useState<'Workshop' | 'Feedback' | 'Masterclass'>('Workshop');
  const [tallerSpots, setTallerSpots] = useState(15);
  const [tallerSuccess, setTallerSuccess] = useState(false);

  // Student creation state
  const [studentName, setStudentName] = useState('');
  const [studentAvatar, setStudentAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');

  // Grading tool state
  const [activeGradingSubId, setActiveGradingSubId] = useState<string | null>(null);
  const [gradeBadge, setGradeBadge] = useState<'Bronce' | 'Plata' | 'Oro'>('Oro');
  const [gradeFeedback, setGradeFeedback] = useState('');

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !courseInstructor.trim()) return;

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: courseTitle,
      category: courseCategory,
      instructor: courseInstructor,
      description: courseDescription,
      modules: [],
      recordedClasses: []
    };

    onAddCourse(newCourse);
    setSelectedCourseId(newCourse.id);
    setCourseTitle('');
    setCourseInstructor('');
    setCourseDescription('');
    setCourseSuccess(true);
    setTimeout(() => setCourseSuccess(false), 4000);
  };

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim() || !selectedCourseId) return;

    // Get order number based on existing modules
    const course = courses.find(c => c.id === selectedCourseId);
    const order = course ? course.modules.length + 1 : 1;

    const moduleResources: { name: string; url: string }[] = [];
    if (res1Name.trim() && res1Url.trim()) {
      moduleResources.push({ name: res1Name.trim(), url: res1Url.trim() });
    }
    if (res2Name.trim() && res2Url.trim()) {
      moduleResources.push({ name: res2Name.trim(), url: res2Url.trim() });
    }
    if (moduleResources.length === 0) {
      moduleResources.push({ name: 'Guía del módulo PDF', url: '#' });
    }

    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: moduleTitle,
      shortDesc: moduleShortDesc,
      duration: moduleDuration,
      content: moduleContent,
      challenge: moduleChallenge,
      order,
      status: order === 1 ? 'active' : 'locked',
      xpReward: Number(moduleXp),
      resources: moduleResources
    };

    onAddModuleToCourse(selectedCourseId, newModule);
    setModuleTitle('');
    setModuleShortDesc('');
    setModuleContent('');
    setModuleChallenge('');
    setModuleXp(150);
    setRes1Name('Guía de Estudio PDF');
    setRes1Url('');
    setRes2Name('Enlace de Drive o Plantilla');
    setRes2Url('');
    setModuleSuccess(true);
    setTimeout(() => setModuleSuccess(false), 4000);
  };

  const handleCreateTaller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tallerTitle.trim()) return;

    const newTaller: TallerVivo = {
      id: `taller-${Date.now()}`,
      title: tallerTitle,
      instructor: tallerInstructor || 'Instructor Titular',
      date: tallerDate,
      time: tallerTime,
      spotsLeft: Number(tallerSpots),
      isRegistered: false,
      type: tallerType
    };

    onAddTaller(newTaller);
    setTallerTitle('');
    setTallerInstructor('');
    setTallerSuccess(true);
    setTimeout(() => setTallerSuccess(false), 4000);
  };

  const handleTranscriptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRecTransFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => setRecTrans(event.target?.result as string);
      reader.readAsText(file);
    }
  };

  const handleCreateRecClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recTitle.trim() || !selectedCourseId || !recUrl.trim()) return;

    const newRecClass: RecordedClass = {
        id: `rec-${Date.now()}`,
        title: recTitle,
        description: recDesc,
        youtubeUrl: recUrl,
        transcription: recTrans,
        moduleId: recModuleId,
        createdAt: new Date().toISOString()
    };

    onAddRecordedClass(selectedCourseId, newRecClass);
    setRecTitle('');
    setRecDesc('');
    setRecUrl('');
    setRecTrans('');
    setRecTransFileName('');
    setRecModuleId('');
    setRecSuccess(true);
    setTimeout(() => setRecSuccess(false), 4000);
  };

  // ... student creation handler
  const handleCreateStudentClick = () => {
    if (!studentName.trim()) return;
    onCreateStudent(studentName, studentAvatar, 1, 0);
    setStudentName('');
  };

  const handleGradeSubmit = (submissionId: string) => {
    if (!gradeFeedback.trim()) return;
    onGradeSubmission(submissionId, gradeBadge, gradeFeedback);
    setActiveGradingSubId(null);
    setGradeFeedback('');
  };

  const handleUpdateSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acadName.trim() || !acadSubdomain.trim()) return;

    onUpdateAcademySettings({
      name: acadName.trim(),
      subdomain: acadSubdomain.trim(),
      logoUrl: acadLogoUrl.trim(),
      bannerUrl: acadBannerUrl.trim(),
      themeId: acadThemeId
    });

    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 4500);
  };

  // Dynamically compile all submissions from all registered students
  const allSubmissions = React.useMemo(() => {
    const list: (Submission & { studentName: string; studentAvatar: string; studentId: string })[] = [];
    students.forEach(student => {
      if (student.submissions) {
        student.submissions.forEach(sub => {
          list.push({
            ...sub,
            studentName: student.name,
            studentAvatar: student.avatar,
            studentId: student.name
          });
        });
      }
    });
    return list;
  }, [students]);

  const pendingSubmissions = allSubmissions.filter(s => s.status === 'pending');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-4">
      
      {/* Sidebar explanation of Moodle Customization (4 Columns) */}
      <div className="lg:col-span-4 space-y-6">
        
        <div className="bg-gradient-to-br from-indigo-900 to-violet-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-violet-300 font-sans mb-2">
            Panel del Gestor Académico
          </h3>
          <p className="text-xs text-slate-200 leading-relaxed font-sans mb-4">
            Aquí diseñas el ecosistema educativo. A diferencia de otros sistemas clásicos que requieren configuraciones burocráticas aburridas, en **RAICEP** la acreditación y creación es instantánea, privada y transparente.
          </p>
          <div className="space-y-2 text-[11px] text-violet-100">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Crea cursados dinámicos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Inyecta módulos didácticos interactivos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Evalúa entregas de los alumnos con medallas</span>
            </div>
          </div>
        </div>

        {/* Live Submissions Pipeline Simulator */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Evaluación Directa ({pendingSubmissions.length} pendientes)
            </h4>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>

          <div className="space-y-4">
            {pendingSubmissions.length > 0 ? (
              pendingSubmissions.map(sub => (
                <div key={sub.id} className="border border-amber-100 bg-amber-50/20 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-amber-100/50">
                    {sub.studentAvatar ? (
                      <img src={sub.studentAvatar} className="w-5 h-5 rounded-full object-cover border border-amber-200" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-amber-400 text-white font-bold flex items-center justify-center text-[9px] shrink-0 border border-white shadow-3xs">
                        {sub.studentName ? sub.studentName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="text-[10px] font-extrabold text-slate-700">{sub.studentName}</span>
                    <span className="text-[8px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full uppercase ml-auto">Pendiente</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-amber-800 uppercase">Módulo: {sub.moduleTitle}</span>
                    <span className="text-[10px] text-slate-400 font-sans">{sub.submittedAt}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-normal italic bg-white p-2.5 rounded border border-slate-100">
                    &ldquo;{sub.textContent}&rdquo;
                  </p>
                  
                  {sub.workUrl && (
                    <a 
                      href={sub.workUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[11px] text-indigo-600 hover:underline block font-semibold"
                    >
                      🔗 Ver lienzo entregado
                    </a>
                  )}

                  {activeGradingSubId === sub.id ? (
                    <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Badge de Rendimiento:</label>
                        <div className="flex gap-1.5">
                          {(['Bronce', 'Plata', 'Oro'] as const).map(b => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setGradeBadge(b)}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded border cursor-pointer ${
                                gradeBadge === b 
                                  ? 'bg-slate-900 border-slate-950 text-white' 
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Feedback de Mentor:</label>
                        <textarea
                          required
                          value={gradeFeedback}
                          onChange={(e) => setGradeFeedback(e.target.value)}
                          placeholder="Gran composición. Sin embargo, recuerda que..."
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGradeSubmit(sub.id)}
                          className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer text-center"
                        >
                          Confirmar Calificación
                        </button>
                        <button
                          onClick={() => setActiveGradingSubId(null)}
                          className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveGradingSubId(sub.id);
                        setGradeFeedback('¡Gran solución! Cumple impecablemente con las pautas de diseño y contraste del módulo.');
                      }}
                      className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer text-center"
                    >
                      Calificar y Dar Feedback ★
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">No hay entregas pendientes de alumnos en cola.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Creation forms (8 Columns) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Tabs switcher inside Creator Portal */}
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-xl border border-slate-200/50 shadow-3xs">
          <button
            type="button"
            onClick={() => setPortalTab('performance')}
            className={`flex-grow py-2.5 px-3 text-xs font-bold rounded-xl cursor-pointer transition-all border-0 ${
              portalTab === 'performance' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            📊 Notas y Rendimiento Alumnos
          </button>
          <button
            type="button"
            onClick={() => setPortalTab('builder')}
            className={`flex-grow py-2.5 px-3 text-xs font-bold rounded-xl cursor-pointer transition-all border-0 ${
              portalTab === 'builder' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            🛠️ Constructor de Cursados
          </button>
          <button
            type="button"
            onClick={() => setPortalTab('settings')}
            className={`flex-grow py-2.5 px-3 text-xs font-bold rounded-xl cursor-pointer transition-all border-0 ${
              portalTab === 'settings' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            ⚙️ Ajustes del Campus (Banner / Logo)
          </button>
        </div>

        {portalTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg sm:text-xl font-display tracking-tight">
                    Rendimiento y Notas de Alumnos
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Monitorea el progreso, calificaciones y emite certificados oficiales de acreditación.
                  </p>
                </div>
                
                <div className="w-full sm:w-64 shrink-0">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Seleccionar Cursado Académico:
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Stats for this specific course */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4 space-y-4">
                 <h4 className="text-xs font-bold text-slate-700">Agregar Clase Grabada Rápida</h4>
                 <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Título" className="text-xs p-2 rounded border" value={recTitle} onChange={(e) => setRecTitle(e.target.value)} />
                    <input type="text" placeholder="YouTube URL" className="text-xs p-2 rounded border" value={recUrl} onChange={(e) => setRecUrl(e.target.value)} />
                    <select className="text-xs p-2 rounded border bg-white" value={recModuleId} onChange={(e) => setRecModuleId(e.target.value)}>
                       <option value="">(Sin Módulo)</option>
                       {(() => {
                         const currentCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
                         return currentCourse?.modules.map(mod => <option key={mod.id} value={mod.id}>{mod.title}</option>);
                       })()}
                    </select>
                    <button className="py-2 px-4 bg-rose-600 text-white text-xs font-bold rounded-lg cursor-pointer" onClick={(e) => {
                         handleCreateRecClass(e as any);
                    }}>Agregar Clase</button>
                 </div>
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 mt-2">Archivo de Transcripción (.vtt o .txt):</label>
                 <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      accept=".vtt,.txt" 
                      onChange={handleTranscriptFileChange}
                      className="text-xs p-2 rounded border w-full bg-white"
                    />
                    {recTransFileName && <span className="text-[10px] text-emerald-600 font-bold whitespace-nowrap">{recTransFileName} ✓</span>}
                 </div>
              </div>
              <button className="w-full py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg cursor-pointer mb-4" onClick={() => setPortalTab('builder')}>
                  Panel de Módulos (Constructor Completo)
              </button>
              {(() => {
                const currentCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
                if (!currentCourse) {
                  return (
                    <div className="text-center py-12 space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500 italic">No hay cursados disponibles actualmente.</p>
                      <button
                        type="button"
                        onClick={() => setPortalTab('builder')}
                        className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Crear Primer Cursado +
                      </button>
                    </div>
                  );
                }

                const totalModules = currentCourse.modules ? currentCourse.modules.length : 0;
                const totalEnrolled = students.length;
                const currentCourseSubmissions = allSubmissions.filter(s => 
                  currentCourse.modules && currentCourse.modules.some(m => m.id === s.moduleId)
                );
                
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl">
                        <span className="text-[9px] text-indigo-600 font-extrabold uppercase tracking-wider">Matrícula Aula</span>
                        <div className="text-xl font-black text-slate-900 mt-1">{totalEnrolled} Alumnos</div>
                        <p className="text-[10px] text-slate-500 mt-0.5">En la academia virtual</p>
                      </div>
                      <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-2xl">
                        <span className="text-[9px] text-purple-600 font-extrabold uppercase tracking-wider">Plan de Estudio</span>
                        <div className="text-xl font-black text-slate-900 mt-1">{totalModules} Hitos</div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Módulos didácticos</p>
                      </div>
                      <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl">
                        <span className="text-[9px] text-amber-700 font-extrabold uppercase tracking-wider">Proyectos de Alumnos</span>
                        <div className="text-xl font-black text-slate-900 mt-1">
                          {currentCourseSubmissions.length} entregas, {currentCourseSubmissions.filter(s => s.status === 'pending').length} pnd.
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Para calificar en este curso</p>
                      </div>
                    </div>

                    {/* Student List Grid */}
                    <div className="space-y-4 pt-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100 flex items-center justify-between">
                        <span>Listado de Alumnos Registrados</span>
                        <span className="font-mono text-[10px] text-indigo-600">Notas Guardadas Automáticamente</span>
                      </h4>
                      
                      {/* Add Student UI */}                
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-2 items-center mb-4">
                        <input
                           type="text"
                           placeholder="Nombre del alumno..."
                           value={studentName}
                           onChange={(e) => setStudentName(e.target.value)}
                           className="flex-1 text-xs p-2 rounded border border-slate-200"
                        />
                        <button
                           onClick={handleCreateStudentClick}
                           className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                           Agregar
                        </button>
                      </div>

                      <div className="space-y-4">
                        {students.map(student => {
                          const completedInCourse = student.completedNodes.filter(nodeId => 
                            currentCourse.modules && currentCourse.modules.some(module => module.id === nodeId)
                          );
                          const progressPercentage = totalModules > 0 
                            ? Math.round((completedInCourse.length / totalModules) * 100) 
                            : 0;
                          
                          const studentCourseSubmissions = (student.submissions || []).filter(sub => 
                            currentCourse.modules && currentCourse.modules.some(module => module.id === sub.moduleId)
                          );

                          const goldCount = studentCourseSubmissions.filter(s => s.gradeBadge === 'Oro').length;
                          const silverCount = studentCourseSubmissions.filter(s => s.gradeBadge === 'Plata').length;
                          const bronzeCount = studentCourseSubmissions.filter(s => s.gradeBadge === 'Bronce').length;
                          const pendingCount = studentCourseSubmissions.filter(s => s.status === 'pending').length;

                          const isCourseCompleted = totalModules > 0 && completedInCourse.length >= totalModules;

                          return (
                            <div key={student.name} className="border border-slate-100 rounded-3xl p-5 hover:bg-slate-50/50 transition-all shadow-3xs space-y-4 bg-white">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  {student.avatar ? (
                                    <img 
                                      src={student.avatar} 
                                      alt={student.name} 
                                      className="w-10 h-10 rounded-full object-cover border border-slate-250 shadow-3xs shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-indigo-505 text-white font-bold flex items-center justify-center text-sm shrink-0 border border-slate-200 shadow-3xs">
                                      {student.name ? student.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                  )}
                                  <div>
                                    <h5 className="font-extrabold text-slate-800 text-sm leading-none flex items-center gap-2">
                                      {student.name}
                                      {isCourseCompleted && (
                                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                          EGRESADO ✓
                                        </span>
                                      )}
                                    </h5>
                                    <span className="text-[10px] text-slate-450 font-sans mt-1.5 block">
                                      Nivel de Alumno: <span className="font-bold text-slate-700">Lv.{student.level}</span> • Total general: <span className="font-bold text-indigo-650">{student.xp} XP</span> • Racha: {student.streak} racha 🔥
                                    </span>
                                  </div>
                                </div>

                                {/* Badges list */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {goldCount > 0 && (
                                    <span className="bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[9.5px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1">
                                      🥇 Oro: {goldCount}
                                    </span>
                                  )}
                                  {silverCount > 0 && (
                                    <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[9.5px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1">
                                      🥈 Plata: {silverCount}
                                    </span>
                                  )}
                                  {bronzeCount > 0 && (
                                    <span className="bg-amber-800/10 text-amber-900 border border-amber-800/20 text-[9.5px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1">
                                      🥉 Bronce: {bronzeCount}
                                    </span>
                                  )}
                                  {pendingCount > 0 && (
                                    <span className="bg-amber-550/10 text-amber-800 border border-amber-500/15 text-[9.5px] font-black px-2.5 py-1 rounded-lg animate-pulse uppercase tracking-wider">
                                      ⏳ Evaluables Pendientes: {pendingCount}
                                    </span>
                                  )}
                                  {studentCourseSubmissions.length === 0 && (
                                    <span className="text-[10px] text-slate-400 italic">No registra entregas en este cursado</span>
                                  )}
                                </div>
                              </div>

                              {/* Progress Slider Bar */}
                              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex justify-between text-[10px] text-slate-500 font-sans leading-none mb-1.5">
                                    <span className="font-semibold text-slate-400">Progreso del Syllabus</span>
                                    <span className="font-bold text-slate-800">{completedInCourse.length} de {totalModules} Módulos resueltos</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                                    <div 
                                      className="bg-indigo-600 h-2 rounded-full transition-all duration-550" 
                                      style={{ width: `${Math.min(100, Math.max(progressPercentage, (completedInCourse.length / Math.max(1, totalModules)) * 100))}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Certification trigger */}
                                <div className="shrink-0 flex items-center self-end">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedDiplomaStudent({ student, course: currentCourse })}
                                    className={`py-2.5 px-3.5 text-[11px] font-black rounded-xl flex items-center gap-1 transition-all border-0 ${
                                      isCourseCompleted 
                                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs cursor-pointer' 
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                                    disabled={!isCourseCompleted}
                                  >
                                    🎓 Certificar Alumno
                                  </button>
                                </div>
                              </div>

                              {/* Nested Assignment Grades Details */}
                              {studentCourseSubmissions.length > 0 && (
                                <div className="mt-3 bg-slate-50 border border-slate-200/40 rounded-2xl p-4 space-y-3">
                                  <span className="text-[9px] font-extrabold text-indigo-700 uppercase tracking-widest block">Detalle Histórico de Evaluaciones (Notas)</span>
                                  <div className="space-y-3 divide-y divide-slate-100">
                                    {studentCourseSubmissions.map((sub, sidx) => (
                                      <div key={sub.id} className={`pt-2.5 ${sidx === 0 ? 'pt-0' : 'pt-2.5'}`}>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                          <span className="text-xs font-bold text-slate-800">{sub.moduleTitle}</span>
                                          <div className="flex items-center gap-2">
                                            {sub.status === 'reviewed' ? (
                                              <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full ${
                                                sub.gradeBadge === 'Oro' ? 'bg-amber-500/10 text-amber-850' :
                                                sub.gradeBadge === 'Plata' ? 'bg-slate-200 text-slate-700' : 'bg-amber-800/10 text-amber-900'
                                              }`}>
                                                Insignia: {sub.gradeBadge} ★
                                              </span>
                                            ) : (
                                              <span className="text-[9.5px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                                                En cola de revisión
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <p className="text-[11px] text-slate-500 leading-normal mt-1 block italic">&ldquo;{sub.textContent}&rdquo;</p>
                                        {sub.feedback && (
                                          <div className="bg-white p-2.5 rounded-xl border border-slate-150 mt-1.5 text-[10.5px] text-indigo-900 leading-normal font-medium">
                                            <span className="font-bold text-indigo-950">Feedback del Profesor:</span> {sub.feedback}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {portalTab === 'builder' && (
          <div className="space-y-8">
            
            {/* Form 1: Cursado Builder */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <div>
                <span className="text-[10px] uppercase font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-sans tracking-wider">
                  PASO 1: CREAR CURSADO ACADÉMICO (COURSE)
                </span>
                <h3 className="font-extrabold text-slate-800 text-lg sm:text-xl font-display tracking-tight mt-2">
                  Ingresa los detalles del Cursado
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Las asignaturas o trayectos no formales de tu academia se listarán aquí de forma instantánea.
                </p>
              </div>

              <div className="flex items-center justify-between gap-6 pb-6 mb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg sm:text-lg font-display tracking-tight">
                    Constructor de Cursados
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const courseId = `course-${Date.now()}`;
                    onAddCourse({
                        id: courseId,
                        title: 'Gestión Documental',
                        category: 'Administración',
                        instructor: 'RAICEP Copiloto',
                        description: 'Curso automatizado de gestión documental',
                        modules: [],
                        recordedClasses: []
                    });
                    [1,2,3,4,5].forEach(i => {
                      onAddModuleToCourse(courseId, {                
                        id: `module-${Date.now()}-${i}`,
                        title: `Módulo ${i}: Tema de Gestión Documental ${i}`,
                        shortDesc: `Breve descripción de módulo ${i}`,
                        duration: '1 hora',
                        content: `Contenido extenso del módulo ${i}. Aquí podrías incluir detalles técnicos, normativas, y procedimientos.`,
                        challenge: `Desafío práctico ${i}`,
                        order: i,
                        status: i === 1 ? 'active' : 'locked',
                        xpReward: 100 * i,
                        imageUrl: 'https://images.unsplash.com/photo-1554415707-6e8dfc9306b9?auto=format&fit=crop&q=80',
                        moduleType: i % 2 === 0 ? 'quiz' : 'assignment',
                        quizQuestions: i % 2 === 0 ? [{
                            id: `q-${i}`,
                            question: `Pregunta de examen ${i}?`,
                            options: ['Opcion A', 'Opcion B', 'Opcion C'],
                            correctAnswerIndex: 0
                        }] : undefined,
                        resources: [
                          { name: `Normativa ${i} PDF`, url: 'https://example.com/normativa.pdf' },
                          { name: `Planilla ${i} Drive`, url: 'https://drive.google.com/...' }
                        ]
                      });
                    });
                  }}
                  className="py-2 px-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  🚀 Autogenerar Curso &quot;Gestión Documental&quot;
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Título del Cursado:</label>
                    <input
                      type="text"
                      required
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder="Ej: Fotografía Creativa o JavaScript Avanzado"
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Profesor / Mentor Titular:</label>
                    <input
                      type="text"
                      required
                      value={courseInstructor}
                      onChange={(e) => setCourseInstructor(e.target.value)}
                      placeholder="Ej: Sofia Silva (Ex-Google Designer)"
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Categoría Temática:</label>
                    <input
                      type="text"
                      required
                      value={courseCategory}
                      onChange={(e) => setCourseCategory(e.target.value)}
                      placeholder="Ej: Tecnología, Oficios, Arte, etc."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Slogan o Resumen Corto:</label>
                    <input
                      type="text"
                      required
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}
                      placeholder="Ej: Domina la narrativa visual experimental"
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Crear y Homologar Cursado</span>
                </button>

                {courseSuccess && (
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold justify-center pt-1">
                    <CheckCircle className="w-4 h-4" />
                    ¡Cursado Creado con éxito! Ahora puedes asignarle módulos en el constructor de abajo.
                  </div>
                )}
              </form>
            </div>

            {/* Form 2: Module Builder (Syllabus) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <div>
                <span className="text-[10px] uppercase font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-sans tracking-wider">
                  PASO 2: ASIGNAR MÓDULOS DEL TEMARIO (SYLLABUS MAP)
                </span>
                <h3 className="font-extrabold text-slate-800 text-lg sm:text-xl font-display tracking-tight mt-2">
                  Inyecta Módulos didácticos interactivamente
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Selecciona un Cursado creado y agrégale la ruta de hitos. Estos módulos aparecerán dinámicamente en el Journey Map del estudiante.
                </p>
              </div>

              <form onSubmit={handleCreateModule} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Seleccionar Cursado Destinatario:</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30 font-bold"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title} — de {c.instructor}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Título del Módulo:</label>
                    <input
                      type="text"
                      required
                      value={moduleTitle}
                      onChange={(e) => setModuleTitle(e.target.value)}
                      placeholder="Ej: Teoría de Color Orgánica"
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Resumen Corto para el Nodo:</label>
                    <input
                      type="text"
                      required
                      value={moduleShortDesc}
                      onChange={(e) => setModuleShortDesc(e.target.value)}
                      placeholder="Ej: Domina la paleta de pigmentos dinámicos"
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Duración Estimada de Aprendizaje:</label>
                    <input
                      type="text"
                      required
                      value={moduleDuration}
                      onChange={(e) => setModuleDuration(e.target.value)}
                      placeholder="Ej: 3 horas recomendadas"
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Puntos XP Recompensados:</label>
                    <input
                      type="number"
                      required
                      value={moduleXp}
                      onChange={(e) => setModuleXp(Number(e.target.value))}
                      placeholder="Ej: 200"
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Lección de la Academia (Contenido Temático):</label>
                  <textarea
                    required
                    value={moduleContent}
                    onChange={(e) => setModuleContent(e.target.value)}
                    placeholder="Escribe la explicación maestra aquí. Puedes estructurar conceptos clave."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Directiva del Desafío Práctico (Reto):</label>
                  <input
                    type="text"
                    required
                    value={moduleChallenge}
                    onChange={(e) => setModuleChallenge(e.target.value)}
                    placeholder="Ej: Saca una fotografía combinando espectros complementarios de luz roja y comparte..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                  />
                </div>

                {/* RECURSOS Y ARCHIVOS EXTERNOS DRIVER/PDF CON HELPER PARA EL DOCENTE */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-4">
                  <div className="flex gap-2 items-start text-xs text-slate-550 leading-normal">
                    <span className="p-1 px-2 rounded-lg bg-indigo-50 border border-indigo-150 text-indigo-650 font-bold shrink-0">💡 Ayuda</span>
                    <p>
                      **Subir Links o PDFs:** En lugar de subir pesados archivos PDF o planillas que ralenticen tu servidor, te aconsejamos alojarlos en **Google Drive / Dropbox** y pegar los enlaces directos aquí. Recuerda configurar el archivo en Drive para que sea público: **«Cualquier persona con el enlace puede ver»**. Los alumnos abrirán estos links externamente en una pestaña nueva.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div className="space-y-3">
                      <span className="text-[10px] uppercase font-black text-indigo-700 block tracking-widest">Enlace Teórico / PDF 1</span>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Nombre Descriptivo del PDF:</label>
                        <input
                          type="text"
                          value={res1Name}
                          onChange={(e) => setRes1Name(e.target.value)}
                          placeholder="Ej: Guía Teórica de Interacción PDF"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Enlace (URL de Google Drive o Web externa):</label>
                        <input
                          type="text"
                          value={res1Url}
                          onChange={(e) => setRes1Url(e.target.value)}
                          placeholder="https://drive.google.com/..."
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] uppercase font-black text-indigo-700 block tracking-widest">Enlace Secundario / Drive 2</span>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Nombre Descriptivo del Recurso:</label>
                        <input
                          type="text"
                          value={res2Name}
                          onChange={(e) => setRes2Name(e.target.value)}
                          placeholder="Ej: Plantilla Práctica del Módulo"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Enlace (URL externo):</label>
                        <input
                          type="text"
                          value={res2Url}
                          onChange={(e) => setRes2Url(e.target.value)}
                          placeholder="https://drive.google.com/..."
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <Layers className="w-4 h-4" />
                  <span>Inyectar este Módulo al Plan de Estudios</span>
                </button>

                {moduleSuccess && (
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold justify-center pt-1">
                    <CheckCircle className="w-4 h-4" />
                    ¡Módulo Inyectado con éxito! Se cargó en la secuencia del de diseño interactivo. Ya puedes verlo en "Ruta de Aprendizaje".
                  </div>
                )}
              </form>
            </div>

            {/* Form 3: Recorded Class Builder */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <div>
                <span className="text-[10px] uppercase font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 font-sans tracking-wider">
                  PASO 3: SUBIR CLASE GRABADA (ZOOM TO YOUTUBE)
                </span>
                <h3 className="font-extrabold text-slate-800 text-lg sm:text-xl font-display tracking-tight mt-2">
                  Publicar Clase Grabada
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sube la clase, vincula el video de YouTube y pega la transcripción sincronizada.
                </p>
              </div>

              <form onSubmit={handleCreateRecClass} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Título de la Clase:</label>
                    <input
                      type="text"
                      required
                      value={recTitle}
                      onChange={(e) => setRecTitle(e.target.value)}
                      placeholder="Ej: Clase 01: Introducción a la Gestión"
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Descripción Corta:</label>
                    <input
                      type="text"
                      required
                      value={recDesc}
                      onChange={(e) => setRecDesc(e.target.value)}
                      placeholder="Breve resumen de los temas vistos."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Link de YouTube:</label>
                    <input
                      type="text"
                      required
                      value={recUrl}
                      onChange={(e) => setRecUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Transcripción:</label>
                    <textarea
                      required
                      value={recTrans}
                      onChange={(e) => setRecTrans(e.target.value)}
                      placeholder="Pega aquí la transcripción de la clase..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                      rows={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <CloudLightning className="w-4 h-4" />
                  <span>Publicar Clase en Campus</span>
                </button>

                {recSuccess && (
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold justify-center pt-1">
                    <CheckCircle className="w-4 h-4" />
                    ¡Clase publicada correctamente!
                  </div>
                )}
              </form>
            </div>
            
            {/* Form 4: Taller Builder */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <div>
                <span className="text-[10px] uppercase font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-sans tracking-wider">
                  PASO 3: PROGRAMAR TALLER DE PULSO EN VIVO
                </span>
                <h3 className="font-extrabold text-slate-800 text-lg sm:text-xl font-display tracking-tight mt-2">
                  Programa un encuentro semanal
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Las academias modernas conectan en vivo con feedback bidireccional ágil. Genera una clase virtual con cupos limitados.
                </p>
              </div>

              <form onSubmit={handleCreateTaller} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre de la Sesión en Vivo:</label>
                    <input
                      type="text"
                      required
                      value={tallerTitle}
                      onChange={(e) => setTallerTitle(e.target.value)}
                      placeholder="Ej: FEEDBACK EXPRESS DE PORTAFOLIOS"
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Profesor / Líder de sesión:</label>
                    <input
                      type="text"
                      value={tallerInstructor}
                      onChange={(e) => setTallerInstructor(e.target.value)}
                      placeholder="Ej: Marcos Russo"
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha:</label>
                    <input
                      type="text"
                      required
                      value={tallerDate}
                      onChange={(e) => setTallerDate(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Hora de encuentro:</label>
                    <input
                      type="text"
                      required
                      value={tallerTime}
                      onChange={(e) => setTallerTime(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vacantes / Cupos de sala:</label>
                    <input
                      type="number"
                      required
                      value={tallerSpots}
                      onChange={(e) => setTallerSpots(Number(e.target.value))}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo de Evento:</label>
                  <div className="flex gap-4">
                    {(['Workshop', 'Feedback', 'Masterclass'] as const).map(type => (
                      <label key={type} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="tallerType"
                          checked={tallerType === type}
                          onChange={() => setTallerType(type)}
                          className="accent-indigo-600"
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-violet-800 hover:bg-violet-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Programar Encuentro de Pulso</span>
                </button>

                {tallerSuccess && (
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold justify-center pt-1">
                    <CheckCircle className="w-4 h-4" />
                    ¡Encuentro de pulso programado! Aparecerá listado en el Panel Principal del estudiante.
                  </div>
                )}
              </form>
            </div>

          </div>
        )}

        {portalTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 text-left">
            <div>
              <span className="text-[10px] uppercase font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-150 font-sans tracking-wide">
                PANEL DE CONFIGURACIÓN DE BRANDING MÓDULO SAAS
              </span>
              <h3 className="font-extrabold text-slate-800 text-lg sm:text-xl font-display tracking-tight mt-2.5">
                Ajustes de Identidad y Banner de Portada
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Personaliza en tiempo real los elementos visuales de tu campus cerrado. Guarda los cambios para actualizar el logotipo, la paleta de colores del campus y la cabecera («banner de arriba») en todo el sistema.
              </p>
            </div>

            <form onSubmit={handleUpdateSettingsSubmit} className="space-y-6 font-sans text-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre de la Academia:</label>
                  <input
                    type="text"
                    required
                    value={acadName}
                    onChange={(e) => setAcadName(e.target.value)}
                    placeholder="Ej: Escuela de Fotografía Creativa"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/40 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Subdominio Virtual Privado:</span>
                    <span className="text-[9px] font-mono text-emerald-600 lowercase font-bold">raicep virtual</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      value={acadSubdomain}
                      onChange={(e) => setAcadSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="ej-fotografia"
                      className="w-full pl-3 pr-24 py-3 text-xs rounded-xl border border-slate-201 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/40 font-mono font-bold text-slate-700"
                    />
                    <div className="absolute right-3 text-slate-400 pointer-events-none text-xs font-semibold select-none">
                      .raicep.app
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Logo o Ícono de la Academia (Emoji o link de imagen):</label>
                  <input
                    type="text"
                    required
                    value={acadLogoUrl}
                    onChange={(e) => setAcadLogoUrl(e.target.value)}
                    placeholder="Ej: 📷 o 🎓 o https://images..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-205 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/40"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Paleta / Tema Visual General:</label>
                  <select
                    value={acadThemeId}
                    onChange={(e) => setAcadThemeId(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-205 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/40 font-bold"
                  >
                    <option value="indigo">Universidad Índigo 🛡️</option>
                    <option value="violet">Violeta Tecnológico ⚡</option>
                    <option value="emerald">Verde Esmeralda Sustentable 🌿</option>
                    <option value="slate">Carbono Brutalista Moderno ⚙️</option>
                    <option value="rose">Rosa Estilismo Creativo 🌸</option>
                    <option value="amber">Ámbar Oro Cálido ✨</option>
                    <option value="cobalt">Cobalto Marítimo 🌊</option>
                  </select>
                </div>
              </div>

              {/* COVER BANNER SETTING WITH SPECIFIC HELP INSTRUCTIONS */}
              <div className="bg-slate-50 border border-slate-200 rounded-2.5xl p-5 space-y-4">
                <div className="flex gap-3 items-start">
                  <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                    <Palette className="w-5 h-5" />
                  </span>
                  <div>
                    <h5 className="text-[11.5px] font-extrabold uppercase text-slate-800 tracking-wider">¡Configura tu Banner Superior de Portada!</h5>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">
                      Pega a continuación el enlace directo de una foto o ilustración que quieras colocar en la cabecera superior de tu campus. Puedes utilizar imágenes rápidas de **Unsplash** (copiando la dirección de imagen de cualquier fotografía) o usar links compartidos públicos de tus repositorios.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">URL / Enlace de la Imagen del Banner:</label>
                  <input
                    type="text"
                    value={acadBannerUrl}
                    onChange={(e) => setAcadBannerUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80"
                    className="w-full text-xs p-3 rounded-xl border border-slate-201 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white placeholder:text-slate-400 font-sans font-medium"
                  />
                  <p className="text-[10px] text-slate-400 italic">
                    💡 **Consejo:** Dejar este campo vacío utilizará el header blanco limpio oficial. Si pegas un URL válido, se cargará un banner inmersivo de alta calidad con contraste mejorado automático.
                  </p>
                </div>

                {acadBannerUrl && (
                  <div className="rounded-xl border border-slate-200 overflow-hidden h-24 relative flex items-center justify-center">
                    <img 
                      src={acadBannerUrl} 
                      alt="Previsualización de Banner superior" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80';
                      }}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                      <span className="text-[9px] uppercase font-black text-rose-100 bg-slate-900/75 p-1.5 px-3 rounded-full tracking-wider border border-white/10">
                        Vista Previa de Cobertura
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all border-0 shadow-sm uppercase tracking-wide"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Aplicar Cambios Visuales y de Identidad</span>
                </button>

                {settingsSuccess && (
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold justify-center pt-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>¡Branding y Banner actualizados con éxito en la academia activa!</span>
                  </div>
                )}
              </div>
            </form>
          </div>
        )}

      </div>

      {/* DIPLOMA PREVIEW LIGHTBOX MODAL */}
      {selectedDiplomaStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 overflow-y-auto">
          <div className="bg-white border-8 border-indigo-950 rounded-3xl p-6 sm:p-10 max-w-2xl w-full text-center relative shadow-2xl font-serif space-y-6">
            <button 
              type="button"
              onClick={() => setSelectedDiplomaStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-xs font-bold bg-slate-100 hover:bg-slate-200 p-1 px-2.5 rounded-lg border-0 cursor-pointer font-sans"
            >
              Cerrar X
            </button>
            
            <div className="flex justify-center gap-4 items-center pb-2">
              <RaicepLogo size="sm" />
              <div className="h-6 w-px bg-slate-300" />
              <span className="font-sans text-[10px] uppercase font-black tracking-widest text-[#B08F26]">
                Acreditación Homologada
              </span>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-sans font-black uppercase text-indigo-900 tracking-widest block">
                CON DECORACIÓN DE EXCELENCIA
              </span>
              <h2 className="text-3xl font-bold text-slate-900 font-display italic">
                {selectedDiplomaStudent.student.name}
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-sans">
                Ha completado satisfactoriamente y con rendimiento sobresaliente la totalidad de los módulos didácticos y desafíos técnicos homologados de la asignatura:
              </p>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 bg-slate-50 py-3 px-4 rounded-xl max-w-lg mx-auto font-sans tracking-tight border border-slate-200/50">
                {selectedDiplomaStudent.course.title}
              </h3>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto font-sans leading-relaxed">
                Emitido bajo los lineamientos pedagógicos del Sistema de Homologación Institucional y Certificación Profesional RAICEP, con validez curricular.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100 font-sans">
              <div className="text-center">
                <span className="italic text-xs font-serif text-slate-800 block leading-none">Laura Bernal</span>
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest mt-1 block">Docente Titular</span>
              </div>
              <div className="text-center">
                <span className="text-xs font-black text-slate-900 block leading-none">CUSTODY-ID: {selectedDiplomaStudent.student.name.substring(0,3).toUpperCase()}-904</span>
                <span className="text-[9px] uppercase font-black text-[#B08F26] tracking-widest mt-1 block">Aprobación Sello Digital</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-white font-sans text-xs font-bold rounded-xl cursor-pointer border-0 shadow-sm"
              >
                Imprimir Certificado / Guardar PDF 🖨️
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
