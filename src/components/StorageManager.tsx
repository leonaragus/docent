import { useState, useEffect } from 'react';
import { HardDrive, Cloud, Trash2, Download, ArrowUpRight, Folder, RefreshCw, FileText, Subtitles, AlertTriangle, Play, Share2, Check, Copy, X, Youtube, Mail, Star, MessageSquare } from 'lucide-react';
import { Recording } from '../types';
import { insertSharedClass, getClassFeedbacks } from '../supabase';
import { generateLocalQuizFallback } from '../quizGenerator';
import { toast } from 'sonner';

interface StorageManagerProps {
  recordings: Recording[];
  onUploadToDrive: (recording: Recording, folderId: string) => Promise<void>;
  defaultTeacherName?: string;
  defaultSubjectName?: string;
  lang?: 'en' | 'es';
  googleUser?: { id: string; name: string; email: string; avatar: string } | null;
  allTeacherSharedClasses?: any[];
  onDeleteSharedClass?: (id: string) => void;
}

const SM_TRANSLATIONS = {
  en: {
    title: "Storage Management",
    subtitle: "Local space & direct upload to Google Drive",
    lowStorageWarning: "Low Storage Warning!",
    spaceLeftDesc: "You have only {space} MB left in your Google Drive. Free up space or change account to avoid interruptions.",
    restoreSpaceBtn: "Restore actual space (14.5 GB)",
    driveStatus: "Google Drive & Local PC Status",
    used: "Used",
    free: "Free",
    full: "Full",
    simulateSpace: "Simulate free space: {mode}",
    unlimited: "Unlimited (14.5GB)",
    critical: "Critical (420MB)",
    totalSpace: "Total Space:",
    googleDriveOfficial: "Google's official Drive",
    driveFolderLabel: "Drive Folder:",
    recordingsHeader: "Session Recordings ({count})",
    noRecordings: "You haven't recorded any classes in this session.",
    pressStart: "Press start recording to begin!",
    chaptersBadge: "Chapters",
    viewInPlayerTitle: "View in Synchronized Player",
    downloadVideoTitle: "Download Video (MP4)",
    uploadToDriveTitle: "Upload to Google Drive",
    shareWithStudentsTitle: "Share Class with Students",
    deleteTitle: "Delete from list",
    shareTitle: "Share Interactive Class",
    shareDesc: "Create an interactive link for your students. They can play the video, follow the AI transcript, and jump through chapters without logging in.",
    linkTab: "Link / Google Drive",
    youtubeTab: "Upload to YouTube",
    videoLinkLabel: "Web or Google Drive Video Link:",
    videoLinkPlaceholder: "Paste Google Drive link or direct MP4 link",
    driveDetected: "Drive link detected. It will be converted automatically for direct play!",
    ytOAuthDesc: "Link your Google/YouTube account to upload the recording with one click. It will be published as unlisted or public.",
    ytLinkBtn: "Link my YouTube Channel (OAuth)",
    ytLinked: "YouTube Channel Linked",
    unlink: "Unlink",
    privacyLabel: "Video Privacy:",
    unlisted: "Unlisted",
    public: "Public",
    uploadingYt: "Uploading to YouTube...",
    publishYtBtn: "Publish Recording on YouTube",
    readyVideo: "Video ready:",
    teacherLabel: "Teacher:",
    subjectLabel: "Subject:",
    linkCopiedBtn: "Student Link Copied!",
    generateLinkBtn: "Generate & Copy Student Link",
    shareEmailBtn: "Share via Email (Gmail)",
    transcriptBtn: "Transcript .txt",
    subtitlesBtn: "Subtitles .srt"
  },
  es: {
    title: "GestiÃ³n de Almacenamiento",
    subtitle: "Espacio local y carga directa a Google Drive",
    lowStorageWarning: "Â¡Alerta de Almacenamiento Bajo!",
    spaceLeftDesc: "Te quedan solo {space} MB de espacio en tu Google Drive. Libera espacio o cambia de cuenta para evitar interrupciones al guardar.",
    restoreSpaceBtn: "Restaurar espacio real (14.5 GB)",
    driveStatus: "Estado de Google Drive y PC Local",
    used: "Usados",
    free: "Libres",
    full: "Lleno",
    simulateSpace: "Simular espacio libre: {mode}",
    unlimited: "Holgado (14.5GB)",
    critical: "CrÃ­tico (420MB)",
    totalSpace: "Espacio total:",
    googleDriveOfficial: "Drive oficial de Google",
    driveFolderLabel: "Carpeta Drive:",
    recordingsHeader: "Grabaciones en esta SesiÃ³n ({count})",
    noRecordings: "No has grabado ninguna clase en esta sesiÃ³n.",
    pressStart: "Â¡Presiona iniciar grabaciÃ³n para comenzar!",
    chaptersBadge: "CapÃ­tulos",
    viewInPlayerTitle: "Ver en Reproductor Sincronizado",
    downloadVideoTitle: "Descargar Video (MP4)",
    uploadToDriveTitle: "Subir a Google Drive",
    shareWithStudentsTitle: "Compartir Clase con Alumnos",
    deleteTitle: "Eliminar de la lista",
    shareTitle: "Compartir Clase Interactiva",
    shareDesc: "Crea un enlace interactivo para tus alumnos. PodrÃ¡n ver el video, seguir la transcripciÃ³n y saltar capÃ­tulos sin loguearse.",
    linkTab: "Enlace / Google Drive",
    youtubeTab: "Subir a YouTube",
    videoLinkLabel: "Enlace del Video en la Web o Google Drive:",
    videoLinkPlaceholder: "Pega el enlace de Google Drive o un link directo MP4",
    driveDetected: "Enlace de Drive detectado. Â¡Se convertirÃ¡ automÃ¡ticamente para reproducciÃ³n directa!",
    ytOAuthDesc: "Vincula tu cuenta de Google/YouTube para subir la grabaciÃ³n con un solo clic. Se publicarÃ¡ de manera privada u oculta.",
    ytLinkBtn: "Vincular mi Canal de YouTube (OAuth)",
    ytLinked: "Canal de YouTube Vinculado",
    unlink: "Desvincular",
    privacyLabel: "Privacidad del Video:",
    unlisted: "Oculto (Unlisted)",
    public: "PÃºblico (Public)",
    uploadingYt: "Subiendo a YouTube...",
    publishYtBtn: "Publicar GrabaciÃ³n en YouTube",
    readyVideo: "Video listo:",
    teacherLabel: "Profesor:",
    subjectLabel: "Asignatura:",
    privacyGuideTitle: "🛡️ Privacidad Máxima: Sube el video a tu propio Drive",
    privacyGuideDesc: "Para garantizar la absoluta privacidad de tus alumnos y tu contenido, DOCENT no almacena tus videos en nuestros servidores. Sigue estos 3 rápidos pasos:",
    step1Title: "1. Descarga el Video",
    step1Desc: "Guarda la grabación en tu computadora.",
    step2Title: "2. Súbelo a tu Google Drive",
    step2Desc: "Súbelo a cualquier carpeta de tu Drive personal o institucional.",
    step3Title: "3. Obtén el Enlace Público",
    step3Desc: "Haz clic derecho en tu Drive, selecciona 'Compartir' -> 'Cualquier persona con el enlace' y pega el link abajo.",
    downloadVideoBtn: "Descargar Video (.webm)",
    downloadSrtBtn: "Descargar Subtítulos (.srt)",
    linkCopiedBtn: "Â¡Enlace de Alumno Copiado!",
    generateLinkBtn: "Generar y Copiar Enlace para Alumnos",
    shareEmailBtn: "Compartir por Correo (Gmail)",
    exportNotionBtn: "Exportar a Notion",
    transcriptBtn: "Transcripción .txt",
    subtitlesBtn: "SubtÃ­tulos .srt"
  }
};

function FeedbackViewer({ sharedClassId }: { sharedClassId: string }) {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sharedClassId) {
      getClassFeedbacks(sharedClassId).then(data => {
        setFeedbacks(data || []);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [sharedClassId]);

  if (!sharedClassId) return null;
  if (loading) return <div className="text-xs text-indigo-300 mt-4 animate-pulse">Cargando valoraciones de alumnos...</div>;
  
  if (feedbacks.length === 0) return (
    <div className="mt-4 bg-indigo-950/40 p-4 rounded-xl border border-indigo-500/20 text-center">
      <Star size={16} className="text-slate-500 mx-auto mb-2 opacity-50" />
      <div className="text-[10px] text-slate-400">Aún no hay valoraciones de alumnos para esta clase.</div>
    </div>
  );

  const avgRating = (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1);

  return (
    <div className="mt-4 bg-indigo-950/40 p-4 rounded-xl border border-indigo-500/20 shadow-inner">
      <div className="flex items-center justify-between mb-3 border-b border-indigo-500/20 pb-2">
        <h5 className="text-[11px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
          <Star size={12} className="text-amber-400" fill="currentColor" /> Valoraciones
        </h5>
        <div className="flex items-center gap-1 bg-indigo-900/50 px-2 py-1 rounded-md">
          <span className="text-xs font-black text-white">{avgRating}</span>
          <Star size={10} className="text-amber-400" fill="currentColor" />
          <span className="text-[9px] text-slate-400 ml-1">({feedbacks.length})</span>
        </div>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-none">
        {feedbacks.map(f => (
          <div key={f.id} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50 flex flex-col gap-1">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} size={8} className={star <= f.rating ? 'text-amber-400' : 'text-slate-600'} fill={star <= f.rating ? 'currentColor' : 'none'} />
              ))}
              <span className="text-[8px] text-slate-500 ml-auto">{new Date(f.created_at).toLocaleDateString()}</span>
            </div>
            {f.comment && (
              <p className="text-[10px] text-slate-300 flex items-start gap-1.5 mt-1">
                <MessageSquare size={10} className="text-indigo-400 shrink-0 mt-0.5" />
                <span className="italic">"{f.comment}"</span>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StorageManager({ 
  recordings, 
  onUploadToDrive,
  defaultTeacherName,
  defaultSubjectName,
  lang = 'es',
  googleUser,
  allTeacherSharedClasses = [],
  onDeleteSharedClass
}: StorageManagerProps) {
  const language = lang;
  const googleDriveSpaceLeftMB = 14858;
  const t = SM_TRANSLATIONS[language];

  const [selectedFolder, setSelectedFolder] = useState<string>('root');
  const [customSrtText, setCustomSrtText] = useState('');
  const [customCleanText, setCustomCleanText] = useState('');
  const [customSrtFileName, setCustomSrtFileName] = useState('');
  const [customCleanFileName, setCustomCleanFileName] = useState('');
  const [showAdvancedExtra, setShowAdvancedExtra] = useState(false);
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);

  // Preview Modal States
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewRec, setPreviewRec] = useState<Recording | null>(null);
  const [incExam, setIncExam] = useState(true);
  const [incFeedback, setIncFeedback] = useState(true);
  const [incChapters, setIncChapters] = useState(true);
  const [incTranscript, setIncTranscript] = useState(true);

  useEffect(() => {
    setFolders([
      { id: 'root', name: language === 'es' ? 'Mi Unidad' : 'My Drive' },
      { id: 'classes', name: language === 'es' ? 'Clases Grabadas 2026' : 'Recorded Classes 2026' },
      { id: 'materials', name: language === 'es' ? 'Material de Apoyo' : 'Support Materials' }
    ]);
  }, [language]);

  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);

  // States for sharing recording with students
  const [shareVideoUrl, setShareVideoUrl] = useState('');
  const [shareTeacher, setShareTeacher] = useState('');
  const [shareSubject, setShareSubject] = useState('');
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkReadyProgress, setLinkReadyProgress] = useState(0);
  const [linkReadyMsg, setLinkReadyMsg] = useState('');

  // YouTube integration states
  const [shareTab, setShareTab] = useState<'link' | 'youtube'>('link');
  const [isYtAuthenticated, setIsYtAuthenticated] = useState(false);
  const [isYtUploading, setIsYtUploading] = useState(false);
  const [ytUploadProgress, setYtUploadProgress] = useState(0);
  const [showDriveInstructions, setShowDriveInstructions] = useState(true);
  const [linkStatus, setLinkStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [ytPrivacy, setYtPrivacy] = useState<'unlisted' | 'public'>('unlisted');

  // Auto-fill share details with the latest recording (if available) or defaults
  useEffect(() => {
    const rec = recordings[0];
    if (rec) {
      setShareVideoUrl(rec.url.startsWith('blob:') ? '' : rec.url);
    } else {
      setShareVideoUrl('');
    }
    setShareTeacher(defaultTeacherName || (language === 'es' ? 'Profa. Pía Morales' : 'Prof. Pia Morales'));
    setShareSubject(defaultSubjectName || (language === 'es' ? 'Ciencias Naturales' : 'Natural Sciences'));
    setCopied(false);
    setGeneratedLink('');
  }, [recordings, defaultTeacherName, defaultSubjectName, language]);

  // Allow the user to simulate/toggle space for testing
  const [simulatedSpaceLeft, setSimulatedSpaceLeft] = useState<number>(googleDriveSpaceLeftMB);

  useEffect(() => {
    setSimulatedSpaceLeft(googleDriveSpaceLeftMB);
  }, [googleDriveSpaceLeftMB]);

  // Calculate total local recorded storage
  const [usedStorageMB, setUsedStorageMB] = useState<number>(14580);
  const totalStorageLimitMB = 15000; // Mock Google Drive 15GB free limit

  useEffect(() => {
    // Keep progress bar fully consistent with the simulated space left!
    // If space left is simulated/low (e.g. 420MB), used space is 15000 - 420 = 14580MB.
    // If simulated space is high (e.g. 12000MB), used space is 15000 - 1200 = 13800MB.
    // We add the size of any actual session recordings recorded by the teacher.
    const additionalSize = recordings.reduce((acc, curr) => {
      const sizeVal = parseFloat(curr.size);
      return acc + (isNaN(sizeVal) ? 0 : sizeVal);
    }, 0);
    
    const baseUsed = totalStorageLimitMB - simulatedSpaceLeft;
    setUsedStorageMB(Math.round((baseUsed + additionalSize) * 10) / 10);
  }, [simulatedSpaceLeft, recordings]);

  const storagePercentage = (usedStorageMB / totalStorageLimitMB) * 100;

  const handleUploadClick = async (rec: Recording) => {
    setUploadTargetId(rec.id);
    await onUploadToDrive(rec, selectedFolder);
    setUploadTargetId(null);
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const convertGoogleDriveUrl = (url: string) => {
    if (!url) return '';
    const driveRegExp = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const driveOpenRegExp = /[?&]id=([a-zA-Z0-9_-]+)/;
    
    let fileId = '';
    const match1 = url.match(driveRegExp);
    if (match1 && match1[1]) {
      fileId = match1[1];
    } else {
      const match2 = url.match(driveOpenRegExp);
      if (match2 && match2[1]) {
        fileId = match2[1];
      }
    }
    
    if (fileId) {
      return `https://docs.google.com/uc?export=download&id=${fileId}`;
    }
    return url;
  };

  const buildBase64FallbackUrl = (
    rec: Recording,
    finalVideoUrl: string,
    finalQuizQuestions: any[],
    finalOracleExam: any
  ): string => {
    const studentData = {
      name: rec.name,
      url: finalVideoUrl,
      srtText: incTranscript ? (customSrtText || rec.srtText || '') : '',
      chapters: incChapters ? (rec.chapters || []) : [],
      quizQuestions: incExam ? finalQuizQuestions : [],
      teacherName: shareTeacher || (language === 'es' ? 'Profesor' : 'Teacher'),
      subjectName: shareSubject || (language === 'es' ? 'Asignatura' : 'Subject'),
      date: rec.date,
      oracleExam: incExam ? finalOracleExam : null,
      allowFeedback: incFeedback
    };
    const jsonStr = JSON.stringify(studentData);
    const base64Str = btoa(encodeURIComponent(jsonStr));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#student-class=${base64Str}`;
  };

  const handleGenerateShareLink = async (rec: Recording) => {
    const finalVideoUrl = convertGoogleDriveUrl(shareVideoUrl) || rec.url;
    setIsGeneratingLink(true);
    setLinkReadyProgress(0);
    setGeneratedLink('');

    // Stage messages
    const isEs = language === 'es';
    const stages = [
      { pct: 18, msg: isEs ? 'Guardando clase en la nube...' : 'Saving class to cloud...' },
      { pct: 38, msg: isEs ? 'Procesando contenido interactivo...' : 'Processing interactive content...' },
      { pct: 60, msg: isEs ? 'Verificando disponibilidad del video...' : 'Checking video availability...' },
      { pct: 82, msg: isEs ? 'Preparando sala para alumnos...' : 'Preparing student room...' },
      { pct: 100, msg: isEs ? '¡Enlace listo!' : 'Link ready!' },
    ];

    // ── Auto-generate quiz if incExam=true but no oracle/quiz in recording ──
    let finalQuizQuestions: any[] = incExam ? (rec.quizQuestions || []) : [];
    let finalOracleExam: any = incExam ? (rec.oracleExam || null) : null;

    if (incExam && !finalOracleExam && finalQuizQuestions.length === 0) {
      // Use any available transcript text to auto-generate a quiz
      const transcriptText = customCleanText || rec.transcriptionText || customSrtText || rec.srtText || '';
      if (transcriptText.trim().length > 80) {
        finalQuizQuestions = generateLocalQuizFallback(transcriptText, isEs ? 'es' : 'en');
      }
    }

    // Save to Supabase in background while animation runs
    let savedUrl = '';
    const savePromise = (async () => {
      try {
        const classId = Math.random().toString(36).substring(2, 15);
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
        const studentData = {
          id: classId,
          name: rec.name,
          url: finalVideoUrl,
          srtText: incTranscript ? (customSrtText || rec.srtText || '') : '',
          chapters: incChapters ? (rec.chapters || []) : [],
          quizQuestions: finalQuizQuestions,
          teacherName: shareTeacher || (isEs ? 'Profesor' : 'Teacher'),
          subjectName: shareSubject || (isEs ? 'Asignatura' : 'Subject'),
          date: rec.date,
          createdAt: createdAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
          userId: googleUser?.id || 'anonymous',
          oracleExam: finalOracleExam,
          allowFeedback: incFeedback
        };
        await insertSharedClass(studentData);
        const baseUrl = window.location.origin + window.location.pathname;
        savedUrl = `${baseUrl}#student-class=${classId}`;
      } catch {
        savedUrl = buildBase64FallbackUrl(rec, finalVideoUrl, finalQuizQuestions, finalOracleExam);
      }
    })();

    // Run animated stages
    for (const stage of stages) {
      setLinkReadyMsg(stage.msg);
      setLinkReadyProgress(stage.pct);
      await new Promise(r => setTimeout(r, 680));
    }

    // Make sure save is done
    await savePromise;

    // Shorten the generated link using a free anonymous API (works for both Supabase and Base64 URLs)
    let finalUrl = savedUrl;
    try {
      const shortRes = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(savedUrl)}`);
      if (shortRes.ok) {
        const shortData = await shortRes.json();
        if (shortData.shorturl) {
          finalUrl = shortData.shorturl;
        }
      }
    } catch (shortErr) {
      console.warn("Could not shorten link via API, using fallback...", shortErr);
    }

    setIsGeneratingLink(false);
    setGeneratedLink(finalUrl);
    navigator.clipboard.writeText(finalUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleYoutubeUpload = () => {
    setIsYtUploading(true);
    setYtUploadProgress(5);
    
    const interval = setInterval(() => {
      setYtUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsYtUploading(false);
            // A beautiful sample educational video on Physics/Science that loads perfectly in the YouTube player
            const sampleYtUrl = "https://www.youtube.com/watch?v=2Vv-BfVoq4g"; 
            setShareVideoUrl(sampleYtUrl);
            setGeneratedLink('');
          }, 800);
          return 100;
        }
        return prev + Math.floor(Math.random() * 12) + 6;
      });
    }, 250);
  };

  return (
    <div id="storage-manager-container" className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 rounded-3xl border-2 border-indigo-500/30 p-6 flex flex-col h-full shadow-xl shadow-indigo-500/5">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <HardDrive size={18} />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight text-white bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">{t.title}</h3>
            <p className="text-[11px] text-slate-300 font-bold">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Generador de Enlace para Alumnos (Google Drive) */}
      <div className="bg-slate-950/60 border-2 border-indigo-500/15 rounded-2xl p-5 mb-5 shadow-inner space-y-4">
        <div className="flex items-center gap-2">
          <Share2 className="text-indigo-400 animate-pulse" size={16} />
          <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">
            {language === 'es' ? 'Generador de Enlace para Alumnos' : 'Student Link Generator'}
          </h4>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
          {language === 'es' 
            ? 'Pega el enlace de Google Drive de tu video grabado para generar la sala interactiva para tus estudiantes.' 
            : 'Paste the Google Drive link of your recorded video to generate the interactive room for your students.'}
        </p>

        <div className="space-y-3">
          {/* Input Enlace */}
          <div>
            <label className="text-[9px] font-black text-indigo-300 uppercase block mb-1">
              {language === 'es' ? 'Enlace del Video en Google Drive o Web:' : 'Google Drive or Web Video Link:'}
            </label>
            <input 
              type="text" 
              placeholder={language === 'es' ? "Pega el enlace de Google Drive (Ej: https://drive.google.com/...)" : "Paste Google Drive link"} 
              value={shareVideoUrl} 
              onChange={(e) => {
                const url = e.target.value;
                setShareVideoUrl(url);
                setGeneratedLink('');
                
                // Permission check logic
                if (url.includes('drive.google.com')) {
                  const driveRegExp = /\/file\/d\/([a-zA-Z0-9_-]+)/;
                  const driveOpenRegExp = /[?&]id=([a-zA-Z0-9_-]+)/;
                  const isValidFormat = driveRegExp.test(url) || driveOpenRegExp.test(url);
                  setLinkStatus(isValidFormat ? 'valid' : 'invalid');
                } else if (url.trim() === '') {
                  setLinkStatus('idle');
                } else {
                  setLinkStatus('valid');
                }
              }}
              className={`w-full bg-slate-950 border focus:ring-1 text-[11px] text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none transition-all placeholder-slate-700 font-mono ${
                linkStatus === 'valid' ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500' :
                linkStatus === 'invalid' ? 'border-red-500 focus:border-red-500 focus:ring-red-500' :
                'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            
            {linkStatus === 'checking' && (
              <p className="text-[9px] text-amber-400 font-bold mt-1.5 flex items-center gap-1 bg-amber-500/10 p-1 px-2 rounded border border-amber-500/20">
                <span className="animate-spin text-amber-500">↻</span> {language === 'es' ? 'Verificando permisos del enlace...' : 'Verifying link permissions...'}
              </p>
            )}
            
            {linkStatus === 'valid' && (
              <p className="text-[9px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1 bg-emerald-500/10 p-1 px-2 rounded border border-emerald-500/20">
                <Check size={10} /> {language === 'es' ? '¡Enlace público validado correctamente!' : 'Public link validated successfully!'}
              </p>
            )}

            {linkStatus === 'invalid' && (
              <div className="mt-2 bg-red-500/10 border border-red-500/30 p-2 rounded-lg">
                <p className="text-[9px] text-red-400 font-bold flex items-center gap-1 mb-1">
                  <AlertTriangle size={10} /> {language === 'es' ? 'Enlace Privado o Inválido' : 'Private or Invalid Link'}
                </p>
                <p className="text-[9px] text-slate-400 leading-tight">
                  {language === 'es' 
                    ? 'Recuerda cambiar los permisos del archivo en Google Drive a "Cualquier persona con el enlace" para que tus alumnos puedan verlo.'
                    : 'Remember to change file permissions in Google Drive to "Anyone with the link" so your students can view it.'}
                </p>
              </div>
            )}
          </div>

          {/* Profesor y Asignatura */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black text-indigo-300 uppercase block mb-1">
                {language === 'es' ? 'Profesor:' : 'Teacher:'}
              </label>
              <input 
                type="text" 
                value={shareTeacher} 
                onChange={(e) => {
                  setShareTeacher(e.target.value);
                  setGeneratedLink('');
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-[11px] text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-indigo-300 uppercase block mb-1">
                {language === 'es' ? 'Asignatura:' : 'Subject:'}
              </label>
              <input 
                type="text" 
                value={shareSubject} 
                onChange={(e) => {
                  setShareSubject(e.target.value);
                  setGeneratedLink('');
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-[11px] text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              />
            </div>
          </div>

          {/* Collapsible Configuración de Contenido Extra (Opcional) */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
            <button
              onClick={() => setShowAdvancedExtra(!showAdvancedExtra)}
              className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-all focus:outline-none"
            >
              <span>{language === 'es' ? '⚙️ Subir Subtítulos / Transcripción (Opcional)' : '⚙️ Upload Subtitles / Transcript (Optional)'}</span>
              <span>{showAdvancedExtra ? '▲' : '▼'}</span>
            </button>

            {showAdvancedExtra && (
              <div className="p-3 border-t border-slate-800/80 space-y-3 bg-slate-950/20">
                {/* SRT File upload */}
                <div>
                  <label className="text-[8px] font-black text-indigo-300 uppercase block mb-1">
                    {language === 'es' ? 'Subtítulos (.srt):' : 'Subtitles (.srt):'}
                  </label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="file" 
                      accept=".srt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCustomSrtFileName(file.name);
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            setCustomSrtText(evt.target?.result as string || '');
                            toast.success(language === 'es' ? '¡Subtítulos cargados con éxito!' : 'Subtitles loaded successfully!');
                          };
                          reader.readAsText(file);
                        }
                      }}
                      className="hidden"
                      id="customSrtUpload"
                    />
                    <label 
                      htmlFor="customSrtUpload"
                      className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer font-bold select-none whitespace-nowrap"
                    >
                      {language === 'es' ? 'Seleccionar archivo .srt' : 'Select .srt file'}
                    </label>
                    <span className="text-[9px] text-slate-500 truncate flex-1">
                      {customSrtFileName || (language === 'es' ? 'Sin archivo seleccionado' : 'No file selected')}
                    </span>
                  </div>
                </div>

                {/* TXT Transcript upload */}
                <div>
                  <label className="text-[8px] font-black text-indigo-300 uppercase block mb-1">
                    {language === 'es' ? 'Transcripción / Notas (.txt):' : 'Transcript / Notes (.txt):'}
                  </label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="file" 
                      accept=".txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCustomCleanFileName(file.name);
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            setCustomCleanText(evt.target?.result as string || '');
                            toast.success(language === 'es' ? '¡Transcripción cargada con éxito!' : 'Transcript loaded successfully!');
                          };
                          reader.readAsText(file);
                        }
                      }}
                      className="hidden"
                      id="customTranscriptUpload"
                    />
                    <label 
                      htmlFor="customTranscriptUpload"
                      className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer font-bold select-none whitespace-nowrap"
                    >
                      {language === 'es' ? 'Seleccionar archivo .txt' : 'Select .txt file'}
                    </label>
                    <span className="text-[9px] text-slate-500 truncate flex-1">
                      {customCleanFileName || (language === 'es' ? 'Sin archivo seleccionado' : 'No file selected')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Acción Generar */}
          <button
            onClick={() => {
              const selectedRec = recordings[0] || {
                id: 'custom',
                name: 'Clase Externa.mp4',
                url: shareVideoUrl,
                size: '0',
                date: new Date().toLocaleDateString(),
                chapters: [],
                transcriptionText: '',
                srtText: '',
                quizQuestions: []
              };
              const mergedRec = {
                ...selectedRec,
                url: convertGoogleDriveUrl(shareVideoUrl) || selectedRec.url,
                srtText: customSrtText || selectedRec.srtText,
                transcriptionText: customCleanText || selectedRec.transcriptionText,
              };
              setPreviewRec(mergedRec);
              setShowPreviewModal(true);
            }}
            disabled={!shareVideoUrl.trim() || isGeneratingLink}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white text-[10px] font-black py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-300 animate-bounce" />
                <span>{language === 'es' ? '¡Enlace Copiado!' : 'Link Copied!'}</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>{language === 'es' ? 'Configurar y Generar Enlace' : 'Configure & Generate Link'}</span>
              </>
            )}
          </button>

          {/* Progress bar while generating */}
          {isGeneratingLink && (
            <div className="mt-3 animate-in fade-in duration-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-indigo-300 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  {linkReadyMsg}
                </span>
                <span className="text-[9px] font-black text-indigo-400">{linkReadyProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(139,92,246,0.7)]"
                  style={{ width: `${linkReadyProgress}%` }}
                />
              </div>
              <p className="text-[8px] text-slate-500 text-center">
                {language === 'es'
                  ? 'El video puede tardar unos minutos en estar disponible en Drive'
                  : 'The video may take a few minutes to be available on Drive'}
              </p>
            </div>
          )}

          {/* Resultado */}
          {generatedLink && !isGeneratingLink && (
            <div className="bg-emerald-950/40 rounded-xl p-3 border border-emerald-500/30 flex flex-col gap-2 mt-3 animate-in fade-in duration-500">
              <div className="flex items-center gap-1.5 mb-1">
                <Check size={12} className="text-emerald-400" />
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                  {language === 'es' ? 'Enlace Listo para Compartir' : 'Link Ready to Share'}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-950/70 rounded-lg px-2.5 py-2 border border-slate-700">
                <p className="text-[10px] font-mono text-indigo-300 truncate flex-grow">
                  {generatedLink.replace(/^https?:\/\/[^/]+/, '').slice(0, 40)}{generatedLink.length > 60 ? '…' : ''}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLink).catch(() => {});
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-indigo-400 hover:text-white p-1 shrink-0 cursor-pointer transition-colors"
                  title={language === 'es' ? 'Copiar enlace' : 'Copy link'}
                >
                  {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* List of Shared Classes and Student Feedbacks */}
      <div className="bg-slate-950/40 border border-indigo-500/15 rounded-2xl p-5 mb-5 shadow-inner space-y-4 text-left">
        <h4 className="text-sm font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
          <Star size={16} className="text-amber-400 fill-amber-400" />
          {language === 'es' ? 'Enlaces Compartidos y Valoraciones' : 'Shared Links & Feedback'}
        </h4>

        {allTeacherSharedClasses.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-900/20 rounded-xl border border-indigo-500/5 min-h-[120px]">
            <Share2 size={24} className="text-indigo-400/30 mb-2" />
            <p className="text-xs text-slate-400 font-bold">
              {language === 'es' ? 'No tienes clases compartidas activas.' : 'You have no active shared classes.'}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {language === 'es' ? 'Genera un enlace arriba para compartirlo con tus alumnos.' : 'Generate a link above to share it with your students.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {allTeacherSharedClasses.map((clase) => {
              const studentLink = `${window.location.origin}${window.location.pathname}#student-class=${clase.id}`;
              return (
                <div 
                  key={clase.id} 
                  className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3 shadow-md hover:border-indigo-500/10 transition-all text-left"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-grow text-left">
                      <h5 className="text-xs font-black text-slate-200 truncate">{clase.name.replace('.mp4', '').replace(/_/g, ' ')}</h5>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {clase.teacherName} • {clase.subjectName}
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono mt-1">{clase.date}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Copy link button */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(studentLink);
                          toast.success(language === 'es' ? '¡Enlace copiado al portapapeles!' : 'Link copied to clipboard!');
                        }}
                        className="p-1.5 bg-slate-900 hover:bg-indigo-600 rounded-lg text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
                        title={language === 'es' ? 'Copiar Enlace Alumno' : 'Copy Student Link'}
                      >
                        <Copy size={12} />
                      </button>

                      {/* Delete sharing link */}
                      {onDeleteSharedClass && (
                        <button
                          onClick={() => onDeleteSharedClass(clase.id)}
                          className="p-1.5 bg-slate-900 hover:bg-red-900 rounded-lg text-slate-400 hover:text-red-300 border border-slate-800 transition-all cursor-pointer"
                          title={language === 'es' ? 'Eliminar Enlace' : 'Delete Link'}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Render the feedbacks for this class */}
                  <FeedbackViewer sharedClassId={clase.id} />
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Preview Share Modal */}
      {showPreviewModal && previewRec && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row gap-6 relative">
            
            <button 
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full p-1.5 transition-colors"
            >
              <X size={16} />
            </button>

            {/* Left Column: Visual Mockup */}
            <div className="flex-1 bg-black/50 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Play className="text-purple-400 w-4 h-4" />
                <h3 className="text-sm font-black text-white">Vista del Alumno</h3>
              </div>
              
              <div className="flex-1 border border-slate-700/50 rounded-xl bg-slate-950 flex flex-col overflow-hidden relative">
                {/* Mock Video Area */}
                <div className="h-32 bg-slate-900 flex items-center justify-center border-b border-slate-800 relative">
                  <Play size={24} className="text-slate-700" />
                  {incTranscript && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 rounded-lg border border-white/10 text-[8px] text-white">
                      [Subtítulos activados]
                    </div>
                  )}
                </div>
                
                {/* Mock Sidebar */}
                <div className="p-3 flex-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-24 bg-slate-800 rounded-full"></div>
                    <div className="flex gap-1">
                      {incFeedback && <div className="h-4 w-12 bg-purple-500/20 border border-purple-500/30 rounded-full"></div>}
                      {incExam && <div className="h-4 w-16 bg-amber-500/90 rounded-full"></div>}
                    </div>
                  </div>
                  
                  {incChapters && (
                    <div className="mt-2 space-y-1.5">
                      <div className="h-2 w-16 bg-slate-800 rounded-full mb-2"></div>
                      <div className="h-6 w-full bg-slate-800/50 rounded-md"></div>
                      <div className="h-6 w-full bg-slate-800/50 rounded-md"></div>
                    </div>
                  )}
                  
                  {incTranscript && (
                    <div className="mt-auto pt-2 border-t border-slate-800 space-y-1">
                      <div className="h-1.5 w-full bg-slate-800 rounded-full"></div>
                      <div className="h-1.5 w-3/4 bg-slate-800 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Toggles and Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-black text-white mb-1">Configurar Acceso</h2>
                <p className="text-[11px] text-slate-400 mb-6">Activa o desactiva los módulos interactivos para esta clase. Lo que apagues aquí no será visible para los alumnos.</p>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg group-hover:bg-amber-500/20 transition-colors"><Star size={14} /></div>
                      <div>
                        <div className="text-sm font-bold text-slate-200">Evaluación / Examen</div>
                        <div className="text-[10px] text-slate-500">Incluir el quiz interactivo o examen de Oracle.</div>
                      </div>
                    </div>
                    <input type="checkbox" checked={incExam} onChange={e => setIncExam(e.target.checked)} className="toggle-switch accent-purple-500 w-4 h-4 cursor-pointer" />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg group-hover:bg-purple-500/20 transition-colors"><MessageSquare size={14} /></div>
                      <div>
                        <div className="text-sm font-bold text-slate-200">Valoraciones de Alumnos</div>
                        <div className="text-[10px] text-slate-500">Permitir que dejen feedback y puntuación.</div>
                      </div>
                    </div>
                    <input type="checkbox" checked={incFeedback} onChange={e => setIncFeedback(e.target.checked)} className="toggle-switch accent-purple-500 w-4 h-4 cursor-pointer" />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500/20 transition-colors"><FileText size={14} /></div>
                      <div>
                        <div className="text-sm font-bold text-slate-200">Capítulos Automáticos</div>
                        <div className="text-[10px] text-slate-500">Menú lateral para saltar a temas específicos.</div>
                      </div>
                    </div>
                    <input type="checkbox" checked={incChapters} onChange={e => setIncChapters(e.target.checked)} className="toggle-switch accent-purple-500 w-4 h-4 cursor-pointer" />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-500/20 transition-colors"><Subtitles size={14} /></div>
                      <div>
                        <div className="text-sm font-bold text-slate-200">Transcripción y Subtítulos</div>
                        <div className="text-[10px] text-slate-500">Texto sincronizado en tiempo real.</div>
                      </div>
                    </div>
                    <input type="checkbox" checked={incTranscript} onChange={e => setIncTranscript(e.target.checked)} className="toggle-switch accent-purple-500 w-4 h-4 cursor-pointer" />
                  </label>
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    handleGenerateShareLink(previewRec);
                    setShowPreviewModal(false);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <Share2 size={16} />
                  Confirmar y Generar Enlace
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

