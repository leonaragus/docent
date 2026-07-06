export type Language = 'en' | 'es';

export interface TranslationSet {
  // Navigation & Core
  appName: string;
  appSub: string;
  backToTeacher: string;
  googleLogin: string;
  googleLoggingIn: string;
  googleLogout: string;
  driveCritical: string;
  languageSelect: string;
  langEn: string;
  langEs: string;

  // Navigation Items
  navStudio: string;
  navNexus: string;
  navMagnet: string;
  navDocs: string;
  navNucleus: string;
  navOracle: string;
  navCampus: string;
  navAdmin: string;
  navCollapse: string;
  navExpand: string;
  navPro: string;
  navTeleprompter: string;

  // Studio (Teacher View)
  teacherWelcome: string;
  teacherWelcomeDesc: string;
  classroomClasses: string;
  onlyClassMsg: string;
  activeBadge: string;
  noDate: string;
  sortingFooter: string;
  teacherHeaderSub: string;
  activeClassHeader: string;
  editClassDetailsTip: string;
  untitledClass: string;
  metadataTeacher: string;
  metadataSubject: string;
  metadataClassroom: string;
  metadataSchool: string;
  previewStudentRoom: string;
  previewStudentRoomTip: string;
  editClassInfo: string;
  recordingInProgress: string;
  recorderPreview: string;
  screenSharingRecording: string;
  recordingCaptureMic: string;
  recorderReady: string;
  clickStartBelow: string;
  videoFilterEffect: string;
  filterOriginal: string;
  filterVintage: string;
  filterWarm: string;
  filterCool: string;
  filterMono: string;
  filterSketch: string;
  liveChaptersHeader: string;
  liveChaptersDesc: string;
  addChapterPlaceholder: string;
  addMarkerBtn: string;
  noMarkersAdded: string;

  // Campus (Student View)
  studentPortalTitle: string;
  studentPortalSub: string;
  studentFooter: string;
  syncViaFirestore: string;
  campusTitle: string;
  campusSub: string;
  campusWelcome: string;
  campusWelcomeDesc: string;
  campusStartCourse: string;
  campusResumeCourse: string;
  campusCourseContent: string;
  campusMyCourses: string;
  campusProgress: string;

  // Admin
  adminTitle: string;
  adminSub: string;
  adminDashboard: string;
  adminStudents: string;
  adminCourses: string;
  adminPayments: string;
  adminSettings: string;
  adminTotalRevenue: string;
  adminActiveStudents: string;
  adminActiveCourses: string;
  adminRecentPayments: string;
  adminSearchPlaceholder: string;
  adminAddStudent: string;
  adminAddCourse: string;
  adminSave: string;
  adminCancel: string;
  adminDelete: string;
  adminEdit: string;

  // Oracle
  oracleTitle: string;
  oracleSub: string;
  oracleChatPlaceholder: string;
  oracleSend: string;
  oracleExamCreator: string;
  oracleGenerateExam: string;
  oracleContentConverter: string;

  // Nexus
  nexusTitle: string;
  nexusSub: string;
  nexusGenerateBrand: string;
  nexusBrandName: string;
  nexusBrandColors: string;

  // Magnet
  magnetTitle: string;
  magnetSub: string;
  magnetCreateAd: string;
  magnetCreateFlyer: string;
  magnetCampaigns: string;
  writeAnswer: string;
  answerAllPrompt: string;
  submitAnswers: string;
}

export const translations: Record<Language, TranslationSet> = {
  en: {
    appName: 'Docent Suite',
    appSub: 'AI Studio for Educators',
    backToTeacher: 'Back to Teacher Studio',
    googleLogin: 'Sign in with Google',
    googleLoggingIn: 'Signing in...',
    googleLogout: 'Sign Out',
    driveCritical: 'Drive Critical (Full)',
    languageSelect: 'Language',
    langEn: 'English',
    langEs: 'Español',

    navStudio: 'Studio',
    navNexus: 'Nexus',
    navMagnet: 'Magnet',
    navDocs: 'PDF Toolkit',
    navNucleus: 'Nucleus',
    navOracle: 'Oracle',
    navCampus: 'Campus',
    navAdmin: 'Admin',
    navCollapse: 'Collapse',
    navExpand: 'Expand',
    navPro: 'Go Pro',
    navTeleprompter: 'Teleprompter',

    teacherWelcome: 'Welcome, Docent!',
    teacherWelcomeDesc: 'Select an active class below to start recording or configure it.',
    classroomClasses: 'Classes / Classrooms',
    onlyClassMsg: 'Default Master Class',
    activeBadge: 'ACTIVE',
    noDate: 'No date assigned',
    sortingFooter: 'Showing 1 class, sorted alphabetically.',
    teacherHeaderSub: 'Your private classroom transmission studio',
    activeClassHeader: 'Active Class details:',
    editClassDetailsTip: 'Click here to edit class details',
    untitledClass: 'Untitled Class',
    metadataTeacher: 'Teacher:',
    metadataSubject: 'Subject:',
    metadataClassroom: 'Grade:',
    metadataSchool: 'School:',
    previewStudentRoom: 'Preview Student Room',
    previewStudentRoomTip: 'This is what your students will see live',
    editClassInfo: 'Edit Class Information',
    recordingInProgress: 'Recording in progress...',
    recorderPreview: 'RECORDER PREVIEW',
    screenSharingRecording: 'Screen sharing is being recorded natively in the browser.',
    recordingCaptureMic: 'Audio capture included from your microphone.',
    recorderReady: 'Recorder Ready',
    clickStartBelow: 'Click on "Start Recording" below',
    videoFilterEffect: 'Video Filter / Effect',
    filterOriginal: 'Original',
    filterVintage: 'Vintage',
    filterWarm: 'Warm',
    filterCool: 'Cool',
    filterMono: 'Grayscale',
    filterSketch: 'High Contrast',
    liveChaptersHeader: 'Live Chapters / Markers',
    liveChaptersDesc: 'Add structured markers in real-time while teaching.',
    addChapterPlaceholder: 'New topic or concept...',
    addMarkerBtn: 'Add Marker',
    noMarkersAdded: 'No markers added yet. Add your first point!',

    studentPortalTitle: 'Student Portal',
    studentPortalSub: 'Live Interactive Session',
    studentFooter: 'Connected to Docent Server. Student Interface.',
    syncViaFirestore: 'Sync via Supabase Realtime',
    campusTitle: 'Docent Campus',
    campusSub: 'Student Learning Management System',
    campusWelcome: 'Welcome to your Campus',
    campusWelcomeDesc: 'Access all your courses, assignments, and grades here.',
    campusStartCourse: 'Start Course',
    campusResumeCourse: 'Resume Course',
    campusCourseContent: 'Course Content',
    campusMyCourses: 'My Courses',
    campusProgress: 'Your Progress',

    adminTitle: 'Docent Admin',
    adminSub: 'School Management ERP',
    adminDashboard: 'Dashboard',
    adminStudents: 'Students',
    adminCourses: 'Courses',
    adminPayments: 'Payments',
    adminSettings: 'Settings',
    adminTotalRevenue: 'Total Revenue',
    adminActiveStudents: 'Active Students',
    adminActiveCourses: 'Active Courses',
    adminRecentPayments: 'Recent Payments',
    adminSearchPlaceholder: 'Search...',
    adminAddStudent: 'Add Student',
    adminAddCourse: 'Add Course',
    adminSave: 'Save',
    adminCancel: 'Cancel',
    adminDelete: 'Delete',
    adminEdit: 'Edit',

    oracleTitle: 'Docent Oracle',
    oracleSub: 'AI Teaching Assistant',
    oracleChatPlaceholder: 'Ask Oracle anything about teaching...',
    oracleSend: 'Send',
    oracleExamCreator: 'Exam Creator',
    oracleGenerateExam: 'Generate Exam',
    oracleContentConverter: 'Content Converter',

    nexusTitle: 'Docent Nexus',
    nexusSub: 'Brand Identity Studio',
    nexusGenerateBrand: 'Generate Brand',
    nexusBrandName: 'Brand Name',
    nexusBrandColors: 'Brand Colors',

    magnetTitle: 'Docent Magnet',
    magnetSub: 'Marketing & Ads Generator',
    magnetCreateAd: 'Create Advertisement',
    magnetCreateFlyer: 'Create Flyer',
    magnetCampaigns: 'My Campaigns',
    writeAnswer: 'Write your answer...',
    answerAllPrompt: 'Please answer all questions before submitting.',
    submitAnswers: 'Submit Answers'
  },
  es: {
    appName: 'Docent Suite',
    appSub: 'Estudio de IA para Educadores',
    backToTeacher: 'Volver a Teacher Studio',
    googleLogin: 'Iniciar sesión con Google',
    googleLoggingIn: 'Iniciando sesión...',
    googleLogout: 'Cerrar Sesión',
    driveCritical: 'Drive Crítico (Lleno)',
    languageSelect: 'Idioma',
    langEn: 'English',
    langEs: 'Español',

    navStudio: 'Studio',
    navNexus: 'Nexus',
    navMagnet: 'Magnet',
    navDocs: 'PDF Toolkit',
    navNucleus: 'Nucleus',
    navOracle: 'Oracle',
    navCampus: 'Campus',
    navAdmin: 'Admin',
    navCollapse: 'Colapsar',
    navExpand: 'Expandir',
    navPro: 'Hazte Pro',
    navTeleprompter: 'Teleprompter',

    teacherWelcome: '¡Bienvenido, Docente!',
    teacherWelcomeDesc: 'Selecciona una clase activa a continuación para comenzar a grabar o configurarla.',
    classroomClasses: 'Clases / Aulas',
    onlyClassMsg: 'Clase Maestra por Defecto',
    activeBadge: 'ACTIVO',
    noDate: 'Sin fecha asignada',
    sortingFooter: 'Mostrando 1 clase, ordenado alfabéticamente.',
    teacherHeaderSub: 'Tu estudio de transmisión privado para el aula',
    activeClassHeader: 'Detalles de la Clase Activa:',
    editClassDetailsTip: 'Haz clic aquí para editar los detalles de la clase',
    untitledClass: 'Clase sin Título',
    metadataTeacher: 'Docente:',
    metadataSubject: 'Asignatura:',
    metadataClassroom: 'Grado:',
    metadataSchool: 'Colegio:',
    previewStudentRoom: 'Vista Previa (Alumno)',
    previewStudentRoomTip: 'Así es como verán tus estudiantes en vivo',
    editClassInfo: 'Editar Información de la Clase',
    recordingInProgress: 'Grabación en curso...',
    recorderPreview: 'VISTA PREVIA DE GRABACIÓN',
    screenSharingRecording: 'La pantalla compartida se está grabando nativamente en el navegador.',
    recordingCaptureMic: 'Captura de audio incluida desde tu micrófono.',
    recorderReady: 'Grabadora Lista',
    clickStartBelow: 'Haz clic en "Iniciar Grabación" abajo',
    videoFilterEffect: 'Filtro / Efecto de Video',
    filterOriginal: 'Original',
    filterVintage: 'Vintage',
    filterWarm: 'Cálido',
    filterCool: 'Frío',
    filterMono: 'Blanco y Negro',
    filterSketch: 'Alto Contraste',
    liveChaptersHeader: 'Marcadores / Capítulos en Vivo',
    liveChaptersDesc: 'Agrega marcadores estructurados en tiempo real mientras enseñas.',
    addChapterPlaceholder: 'Nuevo tema o concepto...',
    addMarkerBtn: 'Agregar Marcador',
    noMarkersAdded: 'Aún no se han agregado marcadores. ¡Agrega tu primer punto!',

    studentPortalTitle: 'Portal del Estudiante',
    studentPortalSub: 'Sesión Interactiva en Vivo',
    studentFooter: 'Conectado a Docent Server. Interfaz del Estudiante.',
    syncViaFirestore: 'Sincronización vía Supabase Realtime',
    campusTitle: 'Docent Campus',
    campusSub: 'Sistema de Gestión de Aprendizaje (LMS)',
    campusWelcome: 'Bienvenido a tu Campus',
    campusWelcomeDesc: 'Accede a todos tus cursos, tareas y calificaciones aquí.',
    campusStartCourse: 'Iniciar Curso',
    campusResumeCourse: 'Continuar Curso',
    campusCourseContent: 'Contenido del Curso',
    campusMyCourses: 'Mis Cursos',
    campusProgress: 'Tu Progreso',

    adminTitle: 'Docent Admin',
    adminSub: 'ERP de Gestión Escolar',
    adminDashboard: 'Panel Principal',
    adminStudents: 'Alumnos',
    adminCourses: 'Cursos',
    adminPayments: 'Pagos',
    adminSettings: 'Configuración',
    adminTotalRevenue: 'Ingresos Totales',
    adminActiveStudents: 'Alumnos Activos',
    adminActiveCourses: 'Cursos Activos',
    adminRecentPayments: 'Pagos Recientes',
    adminSearchPlaceholder: 'Buscar...',
    adminAddStudent: 'Agregar Alumno',
    adminAddCourse: 'Agregar Curso',
    adminSave: 'Guardar',
    adminCancel: 'Cancelar',
    adminDelete: 'Eliminar',
    adminEdit: 'Editar',

    oracleTitle: 'Docent Oracle',
    oracleSub: 'Asistente de Enseñanza IA',
    oracleChatPlaceholder: 'Pregúntale a Oracle sobre enseñanza...',
    oracleSend: 'Enviar',
    oracleExamCreator: 'Creador de Exámenes',
    oracleGenerateExam: 'Generar Examen',
    oracleContentConverter: 'Conversor de Contenido',

    nexusTitle: 'Docent Nexus',
    nexusSub: 'Estudio de Identidad de Marca',
    nexusGenerateBrand: 'Generar Marca',
    nexusBrandName: 'Nombre de la Marca',
    nexusBrandColors: 'Colores de la Marca',

    magnetTitle: 'Docent Magnet',
    magnetSub: 'Generador de Marketing y Anuncios',
    magnetCreateAd: 'Crear Anuncio',
    magnetCreateFlyer: 'Crear Flyer',
    magnetCampaigns: 'Mis Campañas',
    writeAnswer: 'Escribe tu respuesta...',
    answerAllPrompt: 'Por favor responde todas las preguntas antes de enviar.',
    submitAnswers: 'Enviar Respuestas'
  }
};
