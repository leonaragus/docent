import React, { useState, useEffect } from 'react';
import { 
  INITIAL_COURSES, 
  INITIAL_TALLERES, 
  INITIAL_FEED, 
  INITIAL_USER,
  INITIAL_STUDENTS
} from './mockData';
import { Course, TallerVivo, CommunityPost, UserState, Module, Academy, RecordedClass } from './types';
import { THEME_PRESETS } from './themePresets';
import AcademyHub from './components/AcademyHub';
import Dashboard from './components/Dashboard';
import LearningJourney from './components/LearningJourney';
import CommunityFeed from './components/CommunityFeed';
import AiTutor from './components/AiTutor';
import CreatorPortal from './components/CreatorPortal';
import LoginManager from './components/LoginManager';
import RaicepLogo from './components/RaicepLogo';
import Evaluations from './components/Evaluations';
import RecordedClasses from './components/RecordedClasses';
import { 
  Sparkles, 
  Compass, 
  Award, 
  GraduationCap, 
  MessageSquare,
  Clock,
  Flame,
  Zap,
  Info,
  Wrench,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Primary operational states of the platform
  const [activeTab, setActiveTab] = useState<'dashboard' | 'journey' | 'feed' | 'tutor' | 'creator' | 'evaluations' | 'recordings'>('dashboard');
  const [activeRole, setActiveRole] = useState<'student' | 'teacher'>('student');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  // Initialize unified list of academies from cache or defaults (RAICEP Certified Academies)
  const [academies, setAcademies] = useState<Academy[]>(() => {
    const cached = typeof window !== 'undefined' ? localStorage.getItem('edupulse_academies_list') : null;
    if (cached) return JSON.parse(cached);
    
    // Default initial list
    return [
      {
        id: 'diseno',
        subdomain: 'diseno',
        name: 'Instituto de Tecnología y Oficios RAICEP',
        description: 'Centro piloto modelo homologado para el dictado de cursos tecnológicos y disciplinas no formales con aval institucional.',
        themeId: 'indigo',
        bannerUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        courses: INITIAL_COURSES,
        talleres: INITIAL_TALLERES,
        feed: INITIAL_FEED,
        user: INITIAL_USER,
        students: INITIAL_STUDENTS
      }
    ];
  });

  const [activeAcademyId, setActiveAcademyId] = useState<string>(() => {
    const cached = typeof window !== 'undefined' ? localStorage.getItem('edupulse_active_academy_id') : null;
    return cached || 'diseno';
  });

  // Track the active selected course ID to support dynamic multi-course dashboards
  const [activeCourseId, setActiveCourseId] = useState<string | null>(() => {
    const cached = typeof window !== 'undefined' ? localStorage.getItem('raicep_active_course_id') : null;
    return cached;
  });

  // Derived active academy data block dynamically
  const activeAcademy = academies.find(a => a.id === activeAcademyId) || academies[0];
  const { courses, talleres, feed, user, students = INITIAL_STUDENTS } = activeAcademy;
  const activeTheme = THEME_PRESETS.find(t => t.id === activeAcademy.themeId) || THEME_PRESETS[0];

  const activeCourse = courses.find(c => c.id === activeCourseId) || courses[0] || null;

  // Helper template for brand-new empty student records
  const getNewUserState = (studentName: string): UserState => ({
    name: studentName,
    level: 1,
    xp: 0,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    streak: 1,
    completedNodes: [],
    activeNodeId: '',
    registeredTalleres: [],
    submissions: []
  });

  // Centralized unified updater helper
  const updateActiveAcademy = (updater: (academy: Academy) => Academy) => {
    const updatedList = academies.map(a => {
      if (a.id === activeAcademyId) {
        return updater(a);
      }
      return a;
    });
    setAcademies(updatedList);
    localStorage.setItem('edupulse_academies_list', JSON.stringify(updatedList));
  };

  const saveUserState = (updatedUser: UserState) => {
    updateActiveAcademy(academy => ({ ...academy, user: updatedUser }));
  };

  const saveFeedState = (updatedFeed: CommunityPost[]) => {
    updateActiveAcademy(academy => ({ ...academy, feed: updatedFeed }));
  };

  const saveTalleresState = (updatedTalleres: TallerVivo[]) => {
    updateActiveAcademy(academy => ({ ...academy, talleres: updatedTalleres }));
  };

  const saveCoursesState = (updatedCourses: Course[]) => {
    updateActiveAcademy(academy => ({ ...academy, courses: updatedCourses }));
  };

  const handleSelectStudent = (student: UserState) => {
    updateActiveAcademy(academy => {
      const currentStudents = academy.students || INITIAL_STUDENTS;
      const updatedStudents = currentStudents.map(s => s.name === academy.user.name ? { ...academy.user } : s);
      const foundStudent = updatedStudents.find(s => s.name === student.name) || student;
      return {
        ...academy,
        students: updatedStudents,
        user: foundStudent
      };
    });
  };

  const handleCreateStudent = (name: string, avatar: string, level: number, xp: number) => {
    const freshStudent: UserState = {
      ...getNewUserState(name),
      avatar,
      level,
      xp
    };
    updateActiveAcademy(academy => {
      const currentStudents = academy.students || INITIAL_STUDENTS;
      const updatedStudents = currentStudents.map(s => s.name === academy.user.name ? { ...academy.user } : s);
      return {
        ...academy,
        students: [...updatedStudents, freshStudent],
        user: freshStudent
      };
    });
  };

  // Academy management triggers
  const handleSelectAcademy = (id: string) => {
    setActiveAcademyId(id);
    localStorage.setItem('edupulse_active_academy_id', id);
    setSelectedModule(null); // clear module selection
  };

  const handleCreateAcademy = (newAcad: { name: string; subdomain: string; themeId: string; creatorName: string; logoUrl?: string }) => {
    const newAcademy: Academy = {
      id: `acad-${Date.now()}`,
      subdomain: newAcad.subdomain,
      name: newAcad.name,
      description: `Escuela virtual sincrónica y no formal de ${newAcad.name}`,
      themeId: newAcad.themeId,
      courses: [], // completely empty of courses initially!
      talleres: [], // completely empty of talleres!
      feed: [], // completely empty of feed posts!
      user: getNewUserState(newAcad.creatorName),
      logoUrl: newAcad.logoUrl
    };

    const updatedList = [...academies, newAcademy];
    setAcademies(updatedList);
    setActiveAcademyId(newAcademy.id);
    localStorage.setItem('edupulse_academies_list', JSON.stringify(updatedList));
    localStorage.setItem('edupulse_active_academy_id', newAcademy.id);
    setActiveTab('dashboard');
    setSelectedModule(null); // clear module selection
  };

  const handleDeleteAcademy = (id: string) => {
    if (academies.length <= 1) return;
    const updatedList = academies.filter(a => a.id !== id);
    setAcademies(updatedList);
    localStorage.setItem('edupulse_academies_list', JSON.stringify(updatedList));
    if (activeAcademyId === id) {
      const fallbackId = updatedList[0].id;
      setActiveAcademyId(fallbackId);
      localStorage.setItem('edupulse_active_academy_id', fallbackId);
    }
  };

  const handleUpdateAcademySettings = (settings: { name: string; subdomain: string; logoUrl: string; bannerUrl: string; themeId: string }) => {
    updateActiveAcademy(academy => ({
      ...academy,
      name: settings.name,
      subdomain: settings.subdomain,
      logoUrl: settings.logoUrl,
      bannerUrl: settings.bannerUrl,
      themeId: settings.themeId
    }));
  };

  // Handler to register/unregister from weekly workshops
  const handleRegisterTaller = (tallerId: string) => {
    const isRegistered = user.registeredTalleres.includes(tallerId);
    let updatedRegistered = [...user.registeredTalleres];

    const updatedTalleres = talleres.map(t => {
      if (t.id === tallerId) {
        const spotsMod = isRegistered ? 1 : -1;
        return {
          ...t,
          spotsLeft: Math.max(0, t.spotsLeft + spotsMod),
          isRegistered: !isRegistered
        };
      }
      return t;
    });

    if (isRegistered) {
      updatedRegistered = updatedRegistered.filter(id => id !== tallerId);
    } else {
      updatedRegistered.push(tallerId);
    }

    const updatedUser = {
      ...user,
      registeredTalleres: updatedRegistered,
      xp: user.xp + (isRegistered ? -10 : 40) // reward for registering to class
    };

    saveUserState(updatedUser);
    saveTalleresState(updatedTalleres);
  };

  // Handler to post projects or updates onto community interactive wall
  const handleAddPost = (text: string, category: CommunityPost['category'], image?: string) => {
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorName: user.name,
      authorAvatar: user.avatar,
      role: activeRole === 'teacher' ? 'teacher' : 'student',
      text,
      timestamp: 'Ahora mismo',
      image,
      category,
      reactions: { like: 0, fire: 0, brain: 0 },
      comments: []
    };

    const updatedFeed = [newPost, ...feed];
    const updatedUser = {
      ...user,
      xp: user.xp + 50 // high XP reward for active sharing
    };

    saveFeedState(updatedFeed);
    saveUserState(updatedUser);
  };

  // Handler to react with lovely emojis for social bonding
  const handleReact = (postId: string, reactionType: 'like' | 'fire' | 'brain') => {
    const updatedFeed = feed.map(post => {
      if (post.id === postId) {
        const updatedReactions = { ...post.reactions };
        updatedReactions[reactionType] += 1;
        return {
          ...post,
          reactions: updatedReactions
        };
      }
      return post;
    });
    saveFeedState(updatedFeed);
  };

  // Handler to reply to a social post
  const handleAddComment = (postId: string, commentText: string) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      authorName: user.name,
      authorAvatar: user.avatar,
      role: activeRole === 'teacher' ? ('teacher' as const) : ('student' as const),
      text: commentText,
      timestamp: 'Ahora mismo'
    };

    const updatedFeed = feed.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    });

    const updatedUser = {
      ...user,
      xp: user.xp + 20 // active feedback rewards
    };

    saveFeedState(updatedFeed);
    saveUserState(updatedUser);
  };

  // Handler to submit homework / project deliverables
  const handleSubmitChallenge = (moduleId: string, submissionText: string, link: string) => {
    // Search first across all courses
    let foundModule: Module | undefined = undefined;
    courses.forEach(c => {
      const match = c.modules.find(m => m.id === moduleId);
      if (match) foundModule = match;
    });

    if (!foundModule) return;

    const newSubmission = {
      id: `sub-${Date.now()}`,
      moduleId,
      moduleTitle: (foundModule as Module).title,
      textContent: submissionText,
      workUrl: link || undefined,
      submittedAt: 'Hace unos instantes',
      status: 'pending' as const,
      feedback: undefined,
      gradeBadge: undefined
    };

    // Calculate updated completed list + update next unlocking node logic
    const isAlreadyCompleted = user.completedNodes.includes(moduleId);
    const updatedCompleted = isAlreadyCompleted 
      ? user.completedNodes 
      : [...user.completedNodes, moduleId];

    // Find next module to unlock in active course
    const currentActiveCourse = courses.find(c => c.id === activeCourseId) || courses[0];
    let nextNodeId = user.activeNodeId;
    if (currentActiveCourse) {
      const sortedModules = [...currentActiveCourse.modules].sort((a,b) => a.order - b.order);
      const currentIndex = sortedModules.findIndex(m => m.id === moduleId);
      if (currentIndex !== -1 && currentIndex + 1 < sortedModules.length) {
        nextNodeId = sortedModules[currentIndex + 1].id;
      }
    }

    const updatedUser = {
      ...user,
      submissions: [...user.submissions, newSubmission],
      completedNodes: updatedCompleted,
      activeNodeId: nextNodeId
    };

    saveUserState(updatedUser);

    // Dynamic guide feedback trigger in 5 seconds if they do not wish to evaluate it themselves
    setTimeout(() => {
      updateActiveAcademy(currentAcad => {
        const currentUserState = currentAcad.user;
        const subIndex = currentUserState.submissions.findIndex(s => s.moduleId === moduleId && s.status === 'pending');
        if (subIndex === -1) return currentAcad; // already graded manually by user as Teacher

        const updatedSubs = [...currentUserState.submissions];
        const currentSub = updatedSubs[subIndex];

        updatedSubs[subIndex] = {
          ...currentSub,
          status: 'reviewed',
          feedback: `[Evaluación Sincrónica Especial]: ¡Excelente entrega! Cumple con la pauta de armonía visual y balance de masas. El enlace provisto funciona impecablemente.`,
          gradeBadge: 'Oro',
          xpAwarded: 200
        };

        const finalState = {
          ...currentUserState,
          submissions: updatedSubs,
          xp: currentUserState.xp + 200,
          level: currentUserState.xp + 200 >= 1000 ? Math.max(3, currentUserState.level) : currentUserState.level
        };

        return {
          ...currentAcad,
          user: finalState
        };
      });
    }, 6000);
  };

  // Creator Portal utilities
  const handleAddCourse = (newCourse: Course) => {
    const updated = [...courses, newCourse];
    saveCoursesState(updated);
  };

  const handleAddModuleToCourse = (courseId: string, newModule: Module) => {
    const updated = courses.map(c => {
      if (c.id === courseId) {
        // Ensure starting status is healthy
        const status = c.modules.length === 0 ? 'active' : 'locked';
        return {
          ...c,
          modules: [...c.modules, { ...newModule, status }]
        };
      }
      return c;
    });
    saveCoursesState(updated);
  };

  const handleAddRecordedClass = (courseId: string, newRecClass: RecordedClass) => {
    const updated = courses.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          recordedClasses: [...c.recordedClasses, newRecClass]
        };
      }
      return c;
    });
    saveCoursesState(updated);
  };

  const handleAddTaller = (newTaller: TallerVivo) => {
    const updated = [...talleres, newTaller];
    saveTalleresState(updated);
  };

  const handleGradeSubmission = (submissionId: string, badge: 'Bronce' | 'Plata' | 'Oro', feedback: string) => {
    updateActiveAcademy(academy => {
      const currentStudents = academy.students || INITIAL_STUDENTS;
      const updatedStudents = currentStudents.map(student => {
        const subIndex = student.submissions.findIndex(s => s.id === submissionId);
        if (subIndex === -1) return student;

        const updatedSubs = [...student.submissions];
        updatedSubs[subIndex] = {
          ...updatedSubs[subIndex],
          status: 'reviewed' as const,
          feedback,
          gradeBadge: badge,
          xpAwarded: 250
        };

        const newXp = student.xp + 250;
        const newLevel = newXp >= 1000 ? Math.max(student.level + 1, 3) : student.level;

        return {
          ...student,
          submissions: updatedSubs,
          xp: newXp,
          level: newLevel
        };
      });

      // Also update current active user if they are the graded student
      let updatedUser = academy.user;
      const activeUserInGraded = updatedStudents.find(s => s.name === academy.user.name);
      if (activeUserInGraded) {
        updatedUser = activeUserInGraded;
      }

      return {
        ...academy,
        students: updatedStudents,
        user: updatedUser
      };
    });
  };

  const handleResetData = () => {
    localStorage.removeItem('edupulse_academies_list');
    localStorage.removeItem('edupulse_active_academy_id');
    localStorage.removeItem('raicep_active_course_id');
    const initial = [
      {
        id: 'diseno',
        subdomain: 'diseno',
        name: 'Instituto de Tecnología y Oficios RAICEP',
        description: 'Centro piloto modelo homologado para el dictado de cursos tecnológicos y disciplinas no formales con aval institucional.',
        themeId: 'indigo',
        courses: INITIAL_COURSES,
        talleres: INITIAL_TALLERES,
        feed: INITIAL_FEED,
        user: INITIAL_USER
      }
    ];
    setAcademies(initial);
    setActiveAcademyId('diseno');
    setActiveCourseId(null);
    setActiveTab('dashboard');
    setActiveRole('student');
    setSelectedModule(null);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-slate-805 antialiased pb-12">
      
      {/* BACKGROUND DECORATIONS BIND TO THE DYNAMIC THEME COLOR */}
      <div className={`fixed top-0 left-12 w-96 h-96 bg-${activeTheme.primaryColor}-100/20 rounded-full blur-3xl -z-10`} />
      <div className={`fixed bottom-12 right-12 w-96 h-96 bg-${activeTheme.primaryColor}-50/30 rounded-full blur-3xl -z-10`} />

      {/* GLOBAL OFFICIAL BANNER (RAICEP ACCREDITATION SYSTEM) */}
      <div className={`bg-gradient-to-r from-slate-900 to-indigo-950 text-white text-center py-2.5 px-4 shadow-sm text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-3 relative font-sans`}>
        <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase">Sello de Homologación RAICEP</span>
        <span>Acreditación del Registro Argentino de Homologación Institucional y Certificación Profesional</span>
        <button 
          onClick={handleResetData}
          className="sm:absolute sm:right-4 text-[10px] underline hover:text-white/80 transition-colors cursor-pointer text-white font-medium border-0 bg-transparent"
        >
          Resetear Red de Academias
        </button>
      </div>

      {/* CORE FRAME LAYOUT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* MULTI-ACADEMY SELECTOR & BRANDING ENGINE */}
        <AcademyHub 
          academies={academies}
          activeAcademyId={activeAcademyId}
          onSelectAcademy={handleSelectAcademy}
          onCreateAcademy={handleCreateAcademy}
          onDeleteAcademy={handleDeleteAcademy}
          activeTheme={activeTheme}
        />

        {/* HEADER BRAND & NAVIGATION SYSTEM */}
        <header className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pb-6 mb-2 border-b border-slate-100">
          
          {/* OFICIAL RAICEP INSTITUTIONAL LOGO */}
          <div className="flex items-center gap-3">
            <RaicepLogo size="md" />
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div className="hidden sm:block">
              <span className={`text-[10px] font-black px-2.5 py-1 bg-slate-100/80 text-slate-700 rounded-full border border-slate-200 uppercase tracking-wider`}>
                {activeAcademy.subdomain}.raicep.app
              </span>
            </div>
          </div>

          {/* LOGIN & ROLE SWITCHER INTEGRATED DIRECTLY */}
          <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
            <LoginManager 
              user={user} 
              onUpdateUser={saveUserState} 
              activeRole={activeRole} 
              onChangeRole={(role) => {
                setActiveRole(role);
                if (role === 'teacher') {
                  setActiveTab('creator');
                } else if (activeTab === 'creator') {
                  setActiveTab('dashboard');
                }
              }} 
              onResetData={handleResetData}
              students={students}
              onSelectStudent={handleSelectStudent}
              onCreateStudent={handleCreateStudent}
            />
            
            <div className="h-6 w-px bg-slate-150 hidden md:block" />

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs border border-white">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="text-left leading-none">
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]" title={activeAcademy.name}>{activeAcademy.name}</p>
                  <span className="text-[9px] text-slate-450 font-medium font-sans uppercase">
                    {activeRole === 'teacher' ? 'Docente / Gestor 🛡️' : 'Acceso Privado'}
                  </span>
                </div>
              </div>

              <div className={`${activeTheme.accentBg} border ${activeTheme.accentBorder} rounded-lg px-2.5 py-1 text-center font-sans hidden sm:block`}>
                <span className={`${activeTheme.accentText} font-extrabold text-xs`}>⚡ {user.xp} XP</span>
              </div>
            </div>
          </div>
        </header>

        {/* INTERACTIVE COMPONENT TAB BUTTONS */}
        <nav className="flex flex-wrap gap-2 p-1.5 bg-slate-110/80 backdrop-blur-md rounded-2xl border border-slate-200/40 mb-2 max-w-fit">
          {[
            { id: 'dashboard', label: 'Mi Panel de Control', icon: Compass },
            { id: 'journey', label: 'Ruta de Aprendizaje (Map)', icon: GraduationCap },
            { id: 'evaluations', label: 'Evaluaciones', icon: CheckCircle2 },
            { id: 'recordings', label: 'Clases Grabadas', icon: Clock },
            { id: 'feed', label: 'El Muro Social de Pulso', icon: MessageSquare },
            { id: 'tutor', label: 'Asistente IA Kairós', icon: Sparkles },
            ...(activeRole === 'teacher' ? [{ id: 'creator', label: 'Constructor de Cursados 🛠️', icon: Wrench }] : [])
          ].map(tab => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all border-0 ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isActive ? activeTheme.accentText : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.id === 'tutor' && (
                  <span className={`w-1.5 h-1.5 rounded-full bg-${activeTheme.primaryColor}-500 animate-pulse`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* GUIDED WELCOME TOOLTIP BAR (DYNAMICS BASED ON EMPTY COHORTS) */}
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-3xl border ${activeTheme.accentBorder} ${activeTheme.secondaryBg} flex flex-col md:flex-row gap-4 items-start justify-between`}
          >
            <div className="flex gap-3.5 items-start">
              <span className={`p-2 ${activeTheme.accentBg} ${activeTheme.accentText} rounded-xl font-bold text-base shadow-3xs shrink-0 select-none`}>
                {courses.length === 0 ? '🌿' : '✨'}
              </span>
              <div className="space-y-1 text-left">
                {courses.length === 0 ? (
                  <>
                    <h4 className="text-medium text-xs font-black text-slate-900 font-display uppercase tracking-wider">
                      ¡Tu Nueva Academia de la Red está Nueva, Vacía y Lista!
                    </h4>
                    <p className="text-slate-650 text-xs leading-relaxed max-w-4xl font-sans">
                      Has creado la academia <span className="font-bold text-slate-900">&ldquo;{activeAcademy.name}&rdquo;</span> simulada en <span className="font-bold font-mono text-indigo-600">https://{activeAcademy.subdomain}.raicep.app</span>.
                      Como no tiene ningún curso de momento, sigue estos pasos para iniciar tu propio pensum académico:
                      <br />
                      1. Activa el rol de **Docente / Gestor 🛡️** arriba en el selector de roles corporativos.
                      <br /> 
                      2. Verás habilitarse el tab especial **&ldquo;Constructor de Cursados 🛠️&rdquo;**. Haz clic allí.
                      <br />
                      3. Presiona **&ldquo;+ Crear Nuevo Cursado&rdquo;**, configúrale un título, y ve agregando módulos, syllabus, desafíos técnicos, o programa talleres presenciales/virtuales con total libertad.
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="text-medium text-xs font-black text-slate-900 font-display uppercase tracking-wider">
                      Centro de Navegación: {activeAcademy.name}
                    </h4>
                    <p className="text-slate-650 text-xs leading-relaxed max-w-4xl font-sans">
                      Estás navegando en la academia <span className="font-bold text-slate-900">{activeAcademy.name}</span>. 
                      Para simular o crear una academia paralela con colores o currículos aislados, haz clic en **&ldquo;Cambiar o Crear Academia&rdquo;** en el selector superior.
                      Sigue la ruta, compite por XP completando hitos, y chatea con nuestro Tutor Kairós.
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="shrink-0 flex items-center self-center bg-white border border-slate-200 rounded-2xl px-3.5 py-2">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${activeTheme.accentText}`}>
                Identidad: {activeTheme.name}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* MAIN BODY COMPONENT SWITCHBOARD WITH STAGGER ENTRY */}
        <main className="min-h-[480px]">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Dashboard 
                  user={user} 
                  talleres={talleres} 
                  courses={courses}
                  activeCourseId={activeCourse?.id || null}
                  onSelectCourse={(courseId) => {
                    setActiveCourseId(courseId);
                    localStorage.setItem('raicep_active_course_id', courseId);
                  }}
                  activeAcademy={activeAcademy}
                  activeTheme={activeTheme}
                  activeRole={activeRole}
                  onRegisterTaller={handleRegisterTaller}
                  onNavigateToJourney={() => {
                    setActiveTab('journey');
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  onNavigateToTab={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'journey' && (
              <motion.div
                key="journey"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <LearningJourney
                  modules={activeCourse?.modules || []}
                  userCompletedNodes={user.completedNodes}
                  userActiveNodeId={user.activeNodeId}
                  selectedModule={selectedModule}
                  onSelectNode={(mod) => setSelectedModule(mod)}
                  onSubmitChallenge={handleSubmitChallenge}
                  submissions={user.submissions}
                  activeRole={activeRole}
                  activeCourseId={activeCourse?.id || null}
                  onAddModuleToCourse={handleAddModuleToCourse}
                  onUpdateModules={(updatedModules) => {
                    if (activeCourse) {
                      const updatedCourses = courses.map(c => c.id === activeCourse.id ? { ...c, modules: updatedModules } : c);
                      saveCoursesState(updatedCourses);
                      // Update the selected module in state if it was replaced
                      if (selectedModule) {
                        const refreshed = updatedModules.find(m => m.id === selectedModule.id);
                        if (refreshed) {
                          setSelectedModule(refreshed);
                        }
                      }
                    }
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'feed' && (
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CommunityFeed
                  posts={feed}
                  currentUser={{ name: user.name, avatar: user.avatar }}
                  onAddPost={handleAddPost}
                  onReact={handleReact}
                  onAddComment={handleAddComment}
                />
              </motion.div>
            )}

            {activeTab === 'evaluations' && (
              <motion.div
                key="evaluations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Evaluations submissions={user.submissions} />
              </motion.div>
            )}

            {activeTab === 'recordings' && (
              <motion.div
                key="recordings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <RecordedClasses classes={activeCourse?.recordedClasses || []} />
              </motion.div>
            )}

            {activeTab === 'tutor' && (
              <motion.div
                key="tutor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-4 flex gap-3 items-start max-w-4xl">
                  <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-indigo-900 font-sans">IA Conectada de Extremo a Extremo</h5>
                    <p className="text-[11px] text-indigo-800 leading-normal mt-0.5">
                      Este copiloto es real y está conectado a los servidores del backend. Se comunica con el modelo **gemini-3.5-flash** de Google AI Studio. Pruébalo pidiéndole un test interactivo en español.
                    </p>
                  </div>
                </div>
                <AiTutor />
              </motion.div>
            )}

            {activeTab === 'creator' && (
              <motion.div
                key="creator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CreatorPortal
                  courses={courses}
                  talleres={talleres}
                  students={students}
                  activeAcademy={activeAcademy}
                  onAddCourse={handleAddCourse}
                  onAddModuleToCourse={handleAddModuleToCourse}
                  onAddRecordedClass={handleAddRecordedClass}
                  onAddTaller={handleAddTaller}
                  onGradeSubmission={handleGradeSubmission}
                  onUpdateAcademySettings={handleUpdateAcademySettings}
                  onCreateStudent={handleCreateStudent}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* FOOTER */}
        <footer className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-sans">
          <p>© 2026 RAICEP Sistema de Homologación Institucional y Certificación Profesional. Espacio de Co-aprendizaje Colaborativo Privado.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 transition-colors">Normas de la Comunidad</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="hover:text-slate-600 transition-colors">Centro de Soporte</span>
            <span className="w-px h-3 bg-slate-200" />
            <span className="bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded font-black select-none">VIOLET-INDIGO STYLE</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
