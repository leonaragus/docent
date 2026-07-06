import React, { useState, useEffect } from 'react';
import { Course, Student, Payment } from './types';
import { 
  INITIAL_COURSES, 
  INITIAL_STUDENTS, 
  INITIAL_PAYMENTS, 
  MONTH_NAMES 
} from './data/mockData';
import StatsGrid from './components/StatsGrid';
import StudentGrid from './components/StudentGrid';
import DateTraveler from './components/DateTraveler';
import CourseModal from './components/CourseModal';
import StudentModal from './components/StudentModal';
import PaymentDetailsModal from './components/PaymentDetailsModal';
import AlertsModal from './components/AlertsModal';
import HeaderCustomizeModal from './components/HeaderCustomizeModal';
import LoginScreen from './components/LoginScreen';
import { ColorThemeId, COLOR_THEMES } from './theme';

import { 
  auth, 
  signOut, 
  onAuthStateChanged,
  dbSaveCourse,
  dbDeleteCourse,
  dbSaveStudent,
  dbDeleteStudent,
  dbSavePayment,
  dbDeletePayment,
  syncLocalDataToFirebase,
  loadUserData,
  clearAllUserDataInFirestore,
  saveUserConfig
} from './lib/firebase';

import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  AlertCircle, 
  Sparkles, 
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Settings,
  User,
  Hourglass,
  AlertTriangle,
  LogOut,
  Loader2
} from 'lucide-react';

export default function App() {
  // --- AUTH STATE & LOADING ---
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // --- STATE INITIALIZATION (Controlled by Firebase) ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [simulatedDate, setSimulatedDate] = useState<Date>(new Date(2026, 5, 15));
  const [institutionName, setInstitutionName] = useState('Instituto Superior de Especialidades');
  const [institutionSubtitle, setInstitutionSubtitle] = useState('Sede Central • Gestión de cobros y mora automatizada');
  const [institutionLogo, setInstitutionLogo] = useState('🎓');
  const [colorTheme, setColorTheme] = useState<ColorThemeId>('indigo');

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  // --- AUTH OBSERVER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.uid);
      } else {
        setCurrentUser(null);
        // Clear react states
        setCourses([]);
        setStudents([]);
        setPayments([]);
      }
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // --- LOAD FIRESTORE DATA ON AUTH ---
  useEffect(() => {
    if (!currentUser) return;

    if (currentUser === 'local-user') {
      const localCourses = localStorage.getItem('edugrid_courses') ? JSON.parse(localStorage.getItem('edugrid_courses')!) : INITIAL_COURSES;
      const localStudents = localStorage.getItem('edugrid_students') ? JSON.parse(localStorage.getItem('edugrid_students')!) : INITIAL_STUDENTS;
      const localPayments = localStorage.getItem('edugrid_payments') ? JSON.parse(localStorage.getItem('edugrid_payments')!) : INITIAL_PAYMENTS;
      const localName = localStorage.getItem('edugrid_inst_name') || 'Instituto Superior de Especialidades';
      const localSubtitle = localStorage.getItem('edugrid_inst_subtitle') || 'Sede Central • Gestión de cobros y mora automatizada';
      const localLogo = localStorage.getItem('edugrid_inst_logo') || '🎓';
      const localSimDateStr = localStorage.getItem('edugrid_simulated_date') || new Date(2026, 5, 15).toISOString();
      const localTheme = (localStorage.getItem('edugrid_theme') as ColorThemeId) || 'indigo';

      setCourses(localCourses);
      setStudents(localStudents);
      setPayments(localPayments);
      setInstitutionName(localName);
      setInstitutionSubtitle(localSubtitle);
      setInstitutionLogo(localLogo);
      setSimulatedDate(new Date(localSimDateStr));
      setColorTheme(localTheme);
      return;
    }

    const fetchAndSyncData = async () => {
      setLoadingData(true);
      try {
        const { courses: dbCourses, students: dbStudents, payments: dbPayments, config } = await loadUserData(currentUser);
        
        if (config || dbCourses.length > 0) {
          // User already has data in Firestore! Let's load it.
          setCourses(dbCourses || []);
          setStudents(dbStudents || []);
          setPayments(dbPayments || []);
          if (config) {
            setInstitutionName(config.institutionName || 'Instituto Superior de Especialidades');
            setInstitutionSubtitle(config.institutionSubtitle || 'Sede Central • Gestión de cobros y mora automatizada');
            setInstitutionLogo(config.institutionLogo || '🎓');
            setColorTheme((config.colorTheme || 'indigo') as ColorThemeId);
            if (config.simulatedDate) {
              setSimulatedDate(new Date(config.simulatedDate));
            }
          }
        } else {
          // New user, let's sync their current local state (from localStorage or defaults) to Firestore so they have demo data!
          const localCourses = localStorage.getItem('edugrid_courses') ? JSON.parse(localStorage.getItem('edugrid_courses')!) : INITIAL_COURSES;
          const localStudents = localStorage.getItem('edugrid_students') ? JSON.parse(localStorage.getItem('edugrid_students')!) : INITIAL_STUDENTS;
          const localPayments = localStorage.getItem('edugrid_payments') ? JSON.parse(localStorage.getItem('edugrid_payments')!) : INITIAL_PAYMENTS;
          const localName = localStorage.getItem('edugrid_inst_name') || 'Instituto Superior de Especialidades';
          const localSubtitle = localStorage.getItem('edugrid_inst_subtitle') || 'Sede Central • Gestión de cobros y mora automatizada';
          const localLogo = localStorage.getItem('edugrid_inst_logo') || '🎓';
          const localSimDateStr = localStorage.getItem('edugrid_simulated_date') || new Date(2026, 5, 15).toISOString();
          const localTheme = (localStorage.getItem('edugrid_theme') as ColorThemeId) || 'indigo';

          const initialConfig = {
            institutionName: localName,
            institutionSubtitle: localSubtitle,
            institutionLogo: localLogo,
            simulatedDate: localSimDateStr,
            colorTheme: localTheme
          };

          await syncLocalDataToFirebase(currentUser, localCourses, localStudents, localPayments, initialConfig);
          
          setCourses(localCourses);
          setStudents(localStudents);
          setPayments(localPayments);
          setInstitutionName(localName);
          setInstitutionSubtitle(localSubtitle);
          setInstitutionLogo(localLogo);
          setSimulatedDate(new Date(localSimDateStr));
          setColorTheme(localTheme);
        }
      } catch (err) {
        console.error("Error loading user data from Firestore:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchAndSyncData();
  }, [currentUser]);

  // --- LOCAL FALLBACK SAVES (Optional, but keeps local in sync) ---
  useEffect(() => {
    if (courses.length > 0) {
      localStorage.setItem('edugrid_courses', JSON.stringify(courses));
    }
  }, [courses]);

  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem('edugrid_students', JSON.stringify(students));
    }
  }, [students]);

  useEffect(() => {
    if (payments.length > 0) {
      localStorage.setItem('edugrid_payments', JSON.stringify(payments));
    }
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('edugrid_simulated_date', simulatedDate.toISOString());
  }, [simulatedDate]);

  useEffect(() => {
    localStorage.setItem('edugrid_theme', colorTheme);
    document.documentElement.setAttribute('data-theme', colorTheme);
    document.body.setAttribute('data-theme', colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    localStorage.setItem('edugrid_inst_name', institutionName);
  }, [institutionName]);

  useEffect(() => {
    localStorage.setItem('edugrid_inst_subtitle', institutionSubtitle);
  }, [institutionSubtitle]);

  useEffect(() => {
    localStorage.setItem('edugrid_inst_logo', institutionLogo);
  }, [institutionLogo]);

  // --- LOGOUT HANDLER ---
  const handleLogout = async () => {
    if (window.confirm('¿Está seguro de cerrar sesión?')) {
      if (currentUser === 'local-user') {
        setCurrentUser(null);
        setCourses([]);
        setStudents([]);
        setPayments([]);
        return;
      }
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Error closing session:', err);
      }
    }
  };

  // --- MODAL STATES ---
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false);
  const [selectedStudentForPayments, setSelectedStudentForPayments] = useState<Student | null>(null);
  const [selectedCourseForPayments, setSelectedCourseForPayments] = useState<Course | null>(null);

  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);

  // --- HANDLERS: COURSES ---
  const handleOpenNewCourse = () => {
    setCourseToEdit(null);
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering course filter toggle
    setCourseToEdit(course);
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (savedCourse: Course) => {
    const exists = courses.some(c => c.id === savedCourse.id);
    if (exists) {
      setCourses(prev => prev.map(c => c.id === savedCourse.id ? savedCourse : c));
    } else {
      setCourses(prev => [...prev, savedCourse]);
    }
    if (currentUser && currentUser !== 'local-user') {
      try {
        await dbSaveCourse(currentUser, savedCourse);
      } catch (err) {
        console.error("Error saving course to Firestore:", err);
      }
    }
  };

  const handleDeleteCourse = async (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Está seguro de eliminar este cursado? Se desasignarán los alumnos y se borrarán sus pagos.')) {
      setCourses(prev => prev.filter(c => c.id !== courseId));
      
      const studentsInCourse = students.filter(s => s.courseId === courseId);
      const studentIds = studentsInCourse.map(s => s.id);
      
      setPayments(prev => prev.filter(p => !studentIds.includes(p.studentId)));
      setStudents(prev => prev.filter(s => s.courseId !== courseId));
      
      if (selectedCourseId === courseId) {
        setSelectedCourseId('');
      }

      if (currentUser && currentUser !== 'local-user') {
        try {
          await dbDeleteCourse(currentUser, courseId);
          for (const s of studentsInCourse) {
            await dbDeleteStudent(currentUser, s.id);
          }
          const paymentsToDelete = payments.filter(p => studentIds.includes(p.studentId));
          for (const p of paymentsToDelete) {
            await dbDeletePayment(currentUser, p.id);
          }
        } catch (err) {
          console.error("Error deleting course and nested items from Firestore:", err);
        }
      }
    }
  };

  // --- HANDLERS: STUDENTS ---
  const handleOpenNewStudent = () => {
    setStudentToEdit(null);
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = async (studentData: { name: string; email: string; phone: string; courseId: string; status: 'active' | 'suspended' | 'graduated' }) => {
    const targetCourse = courses.find(c => c.id === studentData.courseId);
    if (!targetCourse) return;

    if (studentToEdit) {
      // Edit existing student
      const updatedStudent: Student = {
        ...studentToEdit,
        ...studentData
      };

      setStudents(prev => prev.map(s => s.id === studentToEdit.id ? updatedStudent : s));

      if (currentUser && currentUser !== 'local-user') {
        try {
          await dbSaveStudent(currentUser, updatedStudent);
        } catch (err) {
          console.error("Error saving student to Firestore:", err);
        }
      }

      // If assigned course changed, recreate payments
      if (studentToEdit.courseId !== studentData.courseId) {
        // Delete old course payments
        const oldPayments = payments.filter(p => p.studentId === studentToEdit.id);
        setPayments(prev => prev.filter(p => p.studentId !== studentToEdit.id));
        
        // Generate new course payments
        const newPayments: Payment[] = Array.from({ length: targetCourse.duration }).map((_, idx) => ({
          id: `pay-${studentToEdit.id}-${idx}-${Date.now()}`,
          studentId: studentToEdit.id,
          monthIndex: idx,
          status: 'pending'
        }));
        setPayments(prev => [...prev, ...newPayments]);

        if (currentUser && currentUser !== 'local-user') {
          try {
            for (const p of oldPayments) {
              await dbDeletePayment(currentUser, p.id);
            }
            for (const p of newPayments) {
              await dbSavePayment(currentUser, p);
            }
          } catch (err) {
            console.error("Error updating student payments in Firestore:", err);
          }
        }
      }
    } else {
      // Create new student
      const newStudentId = `student-${Date.now()}`;
      const newStudent: Student = {
        id: newStudentId,
        name: studentData.name,
        email: studentData.email,
        phone: studentData.phone,
        courseId: studentData.courseId,
        status: studentData.status,
        joinedDate: simulatedDate.toISOString()
      };

      setStudents(prev => [...prev, newStudent]);

      // Automatically generate pending payments for each month index of the course duration
      const newPayments: Payment[] = Array.from({ length: targetCourse.duration }).map((_, idx) => ({
        id: `pay-${newStudentId}-${idx}-${Date.now()}`,
        studentId: newStudentId,
        monthIndex: idx,
        status: 'pending'
      }));
      setPayments(prev => [...prev, ...newPayments]);

      if (currentUser && currentUser !== 'local-user') {
        try {
          await dbSaveStudent(currentUser, newStudent);
          for (const p of newPayments) {
            await dbSavePayment(currentUser, p);
          }
        } catch (err) {
          console.error("Error creating student and payments in Firestore:", err);
        }
      }
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (window.confirm('¿Está seguro de eliminar a este alumno del cursado? Esta acción no se puede deshacer y borrará su historial de cuotas.')) {
      setStudents(prev => prev.filter(s => s.id !== studentId));
      const paymentsToDelete = payments.filter(p => p.studentId === studentId);
      setPayments(prev => prev.filter(p => p.studentId !== studentId));

      if (currentUser && currentUser !== 'local-user') {
        try {
          await dbDeleteStudent(currentUser, studentId);
          for (const p of paymentsToDelete) {
            await dbDeletePayment(currentUser, p.id);
          }
        } catch (err) {
          console.error("Error removing student and payments from Firestore:", err);
        }
      }
    }
  };

  // --- HANDLERS: PAYMENTS ---
  const handleOpenPayments = (student: Student, course: Course) => {
    setSelectedStudentForPayments(student);
    setSelectedCourseForPayments(course);
    setIsPaymentsModalOpen(true);
  };

  const handleUpdatePayment = async (updatedPayment: Payment) => {
    setPayments(prev => {
      const exists = prev.some(p => p.id === updatedPayment.id);
      if (exists) {
        return prev.map(p => p.id === updatedPayment.id ? updatedPayment : p);
      } else {
        return [...prev, updatedPayment];
      }
    });

    if (currentUser && currentUser !== 'local-user') {
      try {
        await dbSavePayment(currentUser, updatedPayment);
      } catch (err) {
        console.error("Error updating payment in Firestore:", err);
      }
    }
  };

  // --- DEV TOOL: RESET ALL TO MOCK DATA ---
  const handleResetAppToDefault = async () => {
    if (window.confirm('¿Desea restaurar todos los datos a la configuración demostrativa original? Se perderán sus cambios actuales.')) {
      localStorage.removeItem('edugrid_courses');
      localStorage.removeItem('edugrid_students');
      localStorage.removeItem('edugrid_payments');
      localStorage.removeItem('edugrid_simulated_date');
      
      setCourses(INITIAL_COURSES);
      setStudents(INITIAL_STUDENTS);
      setPayments(INITIAL_PAYMENTS);
      setSimulatedDate(new Date(2026, 5, 15));
      setSelectedCourseId('');
      setInstitutionName('Instituto Superior de Especialidades');
      setInstitutionSubtitle('Sede Central • Gestión de cobros y mora automatizada');
      setInstitutionLogo('🎓');

      if (currentUser && currentUser !== 'local-user') {
        setLoadingData(true);
        try {
          await syncLocalDataToFirebase(currentUser, INITIAL_COURSES, INITIAL_STUDENTS, INITIAL_PAYMENTS, {
            institutionName: 'Instituto Superior de Especialidades',
            institutionSubtitle: 'Sede Central • Gestión de cobros y mora automatizada',
            institutionLogo: '🎓',
            simulatedDate: new Date(2026, 5, 15).toISOString(),
            colorTheme
          });
        } catch (err) {
          console.error("Error syncing reset to Firestore:", err);
        } finally {
          setLoadingData(false);
        }
      }
    }
  };

  // --- CLEAR ALL DATA (START FRESH) ---
  const handleClearAllData = async () => {
    if (window.confirm('⚠️ ¿Está seguro de eliminar TODOS los datos (cursados, alumnos, cobros)? Se iniciará con una planilla vacía.')) {
      localStorage.removeItem('edugrid_courses');
      localStorage.removeItem('edugrid_students');
      localStorage.removeItem('edugrid_payments');
      
      setCourses([]);
      setStudents([]);
      setPayments([]);
      setSelectedCourseId('');

      if (currentUser && currentUser !== 'local-user') {
        setLoadingData(true);
        try {
          await clearAllUserDataInFirestore(currentUser);
          await saveUserConfig(currentUser, {
            institutionName,
            institutionSubtitle,
            institutionLogo,
            simulatedDate: simulatedDate.toISOString(),
            colorTheme
          });
        } catch (err) {
          console.error("Error clearing data in Firestore:", err);
        } finally {
          setLoadingData(false);
        }
      }
    }
  };

  const handleDateChange = async (newDate: Date) => {
    setSimulatedDate(newDate);
    if (currentUser && currentUser !== 'local-user') {
      try {
        await saveUserConfig(currentUser, {
          institutionName,
          institutionSubtitle,
          institutionLogo,
          simulatedDate: newDate.toISOString(),
          colorTheme
        });
      } catch (err) {
        console.error("Error saving simulated date to Firestore:", err);
      }
    }
  };

  // --- CALCULATE REMAINING TIME & PROGRESS FOR COURSES ---
  const getCourseTimeLeft = (course: Course, simDate: Date) => {
    const currentYear = simDate.getFullYear();
    const startDate = new Date(currentYear, course.startMonth, 1);
    const endDate = new Date(currentYear, course.startMonth + course.duration, 0); // Last day of final month
    
    // Reset hours for date comparison
    const simZero = new Date(simDate.getFullYear(), simDate.getMonth(), simDate.getDate());
    
    if (simZero < startDate) {
      const diffMonths = (startDate.getFullYear() - simZero.getFullYear()) * 12 + (startDate.getMonth() - simZero.getMonth());
      if (diffMonths === 1) {
        return 'Inicia el próximo mes';
      } else if (diffMonths > 1) {
        return `Inicia en ${diffMonths} meses`;
      }
      return `Inicia en ${MONTH_NAMES[course.startMonth]}`;
    }
    
    if (simZero > endDate) {
      return 'Cursado Finalizado';
    }
    
    // Calculate remaining months and days
    const simYearMonth = simZero.getFullYear() * 12 + simZero.getMonth();
    const endYearMonth = endDate.getFullYear() * 12 + endDate.getMonth();
    const monthsRemaining = endYearMonth - simYearMonth;
    
    if (monthsRemaining === 0) {
      const msDiff = endDate.getTime() - simZero.getTime();
      const daysRemaining = Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
      if (daysRemaining === 0) {
        return 'Finaliza hoy';
      } else if (daysRemaining === 1) {
        return 'Finaliza mañana';
      }
      return `Finaliza en ${daysRemaining} días`;
    } else if (monthsRemaining === 1) {
      return 'Último mes restante';
    } else {
      return `${monthsRemaining} meses restantes`;
    }
  };

  const getCourseProgressPercent = (course: Course, simDate: Date) => {
    const currentYear = simDate.getFullYear();
    const startDate = new Date(currentYear, course.startMonth, 1);
    const endDate = new Date(currentYear, course.startMonth + course.duration, 0);
    
    const simZero = new Date(simDate.getFullYear(), simDate.getMonth(), simDate.getDate());
    
    if (simZero < startDate) return 0;
    if (simZero > endDate) return 100;
    
    const totalMs = endDate.getTime() - startDate.getTime();
    const passedMs = simZero.getTime() - startDate.getTime();
    
    if (totalMs <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round((passedMs / totalMs) * 100)));
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Cargando Sistema RAICEP...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={setCurrentUser} />;
  }

  if (loadingData && courses.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-550 uppercase tracking-widest animate-pulse">
          Sincronizando con Firestore...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col selection:bg-indigo-100 font-sans antialiased text-slate-800 pb-20">
      
      {/* Top Banner & Title Header */}
      <div className="w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 shrink-0"></div>
      
      <header className="bg-white border-b border-slate-200/80 py-4.5 px-6 md:px-12 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col gap-4.5">
          
          {/* Fila Superior: Nombre de la Aplicación (Fijo/No Modificable) */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100/80">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse shrink-0" />
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-100/60 px-2.5 py-0.5 rounded-full">
                Sistema Oficial
              </span>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>RAICEP</span>
                <span className="text-slate-400 font-medium lowercase tracking-normal text-xs">control de alumnos</span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-150 shrink-0">
                <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="max-w-[140px] truncate">
                  {currentUser === 'local-user' ? 'Modo Demostrativo (Local)' : auth.currentUser?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl border border-slate-250 hover:border-rose-200 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" />
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Fila Inferior: Información de la Institución (Totalmente Personalizable) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Logo Personalizable */}
              <button 
                onClick={() => setIsHeaderModalOpen(true)}
                title="Haga clic para personalizar el logo o nombre"
                className="h-13 w-13 rounded-2xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/50 flex items-center justify-center shadow-sm shrink-0 overflow-hidden transition-all group/logo cursor-pointer"
              >
                {institutionLogo.startsWith('data:') || institutionLogo.startsWith('http') ? (
                  <img src={institutionLogo} alt="Logo" className="h-full w-full object-cover group-hover/logo:scale-105 transition-all" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-2.5xl group-hover/logo:scale-110 transition-all">{institutionLogo}</span>
                )}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Institución Activa</span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Configurable</span>
                </div>
                <h1 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2 mt-0.5">
                  {institutionName}
                  <button
                    id="customize-header-btn"
                    onClick={() => setIsHeaderModalOpen(true)}
                    title="Personalizar Nombre y Logo de su Institución"
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </h1>
                <p className="text-xs text-slate-450 font-medium leading-relaxed">
                  {institutionSubtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
              {/* Quick Demo Reset */}
              <button
                id="reset-demo-btn"
                onClick={handleResetAppToDefault}
                title="Restaurar demo original"
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-450" />
                Restaurar Demo
              </button>

              {/* Clear All Data */}
              <button
                id="clear-all-data-btn"
                onClick={handleClearAllData}
                title="Borrar todos los datos de prueba y comenzar vacío"
                className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 bg-white border border-rose-200/80 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Limpiar Todo
              </button>

              <span className="text-xs text-slate-350 hidden md:inline">|</span>
              {/* Personalize Button */}
              <button
                onClick={() => setIsHeaderModalOpen(true)}
                className="bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/50 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-indigo-700 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
                title="Click para cambiar logo o nombre de la institución"
              >
                <Settings className="h-3.5 w-3.5" />
                Personalizar
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6 w-full space-y-6">
        
        {currentUser === 'local-user' && (
          <div className="bg-amber-50 border border-amber-250 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
            <div className="flex gap-3">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-800 shrink-0 mt-0.5 md:mt-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-amber-950 tracking-tight flex items-center gap-1.5">
                  Estás en Modo de Prueba Local (Sin Cuenta)
                  <span className="text-[9px] bg-amber-200/60 text-amber-900 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Firebase Desactivado
                  </span>
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed max-w-3xl font-medium">
                  El proveedor de <strong>Email/Password</strong> de tu proyecto Firebase está desactivado, lo que impide crear cuentas en la nube. Puedes usar la app normalmente (los datos se guardarán en tu navegador). Para activar la sincronización real, ve a la <strong>Consola de Firebase &gt; Authentication &gt; Sign-in method &gt; Email/Password &gt; Habilitar</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                alert("Instrucciones de Activación:\n1. Ingrese a console.firebase.google.com con su cuenta de Google.\n2. Busque el proyecto asociado al sistema.\n3. En el menú izquierdo, vaya a 'Authentication'.\n4. Haga clic en la pestaña 'Sign-in method' o 'Comenzar'.\n5. Seleccione 'Correo electrónico/contraseña'.\n6. Active la primera opción 'Habilitar' y haga clic en Guardar.\n7. ¡Listo! Ya podrá registrarse y crear cuentas en la nube.");
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl shrink-0 cursor-pointer shadow-sm transition-all animate-pulse"
            >
              Ver Guía de Activación 📋
            </button>
          </div>
        )}

        {/* Step 1: Simulator & Date Traveller (Interactive Automation Demonstration) */}
        <DateTraveler 
          simulatedDate={simulatedDate} 
          onChangeDate={handleDateChange} 
        />

        {/* Step 2: Stats Bento Box */}
        <StatsGrid 
          students={students}
          courses={courses}
          payments={payments}
          simulatedDate={simulatedDate}
          onAlertsClick={() => setIsAlertsModalOpen(true)}
        />

        {/* Step 3: Two-Column Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* LEFT COLUMN: Course Management (1/4 Width) */}
          <section className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-sans font-bold text-slate-450 text-xs uppercase tracking-wider">
                Cursados & Turnos
              </h3>
              <button
                id="add-course-btn"
                onClick={handleOpenNewCourse}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Nuevo Cursado
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {courses.length === 0 ? (
                <div className="bg-white border border-slate-200 p-8 rounded-3xl text-center text-slate-400 shadow-xs">
                  <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-650">No hay cursados creados</p>
                  <button
                    onClick={handleOpenNewCourse}
                    className="mt-4 text-xs bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl font-bold cursor-pointer"
                  >
                    Crear Cursado
                  </button>
                </div>
              ) : (
                courses.map((course) => {
                  const studentCount = students.filter(s => s.courseId === course.id).length;
                  const isFiltered = selectedCourseId === course.id;

                  return (
                    <div
                      key={course.id}
                      id={`course-card-${course.id}`}
                      onClick={() => setSelectedCourseId(isFiltered ? '' : course.id)}
                      className={`group/card bg-white border rounded-3xl p-5 cursor-pointer transition-all flex flex-col justify-between hover:shadow-md ${
                        isFiltered 
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/5 shadow-sm shadow-indigo-600/5' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Course top identity */}
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-${course.color}-50 text-${course.color}-700`} style={{ backgroundColor: course.color === 'emerald' ? '#ecfdf5' : course.color === 'fuchsia' ? '#fdf4ff' : '#eff6ff', color: course.color === 'emerald' ? '#047857' : course.color === 'fuchsia' ? '#a21caf' : '#1d4ed8' }}>
                            {MONTH_NAMES[course.startMonth]} • {course.duration} meses
                          </span>
                          
                          {/* Course actions on hover */}
                          <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                            <button
                              id={`edit-course-btn-${course.id}`}
                              onClick={(e) => handleOpenEditCourse(course, e)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                              title="Editar Cursado"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              id={`delete-course-btn-${course.id}`}
                              onClick={(e) => handleDeleteCourse(course.id, e)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Eliminar Cursado"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Course title & fee details */}
                        <h4 className="font-bold text-slate-800 text-sm mt-3 leading-snug group-hover/card:text-indigo-600 transition-colors">
                          {course.name}
                        </h4>

                        {/* Teacher & Time remaining details */}
                        <div className="mt-3.5 space-y-2.5 text-xs border-t border-slate-50 pt-3">
                          {/* Teacher Name */}
                          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {course.teacherName ? `Prof. ${course.teacherName}` : 'Profesor no asignado'}
                            </span>
                          </div>

                          {/* Time Remaining with progress bar */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between font-bold text-[10px] text-slate-550 uppercase tracking-wide">
                              <span className="flex items-center gap-1">
                                <Hourglass className="h-3 w-3 text-slate-400 shrink-0" />
                                {getCourseTimeLeft(course, simulatedDate)}
                              </span>
                              <span>
                                {getCourseProgressPercent(course, simulatedDate)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100/80 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${getCourseProgressPercent(course, simulatedDate)}%`,
                                  backgroundColor: course.color === 'emerald' ? '#10b981' : course.color === 'fuchsia' ? '#d946ef' : '#4f46e5'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                        <span>{studentCount} alumnos</span>
                        <span className="font-bold text-slate-700 text-xs bg-slate-50 px-2 py-0.5 rounded">
                          {course.currency}{course.tuitionFee.toLocaleString('es-AR')}/mes
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Instructions widget */}
            <div className="bg-indigo-50/50 border border-indigo-100/60 p-5 rounded-3xl flex gap-3 text-indigo-900 shadow-xs">
              <HelpCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1.5 leading-relaxed font-medium">
                <span className="font-bold block text-sm text-indigo-955">¿Cómo funciona la Mora?</span>
                <p>
                  El sistema detecta atrasos evaluando la <strong>Fecha del simulador</strong> contra el <strong>Día de Vencimiento</strong> de cada cursado.
                </p>
                <p>
                  Prueba modificando la fecha con los controladores de arriba para ver cómo los alumnos cambian a estado de alerta automáticamente.
                </p>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: The Interactive Modern Spreadsheet (3/4 Width) */}
          <section className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-sans font-bold text-slate-455 text-xs uppercase tracking-wider">
                Planilla de Control y Cobros
              </h3>
              {selectedCourseId && (
                <button
                  id="clear-filter-btn"
                  onClick={() => setSelectedCourseId('')}
                  className="text-xs text-slate-400 hover:text-slate-650 cursor-pointer font-bold"
                >
                  Limpiar filtros ×
                </button>
              )}
            </div>

            <StudentGrid
              students={students}
              courses={courses}
              payments={payments}
              selectedCourseId={selectedCourseId}
              onSelectCourseId={setSelectedCourseId}
              onEditStudent={handleOpenEditStudent}
              onRemoveStudent={handleRemoveStudent}
              onOpenPayments={handleOpenPayments}
              onAddStudent={handleOpenNewStudent}
              onAddCourse={handleOpenNewCourse}
              simulatedDate={simulatedDate}
            />
          </section>

        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="mt-auto py-8 px-6 text-center border-t border-slate-200/60 bg-white/50 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-2">
          <div className="h-6 w-12 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400 tracking-wider">
            RAICEP
          </div>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-3xl">
            Todos los derechos reservados a <strong className="text-slate-800 font-bold">RAICEP</strong> registro argentino de institucion y homologacion de estudios profesionales
          </p>
        </div>
      </footer>

      {/* --- ALL POPUPS/MODALS --- */}
      
      {/* 1. Course Modal */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSave={handleSaveCourse}
        courseToEdit={courseToEdit}
      />

      {/* 2. Student Modal */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleSaveStudent}
        courses={courses}
        studentToEdit={studentToEdit}
      />

      {/* 3. Payments Ledger Modal */}
      <PaymentDetailsModal
        isOpen={isPaymentsModalOpen}
        onClose={() => setIsPaymentsModalOpen(false)}
        student={selectedStudentForPayments}
        course={selectedCourseForPayments}
        payments={payments}
        onUpdatePayment={handleUpdatePayment}
        simulatedDate={simulatedDate}
      />

      {/* 4. Global Alerts Modal */}
      <AlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        students={students}
        courses={courses}
        payments={payments}
        simulatedDate={simulatedDate}
        onUpdatePayment={handleUpdatePayment}
      />

      {/* 5. Custom Header Personalization Modal */}
      <HeaderCustomizeModal
        isOpen={isHeaderModalOpen}
        onClose={() => setIsHeaderModalOpen(false)}
        institutionName={institutionName}
        institutionSubtitle={institutionSubtitle}
        institutionLogo={institutionLogo}
        colorThemeId={colorTheme}
        onSave={async (name, subtitle, logo, theme) => {
          setInstitutionName(name);
          setInstitutionSubtitle(subtitle);
          setInstitutionLogo(logo);
          setColorTheme(theme);
          if (currentUser && currentUser !== 'local-user') {
            try {
              await saveUserConfig(currentUser, {
                institutionName: name,
                institutionSubtitle: subtitle,
                institutionLogo: logo,
                simulatedDate: simulatedDate.toISOString(),
                colorTheme: theme
              });
            } catch (err) {
              console.error("Error saving user config to Firestore:", err);
            }
          }
        }}
      />

    </div>
  );
}
