import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Sparkles, Subtitles, Compass, CornerRightDown, HelpCircle, CheckCircle, XCircle, Award, Star, MessageSquare, Send, X } from 'lucide-react';
import { ChapterMarker, QuizQuestion } from '../types';
import { submitClassFeedback } from '../supabase';
import { toast } from 'sonner';
import { translations, Language } from '../locales';
import ExamRunner from './Oracle/ExamRunner';

interface SRTLine {
  id: number;
  start: number; // seconds
  end: number;   // seconds
  text: string;
}

interface SyncedPlayerProps {
  videoUrl: string;
  sharedClassId?: string;
  srtText?: string;
  videoFilter: string;
  getFilterStyle: (filter: string) => string;
  classTitle: string;
  teacherName: string;
  subjectName: string;
  chapters?: ChapterMarker[];
  quizQuestions?: QuizQuestion[];
  oracleExam?: any;
  allowFeedback?: boolean;
  lang?: string;
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function SyncedPlayer({
  videoUrl,
  sharedClassId,
  srtText,
  videoFilter,
  getFilterStyle,
  classTitle,
  teacherName,
  subjectName,
  chapters = [],
  quizQuestions = [],
  oracleExam = null,
  allowFeedback = true,
  lang = 'es'
}: SyncedPlayerProps) {
  const t = translations[lang as Language] || translations['es'];

  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const iframeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const iframeElapsedRef = useRef<number>(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [parsedSrt, setParsedSrt] = useState<SRTLine[]>([]);
  const [activeCueId, setActiveCueId] = useState<number | null>(null);
  const [iframeSyncActive, setIframeSyncActive] = useState(false);

  // Drive detection and fallback state
  const isDrive = videoUrl && (videoUrl.includes('drive.google.com') || videoUrl.includes('docs.google.com'));
  const getDriveId = (url: string) => {
    if (!url) return null;
    const driveRegExp = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const driveOpenRegExp = /[?&]id=([a-zA-Z0-9_-]+)/;
    const match1 = url.match(driveRegExp);
    if (match1 && match1[1]) return match1[1];
    const match2 = url.match(driveOpenRegExp);
    if (match2 && match2[1]) return match2[1];
    return null;
  };
  const driveId = isDrive ? getDriveId(videoUrl) : null;
  const [useIframeFallback, setUseIframeFallback] = useState(!!isDrive);

  // Start iframe sync timer
  const startIframeSync = () => {
    if (iframeTimerRef.current) clearInterval(iframeTimerRef.current);
    setIframeSyncActive(true);
    iframeTimerRef.current = setInterval(() => {
      iframeElapsedRef.current += 0.25;
      setCurrentTime(iframeElapsedRef.current);
    }, 250);
  };

  const stopIframeSync = () => {
    if (iframeTimerRef.current) {
      clearInterval(iframeTimerRef.current);
      iframeTimerRef.current = null;
    }
    setIframeSyncActive(false);
  };

  // Cleanup iframe timer on unmount or video change
  useEffect(() => {
    return () => {
      if (iframeTimerRef.current) clearInterval(iframeTimerRef.current);
    };
  }, [videoUrl]);

  // Tabs for right panel
  const [activeTab, setActiveTab] = useState<'transcript' | 'quiz'>('transcript');
  
  // Quiz State
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Feedback State
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  
  // Verify if already rated (works with or without sharedClassId)
  useEffect(() => {
    const ratingKey = sharedClassId ? `docent_rated_${sharedClassId}` : `docent_rated_${videoUrl.slice(-20)}`;
    if (localStorage.getItem(ratingKey)) {
      setHasSubmittedFeedback(true);
    }
  }, [sharedClassId, videoUrl]);

  // Auto-trigger feedback popup after 5 min of playback (works for both native video and iframe sync)
  useEffect(() => {
    if (!allowFeedback || hasSubmittedFeedback || showFeedback) return;

    // For native video with known duration: trigger 5 min before end
    if (duration > 0 && currentTime > 0) {
      const timeLeft = duration - currentTime;
      if (timeLeft <= 300 && (currentTime / duration) > 0.1) {
        setShowFeedback(true);
        return;
      }
    }

    // For iframe / unknown duration: trigger after 5 minutes of elapsed time
    if (currentTime >= 300 && duration === 0) {
      setShowFeedback(true);
    }
  }, [currentTime, duration, hasSubmittedFeedback, showFeedback, allowFeedback]);

  const handleFeedbackSubmit = async () => {
    if (feedbackRating === 0) {
      toast.error(lang === 'es' ? 'Por favor selecciona una puntuación' : 'Please select a rating');
      return;
    }

    setIsSubmittingFeedback(true);
    const ratingKey = sharedClassId ? `docent_rated_${sharedClassId}` : `docent_rated_${videoUrl.slice(-20)}`;

    try {
      if (sharedClassId) {
        // Send to Supabase only when we have a real class ID
        await submitClassFeedback(sharedClassId, feedbackRating, feedbackComment);
      }
      localStorage.setItem(ratingKey, 'true');
      setHasSubmittedFeedback(true);
      setShowFeedback(false);
      toast.success(lang === 'es' ? '¡Gracias! Tu valoración ha sido enviada al profesor.' : 'Thank you! Your feedback was sent to the teacher.');
    } catch (e) {
      console.error(e);
      toast.error(lang === 'es' ? 'Hubo un error al enviar tu comentario' : 'Error submitting feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };
  
  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) score++;
    });
    return score;
  };

  // YouTube Specific State & Refs
  const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
  const ytId = isYouTube ? getYouTubeId(videoUrl) : null;
  const [ytPlayer, setYtPlayer] = useState<any>(null);

  // Parse the SRT text into interactive lines
  useEffect(() => {
    if (!srtText) {
      const fallbackSrt = `1
00:00:00,000 --> 00:00:04,500
[Profesor] Bienvenidos alumnos a esta clase interactiva grabada.

2
00:00:04,800 --> 00:00:09,000
Hoy revisaremos el tema principal y los capítulos de la sesión.

3
00:00:09,500 --> 00:00:15,000
Recuerda que puedes hacer clic en cualquier frase a la derecha para saltar directamente a ese momento del video.

4
00:00:15,500 --> 00:00:20,000
Acompáñame a revisar los apuntes y la explicación de hoy.`;
      setParsedSrt(parseSRTText(fallbackSrt));
    } else {
      setParsedSrt(parseSRTText(srtText));
    }
  }, [srtText]);

  // Track active subtitle line and auto-scroll
  useEffect(() => {
    const activeLine = parsedSrt.find(line => currentTime >= line.start && currentTime <= line.end);
    if (activeLine) {
      if (activeCueId !== activeLine.id) {
        setActiveCueId(activeLine.id);
        
        const activeElement = document.getElementById(`srt-cue-${activeLine.id}`);
        if (activeElement && transcriptContainerRef.current) {
          transcriptContainerRef.current.scrollTo({
            top: activeElement.offsetTop - transcriptContainerRef.current.offsetHeight / 2 + activeElement.offsetHeight / 2,
            behavior: 'smooth'
          });
        }
      }
    } else {
      if (activeCueId !== null) {
        setActiveCueId(null);
      }
    }
  }, [currentTime, parsedSrt, activeCueId]);

  // Dynamic YouTube Player Initialization
  useEffect(() => {
    if (!isYouTube || !ytId) {
      if (ytPlayer) {
        try { ytPlayer.destroy(); } catch (e) {}
        setYtPlayer(null);
      }
      return;
    }

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    let interval: any;
    
    const initPlayer = () => {
      setTimeout(() => {
        const container = document.getElementById('youtube-player');
        if (!container) return;
        
        try {
          const player = new (window as any).YT.Player('youtube-player', {
            videoId: ytId,
            playerVars: {
              autoplay: 0,
              controls: 1,
              modestbranding: 1,
              rel: 0,
            },
            events: {
              onReady: (event: any) => {
                setYtPlayer(player);
                setDuration(player.getDuration() || 0);
              },
              onStateChange: (event: any) => {
                const state = event.data;
                setIsPlaying(state === 1);
                
                if (state === 1) {
                  if (interval) clearInterval(interval);
                  interval = setInterval(() => {
                    if (player && player.getCurrentTime) {
                      setCurrentTime(player.getCurrentTime());
                    }
                  }, 250);
                } else {
                  if (interval) clearInterval(interval);
                }
              }
            }
          });
        } catch (e) {
          console.error("Error creating YouTube player instance", e);
        }
      }, 100);
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      const prevCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [videoUrl, isYouTube, ytId]);

  function parseSRTText(text: string): SRTLine[] {
    const blocks = text.trim().split(/\n\s*\n/);
    const result: SRTLine[] = [];

    const timeToSeconds = (timeStr: string) => {
      const parts = timeStr.split(':');
      if (parts.length < 3) return 0;
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const [seconds, ms] = parts[2].split(',');
      return hours * 3600 + minutes * 60 + parseInt(seconds, 10) + (parseInt(ms, 10) || 0) / 1000;
    };

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length >= 3) {
        const id = parseInt(lines[0], 10);
        const timeRange = lines[1];
        const cueText = lines.slice(2).join(' ');

        if (timeRange && timeRange.includes('-->')) {
          const [startStr, endStr] = timeRange.split('-->').map(t => t.trim());
          result.push({
            id,
            start: timeToSeconds(startStr),
            end: timeToSeconds(endStr),
            text: cueText
          });
        }
      }
    }
    return result;
  }

  const handlePlayPause = () => {
    if (isYouTube && ytPlayer) {
      if (isPlaying) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
      setIsPlaying(!isPlaying);
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (seconds: number) => {
    if (isYouTube && ytPlayer) {
      ytPlayer.seekTo(seconds, true);
      setCurrentTime(seconds);
    } else if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const formatTime = (timeInSecs: number) => {
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-b from-indigo-950/70 via-slate-900/90 to-slate-950 rounded-3xl border-2 border-indigo-500/30 p-6 shadow-2xl relative overflow-y-auto lg:overflow-visible w-full max-w-7xl mx-auto">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Synchronized Player Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 pb-4 border-b border-indigo-500/20 relative z-10">
        <div>
          <span className="text-[10px] font-black tracking-widest bg-gradient-to-r from-pink-500 to-indigo-500 text-white px-3 py-1 rounded-full uppercase border border-pink-400/20 animate-pulse">
            Vista del Alumno • Reproductor Inteligente
          </span>
          <h3 className="text-lg font-black text-white mt-1">{classTitle}</h3>
          <p className="text-xs text-indigo-300 font-bold">Docente: {teacherName} • Asignatura: {subjectName}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
          <Sparkles size={13} className="animate-spin" />
          <span>Transcripción Sincronizada Activa</span>
        </div>
      </div>

      {/* Spatial Holographic Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 h-full">
        
        {/* Left Side: Immersive Video Player */}
        <div className="lg:col-span-8 flex flex-col space-y-4 relative">
          
          {/* Dynamic Glow behind video */}
          <div className="absolute inset-0 bg-indigo-500/10 blur-[50px] rounded-[40px] pointer-events-none" />

          <div 
            className="aspect-video bg-black/90 rounded-3xl border border-indigo-500/20 relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.85)] hover:shadow-[0_0_60px_rgba(99,102,241,0.2)] hover:border-indigo-400/40 transition-all duration-500 backdrop-blur-3xl"
            style={{ filter: getFilterStyle(videoFilter) }}
          >
            {/* Drive Mode Indicator / Toggle */}
            {isDrive && driveId && (
              <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUseIframeFallback(!useIframeFallback)}
                  className="px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 hover:text-white flex items-center gap-2 shadow-lg shadow-black/40 cursor-pointer"
                >
                  <Compass size={12} className="animate-spin-slow" />
                  <span>{useIframeFallback ? (lang === 'es' ? 'Ver Reproductor Directo' : 'Switch to Direct Player') : (lang === 'es' ? 'Ver Espejo Google Drive' : 'Switch to Google Drive Iframe')}</span>
                </button>
              </div>
            )}

            {isYouTube && ytId ? (
              <div className="w-full h-full relative">
                <div id="youtube-player" className="w-full h-full absolute inset-0" />
              </div>
            ) : (useIframeFallback && driveId) ? (
              <div className="w-full h-full relative">
                <iframe
                  src={`https://drive.google.com/file/d/${driveId}/preview`}
                  className="w-full h-full border-0 absolute inset-0 rounded-2xl"
                  allow="autoplay"
                  allowFullScreen
                />
                {/* Iframe sync overlay */}
                {!iframeSyncActive ? (
                  <div className="absolute inset-0 flex items-end justify-center pb-6 z-30 pointer-events-none">
                    <button
                      onClick={startIframeSync}
                      className="pointer-events-auto flex items-center gap-2 bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-500/60 text-indigo-200 text-[11px] font-black px-4 py-2.5 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-105 cursor-pointer backdrop-blur-md"
                    >
                      <Play size={13} className="text-indigo-400" />
                      {lang === 'es' ? 'Sincronizar Transcripción' : 'Sync Transcript'}
                    </button>
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                    <button
                      onClick={stopIframeSync}
                      className="flex items-center gap-1.5 bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-[10px] font-black px-3 py-1.5 rounded-full cursor-pointer transition-all backdrop-blur-md"
                    >
                      <Pause size={11} />
                      {lang === 'es' ? 'Pausar Sync' : 'Pause Sync'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <video 
                ref={videoRef}
                src={videoUrl} 
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onError={() => {
                  if (isDrive && driveId) {
                    setUseIframeFallback(true);
                  }
                }}
                className="w-full h-full object-contain"
                onClick={handlePlayPause}
              />
            )}

            {/* Focus Quiz / Oracle Exam Overlay Modal */}
            {activeTab === 'quiz' && !quizSubmitted && (
              <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500 overflow-y-auto">
                {oracleExam ? (
                  <div className="bg-white/5 border border-white/20 p-4 rounded-3xl w-full max-w-4xl max-h-[90%] overflow-y-auto shadow-2xl">
                    <ExamRunner 
                      exam={oracleExam} 
                      onBackToCreator={() => setActiveTab('transcript')} 
                    />
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/20 p-8 rounded-3xl max-w-lg w-full max-h-[90%] overflow-y-auto shadow-2xl space-y-6 scrollbar-none">
                    <h4 className="text-xl font-black text-white flex items-center justify-center gap-2 mb-6">
                      <Sparkles className="text-amber-400" size={24} />
                      Focus Quiz
                    </h4>
                    
                    {quizQuestions.map((q) => (
                      <div key={q.id} className="space-y-3">
                        <p className="text-sm text-white font-bold leading-relaxed">{q.question}</p>
                        
                        {q.type === 'fill_blank' ? (
                          <input 
                            type="text" 
                            placeholder={t.writeAnswer}
                            className="w-full bg-black/50 border border-white/20 focus:border-amber-400 text-sm text-white rounded-xl px-4 py-3 focus:outline-none transition-all shadow-inner"
                            value={userAnswers[q.id] || ''}
                            onChange={(e) => setUserAnswers({...userAnswers, [q.id]: e.target.value})}
                          />
                        ) : (
                          <div className="space-y-2">
                            {q.options?.map(opt => (
                              <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                                userAnswers[q.id] === opt ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'bg-black/40 border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20'
                              }`}>
                                <input 
                                  type="radio" 
                                  name={q.id} 
                                  value={opt}
                                  checked={userAnswers[q.id] === opt}
                                  onChange={() => setUserAnswers({...userAnswers, [q.id]: opt})}
                                  className="hidden"
                                />
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${userAnswers[q.id] === opt ? 'border-amber-400 bg-amber-400' : 'border-slate-500'}`}>
                                  {userAnswers[q.id] === opt && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                </div>
                                <span className="text-xs font-semibold">{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        if (Object.keys(userAnswers).length < quizQuestions.length) {
                          toast.error(t.answerAllPrompt);
                          return;
                        }
                        setQuizSubmitted(true);
                        setActiveTab('transcript');
                        toast.success("¡Quiz completado!");
                      }}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all uppercase tracking-widest text-xs cursor-pointer"
                    >
                      {t.submitAnswers}
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* FLOATING FEEDBACK MODAL */}
            {showFeedback && (
              <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in-95 duration-500">
                <div className="bg-indigo-950/90 border border-indigo-500/40 p-6 rounded-3xl max-w-sm w-full shadow-[0_0_50px_rgba(99,102,241,0.4)] relative overflow-hidden">
                  <button 
                    onClick={() => setShowFeedback(false)}
                    className="absolute top-4 right-4 text-indigo-300 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                  
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-500/30 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-2">
                      <Star className="text-white" fill="white" size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white">¿Qué te ha parecido la clase?</h4>
                      <p className="text-xs text-indigo-300 font-medium mt-1">El profesor valorará tu opinión (Anónimo)</p>
                    </div>

                    <div className="flex items-center gap-2 py-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedbackRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating( star)}
                          className={`transition-all transform ${hoverRating >= star || feedbackRating >= star ? 'scale-110' : 'scale-100 hover:scale-110'}`}
                        >
                          <Star 
                            size={32} 
                            className={hoverRating >= star || feedbackRating >= star ? "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" : "text-slate-600"} 
                            fill={hoverRating >= star || feedbackRating >= star ? "currentColor" : "none"}
                          />
                        </button>
                      ))}
                    </div>

                    <div className="w-full relative group">
                      <div className="absolute inset-y-0 left-3 flex items-start pt-3 pointer-events-none">
                        <MessageSquare size={14} className="text-indigo-400 group-focus-within:text-pink-400 transition-colors" />
                      </div>
                      <textarea 
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        placeholder="Escribe un comentario o pregunta..."
                        className="w-full bg-black/40 border border-indigo-500/30 focus:border-pink-500/50 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-indigo-300/50 focus:outline-none focus:ring-1 focus:ring-pink-500/50 transition-all resize-none h-24 shadow-inner"
                      />
                    </div>

                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={isSubmittingFeedback || feedbackRating === 0}
                      className="w-full bg-white hover:bg-slate-200 text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-[10px] shadow-[0_0_15px_rgba(255,255,255,0.2)] disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingFeedback ? (
                        <Sparkles size={16} className="animate-spin text-black" />
                      ) : (
                        <>
                          <Send size={14} /> Enviar Valoración
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
          </div>

          {/* Spatial Controls & Timeline Nodes */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl flex flex-col gap-4 shadow-xl">
            {/* Timeline Nodes */}
            <div className="relative h-2 bg-white/10 rounded-full w-full cursor-pointer group" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              handleSeek(pos * duration);
            }}>
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full pointer-events-none shadow-[0_0_12px_rgba(236,72,153,0.8)]"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              />
              
              {/* Nodes for Chapters */}
              {chapters.map((ch, idx) => (
                <div 
                  key={idx}
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-pink-400 border-2 border-white rounded-full shadow-[0_0_10px_#ec4899] transition-all duration-300 hover:scale-150 hover:bg-white cursor-pointer"
                  style={{ left: `${(ch.seconds / (duration || 1)) * 100}%` }}
                  title={ch.title}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSeek(ch.seconds);
                  }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[9px] px-2 py-1 rounded border border-white/20 whitespace-nowrap pointer-events-none transition-opacity">
                    {ch.title}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePlayPause}
                  className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-600 text-white hover:scale-110 flex items-center justify-center transition-all shadow-[0_0_25px_rgba(139,92,246,0.65)] hover:shadow-[0_0_35px_rgba(139,92,246,0.85)] border border-violet-400/30 cursor-pointer"
                >
                  {isPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="ml-1 text-white" />}
                </button>
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-black text-white">{formatTime(currentTime)}</span>
                  <span className="text-[9px] font-mono font-bold text-slate-500">{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Valorar Clase button — visible whenever feedback is enabled, no sharedClassId required */}
                {allowFeedback && !hasSubmittedFeedback && (
                  <button 
                    onClick={() => setShowFeedback(true)}
                    className="px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/40 cursor-pointer"
                  >
                    <Star size={12} fill="currentColor" />
                    {lang === 'es' ? 'Valorar Clase' : 'Rate Class'}
                  </button>
                )}

                {(oracleExam || quizQuestions.length > 0) && (
                  <button 
                    onClick={() => setActiveTab(activeTab === 'quiz' ? 'transcript' : 'quiz')}
                    className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${
                      activeTab === 'quiz' ? 'bg-amber-500 text-black shadow-amber-500/20' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    <HelpCircle size={14} />
                    {oracleExam ? "Evaluación IA" : "Focus Quiz"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Holographic Teleprompter */}
        <div className="lg:col-span-4 h-[600px] lg:h-[700px] relative perspective-1000">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-pink-500/5 rounded-[32px] blur-[30px]" />
          
          <div className="bg-slate-900/60 backdrop-blur-3xl border border-indigo-500/30 rounded-[32px] h-full flex flex-col overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.6)] relative transform-gpu hover:rotate-y-1 hover:border-indigo-400/50 hover:shadow-[0_0_50px_rgba(99,102,241,0.15)] transition-all duration-700">
            
            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <Subtitles size={16} className="text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white tracking-widest uppercase">Holo-Prompt</h4>
                  <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest mt-0.5">Transcripción Inteligente</p>
                </div>
              </div>
            </div>

            <div 
              ref={transcriptContainerRef}
              className="flex-grow p-6 overflow-y-auto space-y-6 scrollbar-none scroll-smooth relative [mask-image:linear-gradient(to_bottom,transparent_0%,white_12%,white_88%,transparent_100%)]"
            >
              {parsedSrt.map((line) => {
                const isActive = activeCueId === line.id;
                return (
                  <div
                    key={line.id}
                    id={`srt-cue-${line.id}`}
                    onClick={() => handleSeek(line.start)}
                    className={`transition-all duration-500 cursor-pointer text-left pl-4 border-l-2 rounded-r-lg ${
                      isActive 
                        ? 'border-indigo-400 opacity-100 scale-[1.03] py-2 bg-indigo-500/8' 
                        : 'border-white/10 opacity-35 hover:opacity-65 scale-100'
                    }`}
                  >
                    {isActive && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-pink-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400"></span>
                        </span>
                        <span className="text-[8px] uppercase tracking-widest text-pink-300 font-black">
                          {lang === 'es' ? 'Hablando ahora' : 'Speaking now'}
                        </span>
                      </div>
                    )}
                    <p className={`font-medium leading-relaxed transition-all duration-300 ${
                      isActive 
                        ? 'text-[1.1rem] text-white font-bold drop-shadow-[0_0_12px_rgba(165,180,252,0.9)] [text-shadow:0_0_20px_rgba(139,92,246,0.6)]' 
                        : 'text-sm text-slate-400'
                    }`}>
                      {line.text}
                    </p>
                  </div>
                );
              })}
            </div>
            
            {/* Fade out gradients for holographic effect */}
            <div className="absolute top-[80px] left-0 w-full h-12 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/90 to-transparent pointer-events-none flex items-end justify-center pb-4">
               <span className="text-[8px] uppercase tracking-widest text-white/30 font-black">Powered by Docent AI</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
