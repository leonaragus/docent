import { useReactMediaRecorder } from 'react-media-recorder-2';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import RecordRTC from 'recordrtc';
import { 
  Play, StopCircle, Download, Cloud, ChevronRight, Sparkles, 
  Settings, FolderPlus, Mic, MicOff, Monitor, CheckCircle, Video, ListMusic,
  FileText, Subtitles, Edit3, Save, LogIn, LogOut, AlertTriangle, RefreshCw, BookOpen, X,
  Link, Trash2, Copy, Eye, Check, Globe, Cast, Camera, Wand2, Pause, Maximize } from 'lucide-react';
import AudioVisualizer from './components/AudioVisualizer';
import VolumeMeter from './components/VolumeMeter';
import Teleprompter from './components/Teleprompter';
import AIAssistant from './components/AIAssistant';
import StorageManager from './components/StorageManager';
import SyncedPlayer from './components/SyncedPlayer';
import ErrorBoundary from './components/ErrorBoundary';
import SuiteNavigation, { SuiteView } from './components/SuiteNavigation';
import DocentNexus from './components/DocentNexus';
import DocentMagnet from './components/DocentMagnet';
import DocentDocs from './components/DocentDocs';
import DocentNucleus from './components/DocentNucleus';
import DocentOracle from './components/Oracle/DocentOracle';
import DocentCampus from './components/Campus/DocentCampus';
import DocentAdmin from './components/Admin/DocentAdmin';
import SubscriptionModal from './components/SubscriptionModal';
import { DriveTutorialModal } from './components/DriveTutorialModal';
import { RecordingSettings } from './components/RecordingSettings';
import { Recording, ChapterMarker } from './types';
import { 
  supabase, 
  signInWithGoogle, 
  signOut, 
  subscribeToSharedClasses, 
  deleteSharedClass, 
  getSharedClassById,
  subscribeToTeacherRecordings,
  insertTeacherRecording,
  deleteTeacherRecording
} from './supabase';
import { useLanguage } from './contexts/LanguageContext';
import { downloadProjectZip } from './zipService';
import { generateLocalQuizFallback } from './quizGenerator';
import { QuizQuestion } from './types';
import { toast } from 'sonner';
import { useRecordingStore } from './store/useRecordingStore';

// Helper to format seconds into official SRT subtitle timestamp style (HH:MM:SS,mmm)
function formatSRTTime(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const pad = (num: number, size: number) => {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  };

  return `${pad(hrs, 2)}:${pad(mins, 2)}:${pad(secs, 2)},${pad(ms, 3)}`;
}

// Algoritmo determinista para generar subtÃ­tulos y transcripciÃ³n 100% offline y a prueba de fallos
function generateLocalTranscriptFallback(script: string, durationSec: number, chapters: ChapterMarker[], lang = 'es') {
  const defaultScript = lang === 'en' 
    ? "Free explanation by the teacher about today's class topic."
    : "Explicación libre del docente sobre el tema de la clase correspondiente al día de hoy.";
  const cleanScript = script?.trim() || defaultScript;
  
  // Dividir el guiÃ³n en oraciones lÃ³gicas para crear subtÃ­tulos perfectamente sincronizados
  const sentences = cleanScript
    .split(/(?<=[.?!])\s+/)
    .filter(s => s.trim().length > 0);

  if (sentences.length === 0) {
    sentences.push("Inicio de la clase grabada.");
    sentences.push("Repaso y explicaciÃ³n detallada de los puntos fundamentales.");
    sentences.push("Cierre de la grabaciÃ³n y sesiÃ³n de consultas.");
  }

  const numSentences = sentences.length;
  const timePerSentence = durationSec / numSentences;

  let srtText = "";
  let cleanText = "";

  sentences.forEach((sentence, index) => {
    const start = index * timePerSentence;
    // Dejar un pequeÃ±o gap de 100ms para legibilidad entre subtÃ­tulos
    const end = Math.min((index + 1) * timePerSentence - 0.1, durationSec);

    srtText += `${index + 1}\n`;
    srtText += `${formatSRTTime(start)} --> ${formatSRTTime(end)}\n`;
    srtText += `${sentence.trim()}\n\n`;

    cleanText += `${sentence.trim()} `;
  });

  // Agregar los capítulos marcados como notas detalladas al final del archivo de apuntes
  if (chapters && chapters.length > 0) {
    const chaptersHeader = lang === 'en' ? "\n\n--- CLASS CHAPTERS (NOTES) ---\n" : "\n\n--- CAPÍTULOS DE LA CLASE (NOTAS DE CLASE) ---\n";
    cleanText += chaptersHeader;
    chapters.forEach((ch, idx) => {
      const minutes = Math.floor(ch.seconds / 60);
      const seconds = Math.floor(ch.seconds % 60);
      const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      const chapterLabel = lang === 'en' ? "Chapter" : "Capítulo";
      cleanText += `📌 [${timeStr}] ${chapterLabel} ${idx + 1}: ${ch.title || (lang === 'en' ? "Class marker" : "Marca de clase")}\n`;
    });
  }

  return {
    srtText: srtText.trim(),
    cleanText: cleanText.trim()
  };
}

function getSupportedMimeType() {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm'
  ];
  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate)) {
      return candidate;
    }
  }
  return 'video/webm';
}

const reportCameraPermissionDebug = (hypothesisId: string, location: string, msg: string, data: Record<string, unknown> = {}) => {
  // #region debug-point permission-flow:reporter
  fetch("http://127.0.0.1:7777/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "camera-permission-flow",
      runId: "pre-fix",
      hypothesisId,
      location,
      msg: `[DEBUG] ${msg}`,
      data,
      ts: Date.now()
    })
  }).catch(() => {});
  // #endregion
};


export default function App() {
  const { lang, setLang, t } = useLanguage();
  const isEn = lang === 'en';
  const [currentView, setCurrentView] = useState<SuiteView>('nexus');
  const [showDriveTutorial, setShowDriveTutorial] = useState(false);
  const [oracleTranscriptNotif, setOracleTranscriptNotif] = useState<string | null>(null);

  // Recording Settings states (fused from useRecorder)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>('');
  const [recordMic, setRecordMic] = useState(true);
  const [recordSystemAudio, setRecordSystemAudio] = useState(true);
  const [micVolume, setMicVolume] = useState(1.0);
  const [systemVolume, setSystemVolume] = useState(1.0);
  const [videoQuality, setVideoQuality] = useState<'high' | 'standard'>('high');
  const [systemAudioMissingWarning, setSystemAudioMissingWarning] = useState(false);

  const handleLanguageChange = (newLang: 'en' | 'es') => {
    setLang(newLang);
  };

  const [zipProgress, setZipProgress] = useState<string | null>(null);
  const [isPackingZip, setIsPackingZip] = useState(false);

  const handleExportZip = async () => {
    setIsPackingZip(true);
    setZipProgress("Preparing package...");
    try {
      await downloadProjectZip((msg) => setZipProgress(msg));
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsPackingZip(false);
        setZipProgress(null);
      }, 3000);
    }
  };

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // SDK de Grabación (High-level)
   const {
     startRecording: sdkStart,
     stopRecording: sdkStop,
     pauseRecording: sdkPause,
     resumeRecording: sdkResume,
   } = useReactMediaRecorder({
     video: false,
     screen: false,
     audio: true,
     onStop: (blobUrl, blob) => {
       if (blob) handleRecordingStopProcessing(blob);
     }
   });
  const recordingContainerRef = useRef<HTMLDivElement>(null);
  const { recordings, setRecordings, addRecording, removeRecording, clearCache } = useRecordingStore();
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const [videoFilter, setVideoFilter] = useState('none');
  const videoFilterRef = useRef('none');
  const langRef = useRef(lang);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const profileImageObjRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (profilePhoto) {
      const img = new Image();
      img.src = profilePhoto;
      img.onload = () => {
        profileImageObjRef.current = img;
      };
    } else {
      profileImageObjRef.current = null;
    }
  }, [profilePhoto]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [currentRecordingBlob, setCurrentRecordingBlob] = useState<Blob | null>(null);
  const [currentRecordingUrl, setCurrentRecordingUrl] = useState<string | null>(null);
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);

  // State for shared student class decrypted from URL hash
  const [studentClassData, setStudentClassData] = useState<{
    id?: string;
    name: string;
    url: string;
    srtText?: string;
    chapters?: ChapterMarker[];
    teacherName?: string;
    subjectName?: string;
    date?: string;
    quizQuestions?: any[];
    oracleExam?: any;
    allowFeedback?: boolean;
  } | null>(null);

  const [courseRelatedClasses, setCourseRelatedClasses] = useState<any[]>([]);
  const [allTeacherSharedClasses, setAllTeacherSharedClasses] = useState<any[]>([]);
  const [copiedClassId, setCopiedClassId] = useState<string | null>(null);

  // Real-time listener for all shared classes
  useEffect(() => {
    const unsubscribe = subscribeToSharedClasses((classesList) => {
      // Save to offline backup cache
      classesList.forEach((item) => {
        try {
          localStorage.setItem(`offline-class-${item.id}`, JSON.stringify(item));
        } catch (e) {
          console.error("Error backing up to localStorage:", e);
        }
      });
      setAllTeacherSharedClasses(classesList);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteSharedClass = async (id: string) => {
    if (window.confirm("Â¿EstÃ¡s seguro de que deseas eliminar este enlace de clase compartida? Los alumnos ya no podrÃ¡n acceder a ella.")) {
      try {
        await deleteSharedClass(id);
      } catch (err) {
        console.error("Error deleting shared class:", err);
      }
    }
  };

  // Fetch related classes for the same subject/course using local or live real-time cache
  useEffect(() => {
    if (!studentClassData || !studentClassData.subjectName) {
      setCourseRelatedClasses([]);
      return;
    }

    // Filter from the real-time cache of allTeacherSharedClasses to support offline-first behavior
    const filtered = allTeacherSharedClasses.filter(
      (cl) => cl.subjectName === studentClassData.subjectName && cl.id !== studentClassData.id
    );
    setCourseRelatedClasses(filtered);
  }, [studentClassData, allTeacherSharedClasses]);

  // Hook to detect and decode shared class link in URL hash
  useEffect(() => {
    const checkHash = async () => {
      const hash = window.location.hash;
      if (hash.startsWith('#student-class=')) {
        const pathValue = hash.substring('#student-class='.length);

        // 1. Try to find in our loaded real-time list first (offline-first friendly!)
        const localClass = allTeacherSharedClasses.find(c => c.id === pathValue);
        if (localClass) {
          setStudentClassData(localClass);
          return;
        }

        // 2. Try to find in offline backup immediately to ensure zero delay & fail-safe offline load
        const offlineBackup = localStorage.getItem(`offline-class-${pathValue}`);
        if (offlineBackup) {
          try {
            const parsed = JSON.parse(offlineBackup);
            setStudentClassData(parsed);
            if (!navigator.onLine) {
              // If completely offline, stop here to avoid Firestore connection warning logs
              return;
            }
          } catch (backupErr) {
            console.warn('Error parsing offline local storage backup:', backupErr);
          }
        }

        try {
          // Attempt Base64 decode
          const decodedStr = decodeURIComponent(atob(pathValue));
          const parsed = JSON.parse(decodedStr);
          setStudentClassData(parsed);
        } catch (e) {
          // If Base64 decode fails, it is a Supabase classId!
          try {
            if (!navigator.onLine) {
              return; // Do not touch Supabase if browser is offline
            }
            const item = await getSharedClassById(pathValue);
            if (item) {
              setStudentClassData(item);
              // Back up to offline storage
              localStorage.setItem(`offline-class-${pathValue}`, JSON.stringify(item));
            } else {
              console.warn('Shared class document not found in Supabase:', pathValue);
            }
          } catch (fsErr: any) {
            const errMsg = fsErr?.message || String(fsErr);
            const isOfflineErr = 
              errMsg.toLowerCase().includes('offline') || 
              errMsg.toLowerCase().includes('failed to fetch') ||
              errMsg.toLowerCase().includes('network') ||
              !navigator.onLine;

            // Robust silent fallback: try to re-read from local storage if available
            if (offlineBackup) {
              try {
                const parsed = JSON.parse(offlineBackup);
                setStudentClassData(parsed);
              } catch (backupErr) {
                // Ignore backup parsing errors
              }
            }

            if (!isOfflineErr) {
              console.warn('Error fetching shared class from Supabase (handled with fallback):', fsErr);
            } else {
              console.warn('Silent local fallback triggered because client is offline:', errMsg);
            }
          }
        }
      } else {
        setStudentClassData(null);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [allTeacherSharedClasses]);

  // Google Sign-In and Storage States
  const [isGoogleLoggedIn, setIsGoogleLoggedIn] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [googleUser, setGoogleUser] = useState<{ id: string; name: string; email: string; avatar: string } | null>(null);
  const [googleDriveSpaceLeft, setGoogleDriveSpaceLeft] = useState<number>(14858); // starts with a realistic high space (14.5 GB left of 15 GB)
  const [authChecking, setAuthChecking] = useState(true);
  
  // Paywall states
  const [showPaywall, setShowPaywall] = useState(false);
  const FREE_RECORDINGS_LIMIT = 3;

  // Monitor Supabase Authentication state
  useEffect(() => {
    if (!supabase) {
      setAuthChecking(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsGoogleLoggedIn(true);
        setGoogleUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || 'Profesor',
          email: session.user.email || '',
          avatar: session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
        });
      }
      setAuthChecking(false);
    }).catch((err) => {
      console.error("Error fetching session:", err);
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsGoogleLoggedIn(true);
        setGoogleUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || 'Profesor',
          email: session.user.email || '',
          avatar: session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
        });
      } else {
        setIsGoogleLoggedIn(false);
        setGoogleUser(null);
      }
    }) || { data: { subscription: null } };

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Listen for Docent Nexus Brand Export
  useEffect(() => {
    const handleBrandExport = () => {
      const savedBrand = localStorage.getItem('docent_nexus_brand');
      if (savedBrand) {
        try {
          const brand = JSON.parse(savedBrand);
          toast.success(lang === 'en' ? 'Institutional Brand Applied!' : '¡Marca Institucional Aplicada!', {
            description: lang === 'en' ? `Docent Suite will now operate under the colors of: ${brand.name}` : `Docent Suite ahora operará bajo los colores de: ${brand.name}`
          });
          
          // Optional: We can inject custom CSS variables to override standard tailwind colors in the future
          if (brand.colors && brand.colors.length > 0) {
            document.documentElement.style.setProperty('--brand-primary', brand.colors[0]);
          }
        } catch(e) {}
      }
    };

    window.addEventListener('nexus_brand_updated', handleBrandExport);
    return () => window.removeEventListener('nexus_brand_updated', handleBrandExport);
  }, []);

  // Listen for Docent Magnet Script Export
  useEffect(() => {
    const handleMagnetScript = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const script = customEvent.detail;
      if (script) {
        localStorage.setItem('docent_teleprompter_text', script);
        teleprompterScriptRef.current = script;
        setTeleprompterScript(script);
        setCurrentView('studio');
        toast.success(lang === 'en' ? 'Script Loaded in Teleprompter!' : '¡Guion Cargado en el Teleprompter!', {
          description: lang === 'en' ? 'You can start recording your ad immediately.' : 'Puedes empezar a grabar tu anuncio de inmediato.'
        });
        
        // Give time for UI to switch before scrolling
        setTimeout(() => {
          document.getElementById('teleprompter')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    };

    window.addEventListener('magnet_script_generated', handleMagnetScript);
    return () => window.removeEventListener('magnet_script_generated', handleMagnetScript);
  }, []);

  // Listen for Docent Oracle Exam Creation
  useEffect(() => {
    const handleOracleExam = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const exam = customEvent.detail;
      
      if (exam && selectedRecordingId) {
        setRecordings(prev => prev.map(rec => 
          rec.id === selectedRecordingId 
            ? { ...rec, oracleExam: exam }
            : rec
        ));
        
        toast.success(lang === 'en' ? 'Exam Attached to Class!' : '¡Examen Anexado a la Clase!', {
          description: lang === 'en' ? `The exam "${exam.title}" will be sent to students upon sharing.` : `El examen "${exam.title}" se enviará a los alumnos al compartir el link.`
        });
      } else if (exam) {
        toast.info(lang === 'en' ? 'Exam saved in bank' : 'Examen guardado en el banco', {
          description: lang === 'en' ? 'No active recording selected to attach it.' : 'No hay ninguna grabación activa seleccionada para anexarlo.'
        });
      }
    };

    window.addEventListener('oracle_exam_created', handleOracleExam);
    return () => window.removeEventListener('oracle_exam_created', handleOracleExam);
  }, [selectedRecordingId]);

  // Sync recordings list from Supabase in real-time when logged in
  useEffect(() => {
    if (!isGoogleLoggedIn || !googleUser) {
      setRecordings([]);
      return;
    }
    
    const unsubscribe = subscribeToTeacherRecordings(googleUser.id, (recs) => {
      setRecordings(recs);
    });
    
    return () => unsubscribe();
  }, [isGoogleLoggedIn, googleUser]);

  // Floating Class Header editable info states
  const [classTitle, setClassTitle] = useState('Write your class title here');
  const [teacherName, setTeacherName] = useState('Prof. Pia Morales');
  const [subjectName, setSubjectName] = useState('Natural Sciences');
  const [schoolName, setSchoolName] = useState('Bicentennial School');
  const [classroomLevel, setClassroomLevel] = useState('7th Grade');
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);


  // Live Timer and Chapter Markers state
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeChapters, setActiveChapters] = useState<ChapterMarker[]>([]);
  const [customChapterName, setCustomChapterName] = useState('');
  
  // Premium Features States
  const [countdown, setCountdown] = useState<number | null>(null);
  const [bubblePosition, setBubblePosition] = useState({ x: 40 + 80, y: 720 - 40 - 80 });
  const bubblePositionRef = useRef({ x: 40 + 80, y: 720 - 40 - 80 });
  const [isDraggingBubble, setIsDraggingBubble] = useState(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  const [suggestedChapters, setSuggestedChapters] = useState<string[]>([
    'Introduction',
    'Main Topic',
    'Practical Example',
    'Q&A Session',
    'Summary & Homework'
  ]);

  // Sync suggested chapters translation on language swap
  useEffect(() => {
    if (lang === 'es') {
      setSuggestedChapters([
        'IntroducciÃ³n',
        'Tema Principal',
        'Ejemplo PrÃ¡ctico',
        'SesiÃ³n de Dudas',
        'Resumen y Tarea'
      ]);
    } else {
      setSuggestedChapters([
        'Introduction',
        'Main Topic',
        'Practical Example',
        'Q&A Session',
        'Summary & Homework'
      ]);
    }
  }, [lang]);

  // Teleprompter Script State
  const [teleprompterScript, setTeleprompterScript] = useState<string>('');
  const [transcriptionTab, setTranscriptionTab] = useState<'clean' | 'srt'>('clean');

  const activeChaptersRef = useRef<ChapterMarker[]>([]);
  const recordRtcRef = useRef<any>(null); // kept for legacy compatibility
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);


  // Refs for dual stream canvas compositor and Web Audio mixer
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const cameraAudioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const screenAudioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const micGainNodeRef = useRef<GainNode | null>(null);
  const systemGainNodeRef = useRef<GainNode | null>(null);

  // Web Speech API refs & states
  const liveTranscriptEntriesRef = useRef<{id: number; start: number; end: number; text: string}[]>([]);
  const isRecordingRef = useRef(false);
  const teleprompterScriptRef = useRef<string>('');
  const [speechAPIAvailable, setSpeechAPIAvailable] = useState(true);

  // Audio recording refs & offline transcription states



  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechAPIAvailable(false);
    }
  }, []);

  // Load available microphone devices
  const loadDevices = useCallback(async () => {
    try {
      const devicesList = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devicesList.filter(device => device.kind === 'audioinput');
      setDevices(audioInputs);
      if (audioInputs.length > 0 && !selectedMicId) {
        setSelectedMicId(audioInputs[0].deviceId);
      }
    } catch (err) {
      console.error('Error listing devices:', err);
    }
  }, [selectedMicId]);

  // Request mic permission to get labels
  const requestMicPermission = useCallback(async () => {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      tempStream.getTracks().forEach(track => track.stop());
      await loadDevices();
      return true;
    } catch (err) {
      console.warn('Microphone permission denied or not available:', err);
      return false;
    }
  }, [loadDevices]);

  // Load devices on mount and listen to device changes
  useEffect(() => {
    loadDevices();
    navigator.mediaDevices.addEventListener('devicechange', loadDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', loadDevices);
    };
  }, [loadDevices]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    activeChaptersRef.current = activeChapters;
  }, [activeChapters]);

  useEffect(() => {
    teleprompterScriptRef.current = teleprompterScript;
  }, [teleprompterScript]);

  useEffect(() => {
    bubblePositionRef.current = bubblePosition;
  }, [bubblePosition]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1280 / rect.width;
    const scaleY = 720 / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const mouseX = (clientX - rect.left) * scaleX;
    const mouseY = (clientY - rect.top) * scaleY;

    const { x, y } = bubblePosition;
    const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
    
    if (dist <= 80) {
      setIsDraggingBubble(true);
      if ('touches' in e) {
        // Prevent scrolling while dragging
        if (e.cancelable) e.preventDefault();
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingBubble) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1280 / rect.width;
    const scaleY = 720 / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      if (e.cancelable) e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const mouseX = (clientX - rect.left) * scaleX;
    const mouseY = (clientY - rect.top) * scaleY;

    const r = 80;
    const newX = Math.max(r, Math.min(1280 - r, mouseX));
    const newY = Math.max(r, Math.min(720 - r, mouseY));
    
    setBubblePosition({ x: newX, y: newY });
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingBubble(false);
  };

  const syncActiveStream = (stream: MediaStream | null) => {
    activeStreamRef.current = stream;
    setActiveStream(stream);
  };

  const syncCameraStream = (stream: MediaStream | null) => {
    cameraStreamRef.current = stream;
    setCameraStream(stream);
  };

  const syncScreenStream = (stream: MediaStream | null) => {
    screenStreamRef.current = stream;
    setScreenStream(stream);
  };

  const stopStream = (stream: MediaStream | null) => {
    stream?.getTracks().forEach((track) => track.stop());
  };

  const requestCameraStream = async () => {
    // #region debug-point B:camera-request-before
    reportCameraPermissionDebug('B', 'App.tsx:requestCameraStream', 'requesting camera permissions', {
      video: true,
      audio: true
    });
    // #endregion
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true, // Sin resoluciones fijas para evitar fallos de hardware
        audio: true
      });
      // #region debug-point B:camera-request-success
      reportCameraPermissionDebug('B', 'App.tsx:requestCameraStream', 'camera permissions granted', {
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length
      });
      // #endregion
      syncCameraStream(stream);
      syncActiveStream(stream);
      return stream;
    } catch (error: any) {
      console.error('Error al solicitar permisos de cámara:', error);
      // #region debug-point B:camera-request-error
      reportCameraPermissionDebug('B', 'App.tsx:requestCameraStream', 'camera permission request failed', {
        name: error?.name,
        message: error?.message,
        code: error?.code
      });
      // #endregion
      throw error;
    }
  };

  const requestScreenStream = async () => {
    // #region debug-point C:screen-request-before
    reportCameraPermissionDebug('C', 'App.tsx:requestScreenStream', 'requesting screen permissions', {
      video: true,
      audio: recordSystemAudio
    });
    // #endregion
    
    let stream: MediaStream | null = null;
    let systemAudioAttemptFailed = false;

    // Intento 1: Con audio del sistema si está habilitado y resolución según calidad
    if (recordSystemAudio) {
      try {
        const constraints = {
          video: {
            width: { ideal: videoQuality === 'high' ? 1920 : 1280 },
            height: { ideal: videoQuality === 'high' ? 1080 : 720 },
            frameRate: { ideal: videoQuality === 'high' ? 60 : 30 }
          },
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        };
        stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      } catch (err) {
        console.warn("Intento 1 de compartir pantalla con audio falló, reintentando sin audio...", err);
        systemAudioAttemptFailed = true;
      }
    }

    // Intento 2: Con resolución según calidad pero sin audio
    if (!stream) {
      try {
        const constraints = {
          video: {
            width: { ideal: videoQuality === 'high' ? 1920 : 1280 },
            height: { ideal: videoQuality === 'high' ? 1080 : 720 },
            frameRate: { ideal: videoQuality === 'high' ? 60 : 30 }
          },
          audio: false
        };
        stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      } catch (err) {
        console.warn("Intento 2 de compartir pantalla con resolución falló, reintentando modo básico...", err);
      }
    }

    // Intento 3: Modo ultra compatible (sin restricciones y sin audio)
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
      } catch (err: any) {
        console.error('Error final al solicitar permisos de pantalla:', err);
        // #region debug-point C:screen-request-error
        reportCameraPermissionDebug('C', 'App.tsx:requestScreenStream', 'screen permission request failed', {
          name: err?.name,
          message: err?.message,
          code: err?.code
        });
        // #endregion
        throw err;
      }
    }

    if (systemAudioAttemptFailed || (recordSystemAudio && stream.getAudioTracks().length === 0)) {
      setSystemAudioMissingWarning(true);
    } else {
      setSystemAudioMissingWarning(false);
    }

    // #region debug-point C:screen-request-success
    reportCameraPermissionDebug('C', 'App.tsx:requestScreenStream', 'screen permissions granted', {
      videoTracks: stream.getVideoTracks().length,
      audioTracks: stream.getAudioTracks().length
    });
    // #endregion

    const [screenTrack] = stream.getVideoTracks();
    if (screenTrack) {
      screenTrack.onended = () => {
        stopStream(screenStreamRef.current);
        syncScreenStream(null);
        if (activeStreamRef.current === stream) {
          syncActiveStream(cameraStreamRef.current || null);
        }
        // Re-enable camera video tracks when screen share is stopped from browser UI
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getVideoTracks().forEach(t => { t.enabled = true; });
        }
      };
    }
    
    syncScreenStream(stream);
    syncActiveStream(stream);
    return stream;
  };

  const autoDownloadFiles = (recordingName: string, blob: Blob, srtText: string, cleanText: string) => {
    // Asegurar que el nombre base no tenga extensiones duplicadas
    const baseName = recordingName.replace('.webm', '').replace('.mp4', '');
    
    const videoUrl = URL.createObjectURL(blob);
    const aVideo = document.createElement('a');
    aVideo.href = videoUrl;
    // Usamos el formato dinámico del blob (MP4 o WebM) para la extensión del archivo
    const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
    aVideo.download = `${baseName}.${ext}`;
    aVideo.click();
    
    if (srtText) {
      const srtBlob = new Blob([srtText], { type: 'text/plain' });
      const srtUrl = URL.createObjectURL(srtBlob);
      const aSrt = document.createElement('a');
      aSrt.href = srtUrl;
      aSrt.download = `${baseName}.srt`;
      aSrt.click();
    }
    
    if (cleanText) {
      const txtBlob = new Blob([cleanText], { type: 'text/plain' });
      const txtUrl = URL.createObjectURL(txtBlob);
      const aTxt = document.createElement('a');
      aTxt.href = txtUrl;
      aTxt.download = `${baseName}_transcripcion.txt`;
      aTxt.click();
    }
  };

  // Is uploading/transcribing states
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Live timer for active recording
  useEffect(() => {
    if (isRecording) {
      startTimeRef.current = Date.now();
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  
  // Sync invisible helper videos with camera and screen streams
  useEffect(() => {
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = cameraStream;
      if (cameraStream) {
        cameraVideoRef.current.play().catch(err => console.log("Camera play catch:", err));
      }
    }
  }, [cameraStream]);

  useEffect(() => {
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStream;
      if (screenStream) {
        screenVideoRef.current.play().catch(err => console.log("Screen play catch:", err));
      }
    }
  }, [screenStream]);

  // Synchronize audio mixer connections on stream updates
  useEffect(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioDestinationRef.current = audioContextRef.current.createMediaStreamDestination();
      }
      
      const ctx = audioContextRef.current;
      const dest = audioDestinationRef.current;
      if (!ctx || !dest) return;

      // Disconnect previous nodes to avoid duplicate connections
      if (cameraAudioSourceRef.current) {
        cameraAudioSourceRef.current.disconnect();
        cameraAudioSourceRef.current = null;
      }
      if (micGainNodeRef.current) {
        micGainNodeRef.current.disconnect();
        micGainNodeRef.current = null;
      }

      if (screenAudioSourceRef.current) {
        screenAudioSourceRef.current.disconnect();
        screenAudioSourceRef.current = null;
      }
      if (systemGainNodeRef.current) {
        systemGainNodeRef.current.disconnect();
        systemGainNodeRef.current = null;
      }

      // Add Analyser for volume meter
      if (!analyserRef.current) {
        analyserRef.current = ctx.createAnalyser();
        analyserRef.current.fftSize = 32;
      }

      // Sync camera/microphone audio source with GainNode
      if (cameraStream && cameraStream.getAudioTracks().length > 0) {
        const source = ctx.createMediaStreamSource(cameraStream);
        const gainNode = ctx.createGain();
        gainNode.gain.value = recordMic ? micVolume : 0;
        
        source.connect(gainNode);
        gainNode.connect(dest);
        if (analyserRef.current) {
          gainNode.connect(analyserRef.current);
        }

        cameraAudioSourceRef.current = source;
        micGainNodeRef.current = gainNode;
      }

      // Sync screen share audio source (system audio) with GainNode
      if (screenStream && screenStream.getAudioTracks().length > 0) {
        const source = ctx.createMediaStreamSource(screenStream);
        const gainNode = ctx.createGain();
        gainNode.gain.value = recordSystemAudio ? systemVolume : 0;

        source.connect(gainNode);
        gainNode.connect(dest);
        if (analyserRef.current) {
          gainNode.connect(analyserRef.current);
        }

        screenAudioSourceRef.current = source;
        systemGainNodeRef.current = gainNode;
      }
    } catch (err) {
      console.warn("Audio mixer update error:", err);
    }
  }, [cameraStream, screenStream]);

  // Dynamically update mic gain
  useEffect(() => {
    if (micGainNodeRef.current) {
      micGainNodeRef.current.gain.value = recordMic ? micVolume : 0;
    }
  }, [micVolume, recordMic]);

  // Dynamically update system gain
  useEffect(() => {
    if (systemGainNodeRef.current) {
      systemGainNodeRef.current.gain.value = recordSystemAudio ? systemVolume : 0;
    }
  }, [systemVolume, recordSystemAudio]);

  // Keep refs in sync with state so compositor can read them without being a dependency
  useEffect(() => { videoFilterRef.current = videoFilter; }, [videoFilter]);
  useEffect(() => { langRef.current = lang; }, [lang]);

  // Canvas compositor — uses a Web Worker driven timer so it keeps
  // running even when the user switches to another tab (e.g., their presentation).
  // requestAnimationFrame and main-thread setInterval/setTimeout are throttled
  // aggressively (~1fps) in background tabs by Chrome to save CPU.
  useEffect(() => {
    if (currentView !== 'studio') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1280;
    canvas.height = 720;

    const drawPipBubble = () => {
      const r = 80;
      const { x, y } = bubblePositionRef.current;

      // Clip to circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();

      const profileImg = profileImageObjRef.current;
      if (profileImg && profileImg.complete && profileImg.naturalWidth > 0) {
        const iw = profileImg.naturalWidth;
        const ih = profileImg.naturalHeight;
        const minSide = Math.min(iw, ih);
        ctx.drawImage(profileImg, (iw - minSide) / 2, (ih - minSide) / 2, minSide, minSide, x - r, y - r, r * 2, r * 2);
      } else {
        // Fallback: coloured circle with "Prof" text
        ctx.fillStyle = '#4338ca';
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Prof', x, y);
      }
      ctx.restore();

      // Ring border
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r + 2, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#6366f1';
      ctx.stroke();
      ctx.restore();
    };

    const drawFrame = () => {
      const cameraVideo = cameraVideoRef.current;
      const screenVideo = screenVideoRef.current;
      const currentFilter = videoFilterRef.current;
      const currentLang = langRef.current;

      const hasScreen = !!(screenStreamRef.current);
      const screenVideoReady = !!(screenVideo && screenVideo.readyState >= 2 && screenVideo.videoWidth > 0);
      const hasCamera = !!(cameraStreamRef.current && cameraVideo && cameraVideo.readyState >= 2 && cameraVideo.videoWidth > 0);

      // --- Background ---
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 1280, 720);

      if (hasScreen) {
        // SCREEN SHARE MODE
        if (screenVideoReady) {
          try {
            // Force-play the video element if paused
            if (screenVideo!.paused) screenVideo!.play().catch(() => {});
            ctx.drawImage(screenVideo!, 0, 0, 1280, 720);
          } catch (_) {
            ctx.fillStyle = '#111827';
            ctx.fillRect(0, 0, 1280, 720);
          }
        } else {
          // Waiting for screen video to be ready
          ctx.fillStyle = '#111827';
          ctx.fillRect(0, 0, 1280, 720);
          ctx.fillStyle = '#818cf8';
          ctx.font = '22px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Cargando pantalla compartida...', 640, 360);
        }

        // Always draw PIP (static image or fallback) when screen is active
        drawPipBubble();

      } else if (hasCamera) {
        // CAMERA ONLY MODE
        if (cameraVideo!.paused) cameraVideo!.play().catch(() => {});
        if (currentFilter !== 'none') ctx.filter = currentFilter;
        ctx.drawImage(cameraVideo!, 0, 0, 1280, 720);
        ctx.filter = 'none';

      } else {
        // IDLE / WAITING
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(0, 0, 1280, 720);
        ctx.font = 'bold 40px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(currentLang === 'en' ? 'DOCENT STUDIO' : 'ESTUDIO DOCENT', 640, 330);
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#818cf8';
        ctx.fillText(currentLang === 'en' ? 'Connect camera or share screen to start' : 'Conecta la cámara o comparte pantalla para empezar', 640, 385);
      }
    };

    let worker: Worker | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    try {
      // Create inline worker code to act as our background timer
      const workerCode = `
        let timer = null;
        self.onmessage = (e) => {
          if (e.data === 'start') {
            timer = setInterval(() => self.postMessage('tick'), 1000 / 30);
          } else if (e.data === 'stop') {
            clearInterval(timer);
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      worker = new Worker(workerUrl);
      worker.onmessage = () => {
        drawFrame();
      };
      worker.postMessage('start');
      
      // Cleanup Blob URL immediately after construction
      URL.revokeObjectURL(workerUrl);
    } catch (e) {
      console.warn("Failed to create Web Worker timer, falling back to main-thread interval:", e);
      fallbackInterval = setInterval(drawFrame, 1000 / 30);
    }

    return () => {
      if (worker) {
        worker.postMessage('stop');
        worker.terminate();
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [currentView]); // Only restarts when navigating views, never during recording

  
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (activeStream) {
      activeStream.getAudioTracks().forEach(t => t.enabled = !newMuted);
    }
    if (cameraStream) {
      cameraStream.getAudioTracks().forEach(t => t.enabled = !newMuted);
    }
    if (screenStream) {
      screenStream.getAudioTracks().forEach(t => t.enabled = !newMuted);
    }
  };

  const toggleCamera = async () => {
    console.log("DEBUG: toggleCamera called, cameraStream is:", !!cameraStream);
    // #region debug-point A:toggle-camera-entry
    reportCameraPermissionDebug('A', 'App.tsx:toggleCamera', 'toggleCamera invoked', {
      hasCameraStream: !!cameraStream,
      hasScreenStream: !!screenStream,
      hasActiveStream: !!activeStream,
      mediaDevicesAvailable: !!navigator.mediaDevices?.getUserMedia
    });
    // #endregion
    if (cameraStream) {
      const previousCameraStream = cameraStreamRef.current;
      stopStream(previousCameraStream);
      syncCameraStream(null);
      if (activeStreamRef.current === previousCameraStream) syncActiveStream(screenStreamRef.current || null);
    } else {
      try {
        await requestCameraStream();
      } catch (e: any) {
        console.error('Camera error:', e);
         // #region debug-point B:camera-request-error
         reportCameraPermissionDebug('B', 'App.tsx:toggleCamera', 'camera permission request failed', {
           name: e?.name,
           message: e?.message
         });
         // #endregion
        toast.error(lang === 'en' ? `Camera error: ${e.message || e}` : `Error de cámara: ${e.message || e}`);
      }
    }
  };

  const toggleScreen = async () => {
    if (screenStream) {
      // Stop screen share
      const previousScreenStream = screenStreamRef.current;
      stopStream(previousScreenStream);
      syncScreenStream(null);
      if (activeStreamRef.current === previousScreenStream) syncActiveStream(cameraStreamRef.current || null);
      // Re-enable camera video tracks when screen share stops
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getVideoTracks().forEach(t => { t.enabled = true; });
      }
    } else {
      try {
        // Pause camera video tracks BEFORE requesting screen share to avoid hardware conflict
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getVideoTracks().forEach(t => { t.enabled = false; });
        }
        await requestScreenStream();
      } catch (e: any) {
        // If screen share failed, re-enable camera video tracks
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getVideoTracks().forEach(t => { t.enabled = true; });
        }
        let errorMsg = lang === 'en' ? `Screen sharing error: ${e.message || e}` : `Error al compartir pantalla: ${e.message || e}`;
        if (e.name === 'NotReadableError' || e.message?.includes('Timeout')) {
          errorMsg = lang === 'en' 
            ? 'Timeout starting screen share. Please refresh the page and try again.' 
            : 'Tiempo de espera agotado al compartir pantalla. Por favor, recarga la página e intenta de nuevo.';
        }
        toast.error(errorMsg);
      }
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    console.log("DEBUG: startRecording called, activeStream is:", !!activeStream);
    // #region debug-point D:start-recording-entry
    reportCameraPermissionDebug('D', 'App.tsx:startRecording', 'startRecording invoked', {
      hasActiveStream: !!activeStream,
      hasCameraStream: !!cameraStream,
      hasScreenStream: !!screenStream,
      isRecording
    });
    // #endregion
    // Check Free Tier Limit
    if (googleUser?.email) {
      const currentCount = parseInt(localStorage.getItem(`recordingsCount_${googleUser.email}`) || '0');
      if (currentCount >= FREE_RECORDINGS_LIMIT) {
        setShowPaywall(true);
        return;
      }
    }

    try {
      // Resume AudioContext if suspended (browsers block audio until a click gesture)
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(e => console.warn("Failed to resume AudioContext:", e));
      }

      setActiveChapters([]);

      if (!activeStreamRef.current) {
        try {
          await requestCameraStream();
        } catch (permissionError: any) {
          console.error('Error al solicitar permisos de cámara en startRecording:', permissionError);
          reportCameraPermissionDebug('D', 'App.tsx:startRecording', 'record click could not acquire default camera stream', {
            name: permissionError?.name,
            message: permissionError?.message,
            code: permissionError?.code
          });
          
          let errorMessage = lang === 'en'
            ? 'Approve camera and microphone permissions to start recording.'
            : 'Aprueba los permisos de cámara y micrófono para iniciar la grabación.';
          
          // Mensajes más específicos según el tipo de error
          if (permissionError?.name === 'NotAllowedError' || permissionError?.code === 0) {
            errorMessage = lang === 'en'
              ? 'Camera/microphone permission was denied. Please check your browser settings and allow access.'
              : 'Permiso de cámara/micrófono denegado. Por favor revisa la configuración de tu navegador y permite el acceso.';
          } else if (permissionError?.name === 'NotFoundError' || permissionError?.code === 8) {
            errorMessage = lang === 'en'
              ? 'No camera/microphone found. Please connect a camera and microphone.'
              : 'No se encontró cámara/micrófono. Por favor conecta una cámara y micrófono.';
          } else if (permissionError?.name === 'NotReadableError' || permissionError?.code === 3) {
            errorMessage = lang === 'en'
              ? 'Camera/microphone is already in use by another application.'
              : 'La cámara/micrófono ya está en uso por otra aplicación.';
          }
          
          toast.error(errorMessage);
          return;
        }
      }

      // START PREMIUM COUNTDOWN (3, 2, 1...)
      setCountdown(3);
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            setCountdown(null);
            performActualStartRecording();
            return null;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Error starting screen/audio recording:', err);
      toast.error(lang === 'en' ? 'Screen sharing and microphone permissions are required to record the class.' : 'Para grabar la clase, debes dar permiso para compartir pantalla y acceder al micrófono.');
    }
  };

  const performActualStartRecording = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas element not available");

      // Capture the canvas stream at 30fps. Since the compositor loop is driven
      // by a background Web Worker, it will continue rendering at a constant rate
      // even when this tab is in the background.
      const canvasStream = (canvas as any).captureStream(30);

      // Mix in the microphone audio tracks from the audio mixer destination node
      if (audioDestinationRef.current) {
        audioDestinationRef.current.stream.getAudioTracks().forEach(t => {
          canvasStream.addTrack(t);
        });
      }

      // Pick best supported WebM/MP4 MIME type
      const mimeType = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ].find(m => MediaRecorder.isTypeSupported(m)) ?? '';

      const recorderOptions: MediaRecorderOptions = {
        bitsPerSecond: videoQuality === 'high' ? 5_000_000 : 2_500_000,
      };
      if (mimeType) recorderOptions.mimeType = mimeType;

      recordingChunksRef.current = [];
      const recorder = new MediaRecorder(canvasStream, recorderOptions);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordingChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const finalBlob = new Blob(recordingChunksRef.current, {
          type: mimeType || 'video/webm',
        });
        await handleRecordingStopProcessing(finalBlob);
      };

      recorder.start(1000); // chunk every 1 second
      mediaRecorderRef.current = recorder;

      setIsRecording(true);
      setIsPaused(false);
      addChapterMarker(isEn ? 'Class Started' : 'Inicio de Clase');
    } catch (err: any) {
      console.error('Error starting recording:', err);
      toast.error(err?.message ?? (isEn ? 'Error starting recorder.' : 'Error al iniciar la grabación.'));
    }
  };

  
  const pauseRecording = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state === 'recording') {
      rec.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state === 'paused') {
      rec.resume();
      setIsPaused(false);
      startTimeRef.current = Date.now() - (recordingTime * 1000);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
  };

  const toggleFullscreen = () => {
    if (recordingContainerRef.current) {
      if (!document.fullscreenElement) {
        recordingContainerRef.current.requestFullscreen().catch(err => {
          console.error("Error attempting to enable full-screen mode:", err);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleRecordingStopProcessing = async (finalBlob: Blob) => {
    console.log("DEBUG: Processing final recording blob of size:", finalBlob.size);
    
    const finalUrl = URL.createObjectURL(finalBlob);
    setCurrentRecordingBlob(finalBlob);
    setCurrentRecordingUrl(finalUrl);

    const finalDurationSecs = Math.max(3, Math.floor((Date.now() - startTimeRef.current) / 1000));
    const fileMB = (finalBlob.size / (1024 * 1024)).toFixed(1);
    const recordingId = Math.random().toString(36).substr(2, 9);
    const finalMimeType = finalBlob.type || 'video/webm';
    const extension = finalMimeType.includes('mp4') ? 'mp4' : 'webm';
    const recordingName = `Clase_${new Date().toLocaleDateString().replace(/\//g, '-')}_${new Date().toLocaleTimeString().replace(/:/g, '-')}.${extension}`;

    // 1. GENERAR TRANSCRIPCIÓN (FALLBACK O LIVE)
    let finalSrtText = "";
    let finalCleanText = "";

    if (liveTranscriptEntriesRef.current.length > 0) {
      liveTranscriptEntriesRef.current.forEach((entry) => {
        finalSrtText += `${entry.id}\n${formatSRTTime(entry.start)} --> ${formatSRTTime(entry.end)}\n${entry.text}\n\n`;
        finalCleanText += `${entry.text} `;
      });
    } else {
      const fallbackData = generateLocalTranscriptFallback(teleprompterScriptRef.current, finalDurationSecs, activeChaptersRef.current, lang);
      finalSrtText = fallbackData.srtText;
      finalCleanText = fallbackData.cleanText;
    }

    finalSrtText = finalSrtText.trim();
    finalCleanText = finalCleanText.trim();

    // 2. DESCARGA INMEDIATA (Prioridad UX)
    autoDownloadFiles(recordingName, finalBlob, finalSrtText, finalCleanText);
    
    // 3. MOSTRAR TUTORIAL (Prioridad UX)
    if (localStorage.getItem('docent_show_drive_tutorial') !== 'false') {
      setShowDriveTutorial(true);
    }

    // 4. PROCESAR IA Y PERSISTENCIA (Segundo plano)
    if (finalCleanText.length > 50) {
      setOracleTranscriptNotif(finalCleanText);
    }

    let quizQuestions: QuizQuestion[] = [];
    try {
      const quizRes = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: finalCleanText, lang })
      });
      const quizData = await quizRes.json();
      if (quizData && quizData.questions && quizData.questions.length > 0) {
        quizQuestions = quizData.questions;
      } else {
        quizQuestions = generateLocalQuizFallback(finalCleanText, lang);
      }
    } catch (err) {
      quizQuestions = generateLocalQuizFallback(finalCleanText, lang);
    }

    const newRecording: Recording = {
      id: recordingId,
      name: recordingName,
      size: fileMB,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      url: finalUrl,
      blob: finalBlob,
      chapters: [...activeChaptersRef.current],
      transcriptionText: finalCleanText,
      srtText: finalSrtText,
      quizQuestions
    };

    useRecordingStore.getState().addRecording(newRecording);
    setSelectedRecordingId(recordingId);

    if (googleUser) {
      try {
        await insertTeacherRecording(googleUser.id, newRecording);
      } catch (err) {
        console.error("Error al guardar en Supabase:", err);
      }
    }

    // Cleanup
    clearCache(recordingId);
    stopStream(activeStreamRef.current);
    stopStream(cameraStreamRef.current);
    stopStream(screenStreamRef.current);
    syncCameraStream(null);
    syncScreenStream(null);
    syncActiveStream(null);
    setIsRecording(false);
  };

  const stopRecording = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== 'inactive') {
      setIsRecording(false);
      setIsPaused(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.onend = null; recognitionRef.current.stop(); } catch (e) {}
      }
      rec.stop(); // triggers recorder.onstop which calls handleRecordingStopProcessing
      mediaRecorderRef.current = null;
    } else {
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  // Add a chapter marker in real time during recording
  const addChapterMarker = (title: string) => {
    const currentMins = Math.floor(recordingTime / 60);
    const currentSecs = recordingTime % 60;
    const timestampStr = `${currentMins.toString().padStart(2, '0')}:${currentSecs.toString().padStart(2, '0')}`;
    
    const newMarker: ChapterMarker = {
      id: Math.random().toString(36).substr(2, 9),
      title: title,
      timestamp: timestampStr,
      seconds: recordingTime
    };

    setActiveChapters(prev => [...prev, newMarker]);
  };

  const handleAddCustomChapter = (e: FormEvent) => {
    e.preventDefault();
    if (!customChapterName.trim()) return;
    addChapterMarker(customChapterName.trim());
    setCustomChapterName('');
  };

  const handleDeleteRecording = async (id: string) => {
    if (googleUser) {
      try {
        await deleteTeacherRecording(id);
      } catch (err) {
        console.error("Error al borrar grabación de Supabase:", err);
      }
    }
    removeRecording(id);
  };

  const handleUploadToDrive = async (recording: Recording, folderId: string) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('recording', recording.blob, recording.name);
      formData.append('folderId', folderId);
      
      // If there are chapters, append them as a json string
      if (recording.chapters && recording.chapters.length > 0) {
        formData.append('chapters', JSON.stringify(recording.chapters));
      }

      const response = await fetch('/api/drive/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      // Notify beautifully
      toast.success(lang === 'en' ? 'Upload Complete!' : '¡Carga Completa!', {
        description: lang === 'en' ? `Class: ${recording.name}\nDestination: ${folderId === 'root' ? 'My Drive' : folderId}\nResult: ${result.message}` : `Clase: ${recording.name}\nDestino: ${folderId === 'root' ? 'Mi Unidad' : folderId}\nResultado: ${result.message}`
      });
    } catch (err) {
      console.error(err);
      toast.error(lang === 'en' ? 'Error uploading the class to Google Drive.' : 'Error al intentar cargar la clase a Google Drive.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePreviewStudentRoom = () => {
    if (allTeacherSharedClasses.length > 0) {
      // Preview the first/latest shared class
      const latestClass = allTeacherSharedClasses[0];
      setStudentClassData(latestClass);
      window.location.hash = `#student-class=${latestClass.id}`;
    } else if (recordings.length > 0) {
      // Preview the latest recorded class in the session
      const rec = recordings[0];
      const simulatedClass = {
        id: 'preview-simulated',
        name: rec.name,
        url: rec.url,
        srtText: rec.srtText || '',
        chapters: rec.chapters || [],
        teacherName: teacherName || 'Profa. Pía Morales',
        subjectName: subjectName || 'Ciencias Naturales',
        classroomLevel: classroomLevel || 'Séptimo Básico',
        schoolName: schoolName || 'Liceo Bicentenario',
        date: rec.date
      };
      setStudentClassData(simulatedClass);
      window.location.hash = '#student-class=preview-simulated';
    } else {
      // Default demo preview so the teacher can see it immediately even without files!
      const demoClass = {
        id: 'demo-preview',
        name: 'Clase Demo: El Universo y la Fuerza de Gravedad',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4', // Safe standard educational sample video
        srtText: '1\n00:00:01,000 --> 00:00:05,000\nBienvenidos alumnos a esta clase interactiva sobre el Sistema Solar.\n\n2\n00:00:06,000 --> 00:00:10,000\nHoy analizaremos la fuerza de gravedad y la órbita de los planetas.',
        chapters: [
          { timestamp: '00:01', title: '1. Introducción al Cosmos y la Astronomía' },
          { timestamp: '00:06', title: '2. Ley de Gravitación Universal de Newton' }
        ],
        teacherName: teacherName || 'Profa. Pía Morales',
        subjectName: subjectName || 'Ciencias Naturales',
        classroomLevel: classroomLevel || 'Séptimo Básico',
        schoolName: schoolName || 'Liceo Bicentenario',
        date: new Date().toLocaleDateString()
      };
      setStudentClassData(demoClass);
      window.location.hash = '#student-class=demo-preview';
    }
  };

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Error during Google authentication:', err);
      toast.error(lang === 'en' ? 'Error signing in with Google.' : 'Error al iniciar sesión con Google.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error during Google sign out:', err);
    }
  };

  const downloadChaptersFile = (rec: Recording) => {
    if (!rec.chapters || rec.chapters.length === 0) return;
    const header = `ÍNDICE DE CAPÍTULOS DE CLASE\nClase: ${rec.name}\nFecha: ${rec.date}\n\n`;
    const body = rec.chapters.map(ch => `[${ch.timestamp}] - ${ch.title}`).join('\n');
    const blob = new Blob([header + body], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rec.name.replace('.mp4', '')}_capitulos.txt`;
    a.click();
  };

  const getFilterStyle = (filter: string) => {
    switch (filter) {
      case 'vintage': return 'sepia(0.6) contrast(1.1) saturate(0.9)';
      case 'warm': return 'saturate(1.25) sepia(0.12) brightness(1.04)';
      case 'cool': return 'hue-rotate(15deg) saturate(1.15) brightness(0.98) contrast(1.05)';
      case 'grayscale': return 'grayscale(1) contrast(1.2) brightness(0.95)';
      case 'contrast': return 'contrast(1.4) saturate(1.1) brightness(1.02)';
      default: return 'none';
    }
  };

  const selectedRecording = recordings.find(r => r.id === selectedRecordingId) || (recordings.length > 0 ? recordings[0] : null);

  const isStudentView = !!studentClassData;

  if (isStudentView) {
    return (
      <div className="min-h-screen bg-black text-slate-100 font-sans relative overflow-y-auto flex flex-col">
        
        {/* Cinematic Ambient Background (Animated Blur) */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[150px] animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-pink-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-[pulse_10s_ease-in-out_infinite_alternate]" />
          <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-[pulse_12s_ease-in-out_infinite]" />
        </div>

        {/* Spatial Header */}
        <header className="absolute top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter text-white flex items-center gap-1.5 drop-shadow-md">
                  DOCENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">HORIZON</span>
                </h1>
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{t.studentPortalTitle}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-3 py-1.5">
              <Globe size={10} className="text-indigo-400 animate-spin-slow" />
              <select
                value={lang}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="bg-transparent text-[10px] text-indigo-100 outline-none font-black cursor-pointer uppercase tracking-widest">
                <option value="en" className="bg-slate-900 text-slate-100">EN</option>
                <option value="es" className="bg-slate-900 text-slate-100">ES</option>
              </select>
            </div>

            {(window.location.hash === '#student-class=demo-preview' || window.location.hash === '#student-class=preview-simulated') && (
              <button
                onClick={() => { window.location.hash = ''; }}
                className="text-[10px] uppercase tracking-wider bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full flex items-center gap-2 transition-all cursor-pointer font-black shadow-lg">
                <Video size={12} />
                <span>{t.backToTeacher}</span>
              </button>
            )}
          </div>
        </header>

        {/* Edge-to-Edge Main Content */}
        <div className="flex-1 w-full h-full relative z-10 flex pt-20 px-6 pb-6">
          <SyncedPlayer 
            lang={lang}
            videoUrl={studentClassData.url}
            sharedClassId={studentClassData.id}
            srtText={studentClassData.srtText}
            videoFilter="none"
            getFilterStyle={getFilterStyle}
            classTitle={studentClassData.name.replace('.mp4', '').replace(/_/g, ' ')}
            teacherName={studentClassData.teacherName || 'Profesor'}
            subjectName={studentClassData.subjectName || 'Asignatura'}
            chapters={studentClassData.chapters || []}
            quizQuestions={studentClassData.quizQuestions || []}
            oracleExam={studentClassData.oracleExam}
            allowFeedback={studentClassData.allowFeedback !== false}
          />
        </div>

      </div>
    );
  }
  // TEACHER VIEW (Main Studio)
  return (
    <SuiteNavigation 
      onOpenPro={() => setShowPaywall(true)}
      currentView={currentView}
      onViewChange={(view) => {
        setCurrentView(view);
        if (view !== 'oracle') setOracleTranscriptNotif(null);
      }}
    >
      <SubscriptionModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} t={t} />
      
      {oracleTranscriptNotif && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-gradient-to-br from-violet-950 to-indigo-950 border border-violet-500/40 rounded-2xl p-4 shadow-2xl shadow-violet-900/50 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0 border border-violet-500/30">
                <span className="text-lg">🏆</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-0.5">DOCENT Oracle</p>
                <p className="text-sm font-bold text-white mb-1">
                  {lang === 'en' ? 'Transcript ready to evaluate!' : '¡Transcripción lista para evaluar!'}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'en'
                    ? 'Automatically generate an exam based on the class you just recorded.'
                    : 'Generá automáticamente un examen basado en la clase que acabás de grabar.'}
                </p>
              </div>
              <button onClick={() => setOracleTranscriptNotif(null)} className="text-slate-500 hover:text-white p-1 rounded shrink-0">✕</button>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setCurrentView('oracle');
                  localStorage.setItem('docent_oracle_prefill', oracleTranscriptNotif);
                  setOracleTranscriptNotif(null);
                }}
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold py-2 px-4 rounded-xl transition-colors"
              >
                {lang === 'en' ? 'Create AI Exam →' : 'Crear Evaluación con IA →'}
              </button>
              <button onClick={() => setOracleTranscriptNotif(null)} className="text-xs text-slate-500 hover:text-slate-300 px-3 transition-colors">
                {lang === 'en' ? 'Not now' : 'Ahora no'}
              </button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'studio' ? (
        <div className="flex-1 p-6 lg:p-8 flex flex-col items-center">
          
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-6">
              
              {/* Studio Banner */}
              <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-8 relative overflow-hidden border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex items-start justify-between relative z-10 mb-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
                      <Sparkles className="w-3 h-3" />
                      {t.newClass}
                    </span>
                    {isEditingBanner ? (
                      <input 
                        type="text" 
                        value={classTitle}
                        onChange={(e) => setClassTitle(e.target.value)}
                        className="text-3xl font-black text-white bg-transparent border-b border-indigo-400 focus:outline-none w-full placeholder-slate-500"
                      />
                    ) : (
                      <h2 className="text-3xl font-black text-white">{classTitle}</h2>
                    )}
                  </div>
                  <button onClick={() => setIsEditingBanner(!isEditingBanner)} className="p-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors">
                    {isEditingBanner ? <Save className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{t.teacher}</span>
                    {isEditingBanner ? (
                      <input type="text" value={teacherName} onChange={e => setTeacherName(e.target.value)} className="bg-slate-800/50 text-sm font-semibold text-white px-2 py-1 rounded border border-slate-700" />
                    ) : <span className="text-sm font-semibold text-slate-200">{teacherName}</span>}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{t.subject}</span>
                    {isEditingBanner ? (
                      <input type="text" value={subjectName} onChange={e => setSubjectName(e.target.value)} className="bg-slate-800/50 text-sm font-semibold text-white px-2 py-1 rounded border border-slate-700" />
                    ) : <span className="text-sm font-semibold text-slate-200">{subjectName}</span>}
                  </div>
                </div>
              </div>

              
              {/* Video Preview con Canvas y Controles Flotantes tipo Zoom */}
              <div ref={recordingContainerRef} className="bg-black aspect-video rounded-3xl overflow-hidden relative shadow-2xl border border-slate-800 flex items-center justify-center group">
                
                {/* Helper video elements - each MUST be in its own container to avoid overflow clipping */}
                <video
                  ref={cameraVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="pointer-events-none absolute"
                  style={{ top: 0, left: 0, width: '1px', height: '1px', zIndex: 0, opacity: 0.001 }}
                />
                <video
                  ref={screenVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="pointer-events-none absolute"
                  style={{ top: 0, left: '2px', width: '1px', height: '1px', zIndex: 0, opacity: 0.001 }}
                />

                <canvas 
                  ref={canvasRef} 
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  onTouchStart={handleCanvasMouseDown}
                  onTouchMove={handleCanvasMouseMove}
                  onTouchEnd={handleCanvasMouseUp}
                  className={`w-full h-full object-contain bg-slate-950 relative ${isDraggingBubble ? 'cursor-grabbing' : 'cursor-grab'}`} 
                  style={{ zIndex: 10 }}
                />

                {/* COUNTDOWN OVERLAY */}
                <AnimatePresence>
                  {countdown !== null && (
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      exit={{ scale: 2, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center z-[100] bg-black/40 backdrop-blur-sm pointer-events-none"
                    >
                      <span className="text-[12rem] font-black text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]">
                        {countdown}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Overlays lógicos sobre el canvas */}
                {activeStream && (
                  <>
                    {screenStream && (
                      <div className="absolute top-4 left-4 bg-emerald-600/90 border border-emerald-400 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg z-30 animate-pulse">
                        <Cast className="w-4 h-4 animate-spin-slow" />
                        <span>{isEn ? 'SCREEN SHARING ACTIVE' : 'COMPARTIENDO PANTALLA'}</span>
                      </div>
                    )}
                    {screenStream && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none z-20 text-center p-6">
                        <Cast className="w-16 h-16 text-emerald-400 mb-4 animate-bounce" />
                        <h3 className="text-lg font-black text-white mb-2">{isEn ? 'Screen Sharing is Active' : 'Compartiendo Pantalla'}</h3>
                        <p className="text-xs text-slate-300 max-w-sm">
                          {isEn 
                            ? 'IMPORTANT: When sharing screen, select the window/tab with your presentation (PowerPoint, PDF, etc.), NOT this Docent Suite tab. Your camera appears as PIP in bottom-left corner.' 
                            : 'IMPORTANTE: Al compartir pantalla, selecciona la ventana/pestaña con tu presentación (PowerPoint, PDF, etc.), NO esta pestaña de Docent Suite. Tu cámara aparece como PIP en la esquina inferior izquierda.'}
                        </p>
                      </div>
                    )}
                    
                    {/* ENORME TIMER CENTRAL */}
                    {isRecording && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[8rem] font-black text-red-500/40 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)] tracking-tighter mix-blend-screen">
                          {formatTime(recordingTime)}
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Floating Controls — always visible in fullscreen, hover-reveal in normal mode */}
                <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/95 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 pointer-events-auto transition-all duration-500 transform ${
                  document.fullscreenElement || isRecording || !activeStream ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100'
                }`}>
                  
                  {isRecording && (
                    <div className="flex items-center gap-3 mr-4 pl-1">
                      <div className="relative flex items-center justify-center">
                        <div className={`absolute inset-0 rounded-full bg-red-500/40 animate-ping ${isPaused ? 'hidden' : ''}`} />
                        <div className={`w-3 h-3 rounded-full relative z-10 ${isPaused ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]'}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-0.5">
                          {isPaused ? (isEn ? 'PAUSED' : 'PAUSADO') : (isEn ? 'LIVE' : 'EN VIVO')}
                        </span>
                        <span className="text-sm font-mono font-black text-white leading-none">
                          {formatTime(recordingTime)}
                        </span>
                      </div>
                    </div>
                  )}

                  {!isRecording ? (
                    <button onClick={startRecording} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-full font-bold text-sm transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                      <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                      {isEn ? 'Record' : 'Grabar'}
                    </button>
                  ) : (
                    <>
                      {isPaused ? (
                        <button onClick={resumeRecording} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-full font-bold text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                          <Play className="w-4 h-4 text-white" />
                          {isEn ? 'Resume' : 'Reanudar'}
                        </button>
                      ) : (
                        <button onClick={pauseRecording} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-full font-bold text-sm transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                          <Pause className="w-4 h-4 text-white" />
                          {isEn ? 'Pause' : 'Pausa'}
                        </button>
                      )}
                      <button onClick={stopRecording} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-full font-bold text-sm transition-all border border-slate-600 ml-1">
                        <StopCircle className="w-4 h-4 text-red-400" />
                        {isEn ? 'Stop' : 'Detener'}
                      </button>
                    </>
                  )}
                  
                  <div className="w-px h-6 bg-slate-700 mx-2" />
                  
                  <div className="flex items-center gap-1.5 mr-1">
                    <button onClick={toggleMute} className={`p-2.5 rounded-full transition-all relative overflow-hidden ${!isMuted ? 'bg-indigo-600 text-white' : 'bg-red-600 text-white animate-pulse'}`} title={isMuted ? (isEn ? 'Unmute Mic' : 'Activar Micrófono') : (isEn ? 'Mute Mic' : 'Silenciar Micrófono')}>
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      
                      {/* Integrated Audio Level (Tiny Dots) */}
                      <VolumeMeter analyser={analyserRef.current} isMuted={isMuted} />
                    </button>
                  </div>
                  
                  <button onClick={toggleCamera} className={`p-2.5 rounded-full transition-all ${cameraStream ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`} title={isEn ? 'Camera' : 'Cámara'}>
                    <Camera className="w-5 h-5" />
                  </button>
                  
                  <button onClick={toggleScreen} className={`p-2.5 rounded-full transition-all ${screenStream ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`} title={isEn ? 'Share Screen' : 'Compartir Pantalla'}>
                    <Cast className="w-5 h-5" />
                  </button>

                  <div className="relative group/filters ml-1">
                    <button className="p-2.5 rounded-full hover:bg-slate-800 text-slate-400 transition-all" title={isEn ? 'Video Effects' : 'Efectos de Video'}>
                      <Wand2 className="w-5 h-5" />
                    </button>
                    {/* Tooltip con opciones de filtros */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 hidden group-hover/filters:flex flex-col bg-slate-800 p-2 rounded-xl border border-slate-700 shadow-xl gap-1 w-32">
                      <button onClick={() => setVideoFilter('none')} className={`text-xs py-1.5 px-2 rounded-lg text-left ${videoFilter === 'none' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>Normal</button>
                      <button onClick={() => setVideoFilter('contrast(1.2) saturate(1.2)')} className={`text-xs py-1.5 px-2 rounded-lg text-left ${videoFilter === 'contrast(1.2) saturate(1.2)' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>Studio Light</button>
                      <button onClick={() => setVideoFilter('sepia(0.4) contrast(1.1) brightness(1.1)')} className={`text-xs py-1.5 px-2 rounded-lg text-left ${videoFilter.includes('sepia') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>Cinematic Warm</button>
                      <button onClick={() => setVideoFilter('grayscale(100%) contrast(1.2)')} className={`text-xs py-1.5 px-2 rounded-lg text-left ${videoFilter.includes('grayscale') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>B & W</button>
                    </div>
                  </div>

                  <div className="w-px h-6 bg-slate-700 mx-1" />
                  
                  <button onClick={toggleFullscreen} className="p-2.5 rounded-full hover:bg-slate-800 text-slate-400 transition-all" title={isEn ? 'Fullscreen' : 'Pantalla Completa'}>
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>

              </div>

              {/* Audio Visualizer */}
              {activeStream && <AudioVisualizer stream={activeStream} isRecording={isRecording} />}
              
              {/* Live Chapters */}
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  {t.liveChaptersHeader}
                </h3>
                <p className="text-sm text-slate-400 mb-4">{t.liveChaptersDesc}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {suggestedChapters.map((ch, idx) => (
                    <button 
                      key={idx}
                      disabled={!isRecording}
                      onClick={() => addChapterMarker(ch)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/50 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + {ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Recording Settings */}
              <RecordingSettings
                devices={devices}
                selectedMicId={selectedMicId}
                setSelectedMicId={setSelectedMicId}
                recordMic={recordMic}
                setRecordMic={setRecordMic}
                recordSystemAudio={recordSystemAudio}
                setRecordSystemAudio={setRecordSystemAudio}
                micVolume={micVolume}
                setMicVolume={setMicVolume}
                systemVolume={systemVolume}
                setSystemVolume={setSystemVolume}
                videoQuality={videoQuality}
                setVideoQuality={setVideoQuality}
                isRecording={isRecording}
                systemAudioMissingWarning={systemAudioMissingWarning}
                requestMicPermission={requestMicPermission}
                profilePhoto={profilePhoto}
                setProfilePhoto={setProfilePhoto}
              />

              {/* AI Assistant */}
              <AIAssistant 
                lang={lang}
                onLoadScript={(script) => {
                  localStorage.setItem('docent_teleprompter_text', script);
                  teleprompterScriptRef.current = script;
                  setTeleprompterScript(script);
                  toast.success(lang === 'en' ? 'Script loaded in teleprompter!' : '¡Guion cargado en el teleprompter!');
                  setTimeout(() => {
                    document.getElementById('teleprompter')?.scrollIntoView({ behavior: 'smooth' });
                  }, 300);
                }}
                onLoadChapters={(chapters) => {
                  setSuggestedChapters(chapters);
                  toast.success(lang === 'en' ? 'Chapters loaded!' : '¡Capítulos cargados!');
                }}
              />
            </div>
          </div>

          {/* Teleprompter Section */}
          <div className="mt-8 w-full max-w-5xl" id="teleprompter">
            <Teleprompter initialText={teleprompterScript} lang={lang} />
          </div>

          {/* Storage Manager */}
          <div className="mt-8 w-full max-w-5xl">
            <StorageManager 
              recordings={recordings}
              onUploadToDrive={handleUploadToDrive}
              lang={lang}
              googleUser={googleUser}
              allTeacherSharedClasses={allTeacherSharedClasses}
              onDeleteSharedClass={handleDeleteSharedClass}
            />
          </div>
        </div>
      ) : currentView === 'nexus' ? (
        <DocentNexus />
      ) : currentView === 'magnet' ? (
        <DocentMagnet initialCourseData={studentClassData} />
      ) : currentView === 'nucleus' ? (
        <DocentNucleus />
      ) : currentView === 'oracle' ? (
        <DocentOracle />
      ) : currentView === 'campus' ? (
        <div className="absolute inset-0 z-50 bg-white overflow-y-auto flex flex-col">
          <DocentCampus />
        </div>
      ) : currentView === 'admin' ? (
        <div className="absolute inset-0 z-50 bg-white overflow-y-auto flex flex-col">
          <DocentAdmin currentUser={googleUser?.id || null} />
        </div>
      ) : (
        <DocentDocs />
      )}
      {showDriveTutorial && <DriveTutorialModal onClose={() => setShowDriveTutorial(false)} lang={lang} />}
      
      {isTranscribing && (
        <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-700/50 shadow-2xl rounded-3xl p-8 max-w-md w-full text-center space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin animate-spin-slow" />
              <Sparkles className="w-6 h-6 text-indigo-400 absolute animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Transcribiendo Clase</h3>
              <p className="text-sm text-slate-400 leading-relaxed min-h-[40px]">
                {transcriptionStatusText || "Procesando audio y generando subtítulos locales..."}
              </p>
            </div>
            
            {transcriptionProgress > 0 && (
              <div className="space-y-2">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${transcriptionProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold text-indigo-300 font-mono">
                  <span>DESCARGANDO MODELO</span>
                  <span>{transcriptionProgress}%</span>
                </div>
              </div>
            )}
            
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              100% OFFLINE • SIN ENVÍO DE DATOS A INTERNET
            </p>
          </div>
        </div>
      )}
    </SuiteNavigation>
  );
}
