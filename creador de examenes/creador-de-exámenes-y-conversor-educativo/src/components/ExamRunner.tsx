import React, { useState, useEffect } from "react";
import { 
  Award, ShieldAlert, CheckCircle2, XCircle, Clock, Heart, 
  Flame, HelpCircle, FileText, ArrowRight, BookOpen, User, 
  Printer, ArrowLeft, RefreshCw, Eye, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Exam, Question, ExamDeliveryMode, ExamResult } from "../types";

interface ExamRunnerProps {
  exam: Exam;
  onBackToCreator: () => void;
}

export default function ExamRunner({ exam, onBackToCreator }: ExamRunnerProps) {
  // Setup Delivery Mode Selection
  const [deliveryMode, setDeliveryMode] = useState<ExamDeliveryMode | null>(null);
  
  // Game state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  
  // Column matching answers state
  const [matchingSelections, setMatchingSelections] = useState<{ [key: string]: { [leftKey: string]: string } }>({});
  const [activeLeftTerm, setActiveLeftTerm] = useState<string | null>(null);

  // Practice feedback tracking
  const [questionAnsweredInPractice, setQuestionAnsweredInPractice] = useState(false);
  const [practiceCorrect, setPracticeCorrect] = useState<boolean | null>(null);

  // Gamified modes state
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Timer states
  const [secondsRemaining, setSecondsRemaining] = useState(exam.timeLimit * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);

  // Open-ended grading feedback
  const [gradingOpenEnded, setGradingOpenEnded] = useState<boolean>(false);
  const [gradedFeedback, setGradedFeedback] = useState<{ [questionId: string]: { score: number; feedback: string } }>({});

  // Exam Result states
  const [result, setResult] = useState<ExamResult | null>(null);
  const [studentName, setStudentName] = useState("");

  // Shuffle right items of column matching questions so they are randomized
  const [shuffledMatchingRight, setShuffledMatchingRight] = useState<{ [questionId: string]: string[] }>({});

  useEffect(() => {
    // Generate shuffled right side terms for any matching questions
    const shuffled: { [questionId: string]: string[] } = {};
    exam.questions.forEach((q) => {
      if (q.type === 'matching' && q.matchingPairs) {
        shuffled[q.id] = [...q.matchingPairs]
          .map((p) => p.right)
          .sort(() => Math.random() - 0.5);
      }
    });
    setShuffledMatchingRight(shuffled);
  }, [exam]);

  // Handle countdown timer for Real Exam Mode
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (timerActive && secondsRemaining > 0) {
      timerId = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            clearInterval(timerId);
            handleSubmitExam(true); // Auto submit on expiration
            return 0;
          }
          return prev - 1;
        });
        setTimeTaken((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [timerActive, secondsRemaining]);

  const handleStartExam = (mode: ExamDeliveryMode) => {
    setDeliveryMode(mode);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setMatchingSelections({});
    setQuestionAnsweredInPractice(false);
    setPracticeCorrect(null);
    setResult(null);
    setGameOver(false);
    
    // Set parameters based on mode
    if (mode === 'real') {
      setSecondsRemaining(exam.timeLimit * 60);
      setTimerActive(true);
      setTimeTaken(0);
    } else if (mode === 'gamified') {
      setLives(3);
      setStreak(0);
      setMultiplier(1);
      setScore(0);
      setTimeTaken(0);
    } else {
      setTimeTaken(0); // Practice mode counts up
      setTimerActive(true);
    }
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    if (deliveryMode === 'practice' && questionAnsweredInPractice) return; // Block changes after check
    setAnswers({ ...answers, [questionId]: answer });
  };

  // COLUMN MATCHING HANDLERS
  const handleSelectMatchingLeft = (term: string) => {
    if (deliveryMode === 'practice' && questionAnsweredInPractice) return;
    setActiveLeftTerm(term);
  };

  const handleSelectMatchingRight = (questionId: string, rightVal: string) => {
    if (!activeLeftTerm) return;
    if (deliveryMode === 'practice' && questionAnsweredInPractice) return;

    const currentMap = matchingSelections[questionId] || {};
    
    // Check if right item already associated and remove it
    const newMap = { ...currentMap };
    Object.keys(newMap).forEach((leftKey) => {
      if (newMap[leftKey] === rightVal) {
        delete newMap[leftKey];
      }
    });

    newMap[activeLeftTerm] = rightVal;
    setMatchingSelections({
      ...matchingSelections,
      [questionId]: newMap
    });

    setActiveLeftTerm(null); // Clear active
  };

  const handleClearMatches = (questionId: string) => {
    if (deliveryMode === 'practice' && questionAnsweredInPractice) return;
    setMatchingSelections({
      ...matchingSelections,
      [questionId]: {}
    });
    setActiveLeftTerm(null);
  };

  // CHECK ANSWER (Modo Práctica & Modo Desafío gamificado)
  const handleCheckOrNext = async () => {
    const q = exam.questions[currentQuestionIndex];

    if (deliveryMode === 'practice' && !questionAnsweredInPractice) {
      // Evaluate answer in practice mode
      let isCorrect = false;
      const studentAns = answers[q.id] || "";

      if (q.type === 'matching') {
        const studentMap = matchingSelections[q.id] || {};
        // Match all correctly
        let correctCount = 0;
        q.matchingPairs?.forEach((pair) => {
          if (studentMap[pair.left] === pair.right) correctCount++;
        });
        isCorrect = correctCount === (q.matchingPairs?.length || 0);
      } else if (q.type === 'open_ended') {
        // Trigger AI Evaluation on the fly
        setGradingOpenEnded(true);
        try {
          const response = await fetch("/api/grade-open-ended", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              questionText: q.questionText,
              expectedPoints: q.correctAnswer,
              studentAnswer: studentAns,
              maxPoints: q.points
            })
          });
          const evalData = await response.json();
          setGradedFeedback({
            ...gradedFeedback,
            [q.id]: { score: evalData.score, feedback: evalData.feedback }
          });
          isCorrect = evalData.score >= (q.points * 0.6); // Consider correct if scored 60% or higher
        } catch (err) {
          console.error("No se pudo evaluar la pregunta abierta.", err);
        } finally {
          setGradingOpenEnded(false);
        }
      } else {
        isCorrect = studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      }

      setPracticeCorrect(isCorrect);
      setQuestionAnsweredInPractice(true);
      return;
    }

    // GAMIFIED MODE LOGIC
    if (deliveryMode === 'gamified') {
      let isCorrect = false;
      const studentAns = answers[q.id] || "";

      if (q.type === 'matching') {
        const studentMap = matchingSelections[q.id] || {};
        let correctCount = 0;
        q.matchingPairs?.forEach((pair) => {
          if (studentMap[pair.left] === pair.right) correctCount++;
        });
        isCorrect = correctCount === (q.matchingPairs?.length || 0);
      } else if (q.type === 'open_ended') {
        // Auto pass open-ended in gamified mode to keep it fast, but grade later
        isCorrect = studentAns.trim().length > 10;
      } else {
        isCorrect = studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      }

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        // Multiplier rules: every 3 correct adds +1 multiplier
        const newMult = Math.min(4, 1 + Math.floor(newStreak / 3));
        setMultiplier(newMult);
        setScore((prev) => prev + q.points * newMult);
      } else {
        setStreak(0);
        setMultiplier(1);
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          setGameOver(true);
          return;
        }
      }
    }

    // Go to next question or submit
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionAnsweredInPractice(false);
      setPracticeCorrect(null);
    } else {
      // Completed last question! Submit results.
      handleSubmitExam();
    }
  };

  // COMPILE FINAL RESULTS
  const handleSubmitExam = async (timeExpired = false) => {
    setTimerActive(false);

    let totalPoints = 0;
    let earnedPoints = 0;
    const finalAnswers: any = {};
    const openEndedQuestionsToGrade: { qId: string; studentAns: string; qText: string; expected: string; maxPts: number }[] = [];

    // Tally questions
    for (const q of exam.questions) {
      totalPoints += q.points;
      const studentAns = answers[q.id] || "";

      if (q.type === 'matching') {
        const studentMap = matchingSelections[q.id] || {};
        finalAnswers[q.id] = studentMap;
        let matchCount = 0;
        q.matchingPairs?.forEach((pair) => {
          if (studentMap[pair.left] === pair.right) matchCount++;
        });
        const ratio = matchCount / (q.matchingPairs?.length || 1);
        earnedPoints += Math.round(q.points * ratio);
      } else if (q.type === 'open_ended') {
        finalAnswers[q.id] = studentAns;
        // Collect for grading if we haven't graded it in practice mode
        if (!gradedFeedback[q.id] && studentAns.trim()) {
          openEndedQuestionsToGrade.push({
            qId: q.id,
            studentAns,
            qText: q.questionText,
            expected: q.correctAnswer,
            maxPts: q.points
          });
        } else if (gradedFeedback[q.id]) {
          earnedPoints += gradedFeedback[q.id].score;
        }
      } else {
        finalAnswers[q.id] = studentAns;
        if (studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
          earnedPoints += q.points;
        }
      }
    }

    // If there are open-ended questions in exam/real mode, perform grading requests
    if (openEndedQuestionsToGrade.length > 0) {
      setGradingOpenEnded(true);
      const tempFeedback = { ...gradedFeedback };
      let extraPoints = 0;

      for (const item of openEndedQuestionsToGrade) {
        try {
          const response = await fetch("/api/grade-open-ended", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              questionText: item.qText,
              expectedPoints: item.expected,
              studentAnswer: item.studentAns,
              maxPoints: item.maxPts
            })
          });
          const evalData = await response.json();
          tempFeedback[item.qId] = { score: evalData.score, feedback: evalData.feedback };
          extraPoints += evalData.score;
        } catch (err) {
          console.error(`Error calificando la pregunta ${item.qId}`, err);
          tempFeedback[item.qId] = { score: 0, feedback: "Error de conexión en el servidor de IA para calificar esta pregunta." };
        }
      }

      setGradedFeedback(tempFeedback);
      earnedPoints += extraPoints;
      setGradingOpenEnded(false);
    }

    // Calc stats
    const percentage = Math.round((earnedPoints / totalPoints) * 100) || 0;
    const passed = percentage >= 60; // 60% passing score

    const finalResult: ExamResult = {
      examId: exam.id,
      score: deliveryMode === 'gamified' ? score : earnedPoints,
      totalPoints,
      percentage,
      passed,
      timeTaken: timeTaken || (exam.timeLimit * 60 - secondsRemaining),
      answers: finalAnswers,
      gradedFeedback: gradedFeedback
    };

    setResult(finalResult);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  return (
    <div id="exam_runner_root" className="max-w-4xl mx-auto bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
      
      {/* 1. SELECCIONAR MODO DE EVALUACIÓN */}
      {!deliveryMode && !result && (
        <div id="delivery_mode_selection" className="text-center py-8">
          <button
            onClick={onBackToCreator}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 mb-6 mx-auto bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-100 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al Banco de Exámenes
          </button>

          <span className="text-[10px] font-mono font-bold uppercase bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
            Dificultad: {exam.difficulty}
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2 mb-1 tracking-tight">{exam.title}</h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto mb-8 font-sans leading-relaxed">
            {exam.description}
          </p>

          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Selecciona la Variante de Presentación del Examen:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {/* Mode: Practice */}
            <button
              onClick={() => handleStartExam('practice')}
              className="p-5 rounded-2xl border-2 border-slate-200 hover:border-sky-400 hover:bg-sky-50/20 text-left transition-all cursor-pointer group flex flex-col justify-between h-48"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Modo Práctica Didáctico</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sin prisa, con retroalimentación formativa y explicaciones conceptuales instantáneas hechas por IA.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-sky-600 flex items-center gap-1">
                Iniciar práctica <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>

            {/* Mode: Real Exam */}
            <button
              onClick={() => handleStartExam('real')}
              className="p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 text-left transition-all cursor-pointer group flex flex-col justify-between h-48"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Modo Examen Real</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Contra reloj ({exam.timeLimit} minutos), sin ayudas en tiempo real. Calificación final y certificado al completar.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                Iniciar examen <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>

            {/* Mode: Gamified */}
            <button
              onClick={() => handleStartExam('gamified')}
              className="p-5 rounded-2xl border-2 border-slate-200 hover:border-rose-400 hover:bg-rose-50/20 text-left transition-all cursor-pointer group flex flex-col justify-between h-48"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Heart className="w-5 h-5 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Modo Desafío (Vidas)</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tienes 3 vidas ❤️. Cada error descuenta un corazón. ¡Gana puntos extra con rachas de aciertos multiplicadoras!
                </p>
              </div>
              <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                Iniciar desafío <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER (No lives left in Gamified Mode) */}
      {gameOver && (
        <div id="game_over_screen" className="text-center py-12 max-w-md mx-auto">
          <div className="w-20 h-20 bg-rose-100 border border-rose-200 rounded-full flex items-center justify-center text-rose-600 mb-6 mx-auto">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Desafío Terminado!</h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Te has quedado sin corazones ❤️. No te preocupes, el fracaso es solo un peldaño del aprendizaje. Repasa las fichas de estudio o el resumen y vuelve a intentarlo.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => handleStartExam('gamified')}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>Reintentar Desafío</span>
            </button>
            <button
              onClick={() => setDeliveryMode(null)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm py-3 rounded-xl transition-all cursor-pointer"
            >
              Cambiar Modo
            </button>
          </div>
        </div>
      )}

      {/* 2. EXAM ACTIVE RUNNER VIEW */}
      {deliveryMode && !result && !gameOver && (
        <div id="active_exam_panel">
          {/* Active Runner Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeliveryMode(null)}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 transition-all"
                title="Salir del examen"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-[9px] font-mono uppercase bg-slate-100 px-2 py-0.5 rounded font-bold">
                  Pregunta {currentQuestionIndex + 1} de {exam.questions.length}
                </span>
                <h3 className="text-sm font-bold text-slate-800 truncate max-w-xs sm:max-w-md">{exam.title}</h3>
              </div>
            </div>

            {/* Runner Indicators depending on Mode */}
            <div>
              {deliveryMode === 'real' && (
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-800 px-3 py-1.5 rounded-xl font-mono text-xs font-bold">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>{formatTime(secondsRemaining)}</span>
                </div>
              )}

              {deliveryMode === 'practice' && (
                <div className="flex items-center gap-2 bg-sky-50 text-sky-800 px-3 py-1.5 rounded-xl text-xs font-semibold font-sans">
                  <BookOpen className="w-4 h-4 text-sky-500" />
                  <span>Modo Práctica Didáctica</span>
                </div>
              )}

              {deliveryMode === 'gamified' && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 bg-rose-50 text-rose-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
                    <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                    <span>{lives} {lives === 1 ? 'Vida' : 'Vidas'}</span>
                  </div>

                  {streak >= 3 && (
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-semibold animate-bounce">
                      <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>x{multiplier} Racha!</span>
                    </div>
                  )}

                  <div className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold">
                    Score: {score}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Question Core Panel */}
          {exam.questions.length > 0 && (() => {
            const q = exam.questions[currentQuestionIndex];
            const isAnswered = answers[q.id] !== undefined || (q.type === 'matching' && Object.keys(matchingSelections[q.id] || {}).length > 0);

            return (
              <div className="space-y-6">
                
                {/* SCENARIO / CASE STUDY QUESTION SPECIAL LAYOUT */}
                {q.type === 'scenario' && q.scenarioText && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-4">
                    <div className="md:col-span-5 bg-amber-50/50 border border-amber-100/80 p-5 rounded-2xl max-h-[300px] overflow-y-auto">
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Caso de Estudio / Situación
                      </h4>
                      <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans italic">
                        "{q.scenarioText}"
                      </p>
                    </div>

                    <div className="md:col-span-7 space-y-4">
                      <div className="text-sm font-bold text-slate-800 leading-relaxed">
                        {q.questionText}
                      </div>
                      
                      {/* Render multiple choice options for scenario if available */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 gap-2.5">
                          {q.options.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => handleSelectAnswer(q.id, opt)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex justify-between items-center ${
                                answers[q.id] === opt 
                                  ? "bg-indigo-50 border-indigo-400 font-semibold text-indigo-900 shadow-sm" 
                                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                              }`}
                            >
                              <span>{opt}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* OTHER STANDARD QUESTION TYPES LAYOUT */}
                {q.type !== 'scenario' && (
                  <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl">
                    <h4 className="text-base font-bold text-slate-800 leading-relaxed mb-4">
                      {q.questionText}
                    </h4>

                    {/* TYPE: MULTIPLE CHOICE */}
                    {q.type === 'multiple_choice' && q.options && (
                      <div className="grid grid-cols-1 gap-2.5">
                        {q.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer flex justify-between items-center ${
                              answers[q.id] === opt 
                                ? "bg-indigo-50 border-indigo-400 font-semibold text-indigo-900 shadow-sm" 
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            <span>{opt}</span>
                            {answers[q.id] === opt && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* TYPE: TRUE OR FALSE */}
                    {q.type === 'true_false' && (
                      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                        <button
                          onClick={() => handleSelectAnswer(q.id, "true")}
                          className={`p-4 rounded-xl border-2 font-bold text-sm transition-all cursor-pointer flex flex-col items-center gap-2 ${
                            answers[q.id] === "true"
                              ? "bg-emerald-50 border-emerald-400 text-emerald-800 shadow-sm"
                              : "bg-white border-slate-200 hover:bg-emerald-50/20 text-slate-600 hover:border-slate-350"
                          }`}
                        >
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                          <span>Verdadero</span>
                        </button>

                        <button
                          onClick={() => handleSelectAnswer(q.id, "false")}
                          className={`p-4 rounded-xl border-2 font-bold text-sm transition-all cursor-pointer flex flex-col items-center gap-2 ${
                            answers[q.id] === "false"
                              ? "bg-rose-50 border-rose-400 text-rose-800 shadow-sm"
                              : "bg-white border-slate-200 hover:bg-rose-50/20 text-slate-600 hover:border-slate-350"
                          }`}
                        >
                          <XCircle className="w-6 h-6 text-rose-600" />
                          <span>Falso</span>
                        </button>
                      </div>
                    )}

                    {/* TYPE: FILL THE BLANKS */}
                    {q.type === 'fill_blanks' && (
                      <div className="max-w-md">
                        <label htmlFor="fill_blank_input" className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                          Escribe la palabra o concepto exacto:
                        </label>
                        <input
                          id="fill_blank_input"
                          type="text"
                          placeholder="Tu respuesta..."
                          value={answers[q.id] || ""}
                          onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 text-slate-700 outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}

                    {/* TYPE: COLUMN MATCHING */}
                    {q.type === 'matching' && q.matchingPairs && (
                      <div className="space-y-4">
                        <div className="text-xs text-slate-400 font-mono mb-2">
                          Instrucción: Selecciona una opción de la izquierda y haz clic en su pareja en la derecha.
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Left Column Terms */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Concepto / Término</span>
                            {q.matchingPairs.map((pair) => {
                              const alreadyMatched = matchingSelections[q.id]?.[pair.left];
                              return (
                                <button
                                  key={pair.left}
                                  onClick={() => handleSelectMatchingLeft(pair.left)}
                                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                                    activeLeftTerm === pair.left
                                      ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                                      : alreadyMatched
                                      ? "bg-slate-100 border-slate-200 text-slate-500 italic"
                                      : "bg-white border-slate-250 text-slate-700 hover:bg-slate-50"
                                  }`}
                                >
                                  {pair.left} {alreadyMatched && `➔ [Pareja asignada]`}
                                </button>
                              );
                            })}
                          </div>

                          {/* Right Column Definitions */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Definición / Descripción</span>
                            {(shuffledMatchingRight[q.id] || []).map((rightItem) => {
                              // Check if right item is already selected for any left term
                              const activeMapping = matchingSelections[q.id] || {};
                              const matchedLeftKey = Object.keys(activeMapping).find(k => activeMapping[k] === rightItem);

                              return (
                                <button
                                  key={rightItem}
                                  disabled={!activeLeftTerm}
                                  onClick={() => handleSelectMatchingRight(q.id, rightItem)}
                                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                                    matchedLeftKey
                                      ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-medium"
                                      : activeLeftTerm
                                      ? "bg-white border-indigo-200 hover:bg-indigo-50/50 text-slate-600 cursor-pointer"
                                      : "bg-slate-100 border-slate-200 text-slate-400"
                                  }`}
                                >
                                  {rightItem} {matchedLeftKey && `(Pareja: "${matchedLeftKey}")`}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Reset matchmaking button */}
                        {Object.keys(matchingSelections[q.id] || {}).length > 0 && (
                          <button
                            onClick={() => handleClearMatches(q.id)}
                            className="text-[10px] font-mono text-indigo-600 hover:text-indigo-800 font-bold block mt-3"
                          >
                            重 Limpiar relaciones de columnas
                          </button>
                        )}
                      </div>
                    )}

                    {/* TYPE: OPEN ENDED (ESSAY QUESTION) */}
                    {q.type === 'open_ended' && (
                      <div className="space-y-3">
                        <label htmlFor="open_ended_essay" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                          Redacta tu explicación detallada (Se evaluará con Inteligencia Artificial):
                        </label>
                        <textarea
                          id="open_ended_essay"
                          rows={5}
                          placeholder="Escribe tus ideas con fundamentación crítica. Nuestro servicio de tutoría evaluará tus argumentos..."
                          value={answers[q.id] || ""}
                          onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                          className="w-full text-xs bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3.5 text-slate-700 outline-none"
                        />
                      </div>
                    )}

                  </div>
                )}

                {/* PRACTICE MODE FEEDBACK DISPLAY */}
                {deliveryMode === 'practice' && questionAnsweredInPractice && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-5 rounded-2xl border ${
                      practiceCorrect 
                        ? "bg-green-50 border-green-200 text-green-900" 
                        : "bg-rose-50 border-rose-200 text-rose-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2 font-bold text-sm">
                      {practiceCorrect ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span>¡Excelente! Respuesta Correcta</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-rose-600" />
                          <span>Respuesta Incorrecta</span>
                        </>
                      )}
                    </div>
                    
                    <div className="text-xs mb-3 font-semibold">
                      Respuesta Esperada: <span className="font-mono bg-white/60 px-1.5 py-0.5 rounded border border-black/5 font-bold text-[11px]">{q.correctAnswer}</span>
                    </div>

                    <div className="border-t border-black/5 pt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">Minitutorial Pedagógico</span>
                      <p className="text-xs leading-relaxed text-slate-700 font-sans">
                        {q.explanation}
                      </p>
                    </div>

                    {q.type === 'open_ended' && gradedFeedback[q.id] && (
                      <div className="bg-white/70 border border-black/5 p-3.5 rounded-xl mt-3 text-slate-800">
                        <h5 className="text-xs font-bold text-indigo-800 mb-1">Calificación de la IA: {gradedFeedback[q.id].score} / {q.points} ptos</h5>
                        <p className="text-[11px] italic leading-relaxed">{gradedFeedback[q.id].feedback}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Question submission footer */}
                <div className="flex justify-between items-center mt-6">
                  <div className="text-xs text-slate-400 font-medium font-sans">
                    Puntos de esta pregunta: <b>{q.points} ptos</b>
                  </div>

                  <button
                    disabled={!isAnswered || gradingOpenEnded}
                    onClick={handleCheckOrNext}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {gradingOpenEnded ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Tutor AI Calificando...</span>
                      </>
                    ) : deliveryMode === 'practice' && !questionAnsweredInPractice ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Comprobar Respuesta</span>
                      </>
                    ) : currentQuestionIndex === exam.questions.length - 1 ? (
                      <>
                        <Award className="w-4 h-4" />
                        <span>Finalizar Examen</span>
                      </>
                    ) : (
                      <>
                        <span>Siguiente Pregunta</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })()}
        </div>
      )}

      {/* 3. FINAL REPORT CARD AND CERTIFICATE */}
      {result && !gameOver && (
        <div id="exam_results_dashboard" className="space-y-8 animate-fade-in">
          
          {/* Main Stats Header */}
          <div className="text-center bg-slate-50 border border-slate-150 p-6 md:p-8 rounded-3xl">
            <span className={`text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full ${
              result.passed 
                ? "bg-green-100 border border-green-200 text-green-700" 
                : "bg-rose-100 border border-rose-200 text-rose-700"
            }`}>
              {result.passed ? "¡Aprobado!" : "Sigue Practicando"}
            </span>

            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-3 mb-1">
              Resultados de tu Evaluación
            </h2>
            <p className="text-xs text-slate-500 font-mono mb-6">Examen: {exam.title}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Puntaje</span>
                <span className="text-xl font-bold text-slate-800 font-mono">{result.score}</span>
                <span className="text-xs text-slate-400 block font-mono">de {result.totalPoints} ptos</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Porcentaje</span>
                <span className="text-xl font-bold text-slate-800 font-mono">{result.percentage}%</span>
                <span className="text-xs text-slate-400 block font-sans">Min: 60%</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tiempo</span>
                <span className="text-xl font-bold text-slate-800 font-mono">{formatTime(result.timeTaken)}</span>
                <span className="text-xs text-slate-400 block font-sans">Límite: {exam.timeLimit}m</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Rendimiento</span>
                <span className={`text-sm font-bold block mt-1.5 ${result.passed ? "text-emerald-600" : "text-rose-600"}`}>
                  {result.percentage >= 90 ? "Sobresaliente 🌟" :
                   result.percentage >= 75 ? "Notable 👍" :
                   result.percentage >= 60 ? "Suficiente ✔️" : "Insuficiente ❌"}
                </span>
              </div>
            </div>
          </div>

          {/* DYNAMIC GOLD achievement CERTIFICATE */}
          {result.passed && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="certificate-print-area bg-gradient-to-br from-amber-50 to-orange-50/50 border-8 border-double border-amber-300 p-8 rounded-3xl relative text-center max-w-2xl mx-auto shadow-sm"
            >
              {/* Gold star decorative icons */}
              <div className="absolute top-4 left-4 text-amber-400 flex gap-1">
                <Award className="w-5 h-5 fill-amber-300" />
              </div>
              <div className="absolute top-4 right-4 text-amber-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>

              <h3 className="font-serif text-amber-800 uppercase tracking-widest text-xs font-bold mb-4">
                Diplomado de Acreditación AI
              </h3>

              <p className="text-xs italic text-slate-600 mb-2 font-sans">Se otorga con orgullo el presente certificado a:</p>
              
              {/* Name custom input */}
              <div className="max-w-md mx-auto mb-5">
                <input
                  type="text"
                  placeholder="[Ingresa tu Nombre Completo]"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full text-center text-xl font-bold font-serif bg-transparent border-b-2 border-dashed border-amber-300 text-amber-900 outline-none placeholder:text-amber-700/40 py-1"
                />
              </div>

              <p className="text-xs text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed font-sans">
                Por haber demostrado un conocimiento integral, pensamiento analítico avanzado y haber aprobado con éxito el examen de evaluación interactiva de:
              </p>

              <h4 className="text-base font-extrabold text-slate-800 uppercase tracking-tight mb-2">
                {exam.title}
              </h4>

              <div className="flex justify-center gap-1.5 mb-8">
                <span className="text-[10px] font-mono font-bold bg-white/80 border border-amber-200 text-amber-800 px-3 py-1 rounded-full shadow-inner">
                  Nota Obtenida: {result.percentage}%
                </span>
                <span className="text-[10px] font-mono font-bold bg-white/80 border border-amber-200 text-amber-800 px-3 py-1 rounded-full shadow-inner">
                  Fecha: {new Date().toLocaleDateString('es-ES')}
                </span>
              </div>

              {/* Certificate footer signatures */}
              <div className="flex justify-between items-center max-w-md mx-auto border-t border-amber-200/60 pt-5">
                <div className="text-left shrink-0">
                  <div className="font-serif text-slate-800 text-[10px] font-bold">EduCraft Studio</div>
                  <div className="text-[8px] text-slate-400 uppercase font-mono">Sello del Emisor</div>
                </div>
                
                {/* Gold Medal Sticker */}
                <div className="w-12 h-12 bg-amber-400 rounded-full border-4 border-amber-200 shadow flex items-center justify-center font-bold text-white text-xs font-serif rotate-12">
                  100% OK
                </div>

                <div className="text-right shrink-0">
                  <div className="font-serif text-slate-800 text-[10px] font-bold">Evaluador Gemini API</div>
                  <div className="text-[8px] text-slate-400 uppercase font-mono">Firma Digital Registrada</div>
                </div>
              </div>

              {/* Printable Button */}
              <button
                onClick={handlePrintCertificate}
                className="no-print mt-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Certificado</span>
              </button>
            </motion.div>
          )}

          {/* Deep Question-by-Question Analysis */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
              Análisis Detallado de Preguntas
            </h3>

            <div className="space-y-3">
              {exam.questions.map((q, qIdx) => {
                const studentAns = result.answers[q.id];
                let isQuestionCorrect = false;

                if (q.type === 'matching') {
                  const sMap: any = studentAns || {};
                  let matchedAll = true;
                  q.matchingPairs?.forEach((pair) => {
                    if (sMap[pair.left] !== pair.right) matchedAll = false;
                  });
                  isQuestionCorrect = matchedAll;
                } else if (q.type === 'open_ended') {
                  const scoreObj = gradedFeedback[q.id];
                  isQuestionCorrect = scoreObj ? (scoreObj.score >= (q.points * 0.6)) : false;
                } else {
                  isQuestionCorrect = (typeof studentAns === 'string' ? studentAns.trim().toLowerCase() : "") === q.correctAnswer.trim().toLowerCase();
                }

                return (
                  <div key={q.id} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isQuestionCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1 text-xs">
                      <div className="font-bold text-slate-800">
                        Pregunta {qIdx + 1}: {q.questionText}
                      </div>

                      <div className="font-sans text-slate-600">
                        {q.type === 'matching' ? (
                          <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-150">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Tus emparejamientos:</span>
                            {q.matchingPairs?.map((pair, pIdx) => {
                              const sMap: any = studentAns || {};
                              const wasMatchedRight = sMap[pair.left] === pair.right;
                              return (
                                <div key={pIdx} className="flex justify-between items-center text-[11px]">
                                  <span>{pair.left} ➔ {sMap[pair.left] || "(Sin emparejar)"}</span>
                                  <span>{wasMatchedRight ? "🟢 Ok" : "🔴 Esperado: " + pair.right}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : q.type === 'open_ended' ? (
                          <div className="space-y-2">
                            <p className="italic bg-white p-2 rounded-xl border border-slate-150">
                              "Tu respuesta: {studentAns || "(Vacío)"}"
                            </p>
                            {gradedFeedback[q.id] && (
                              <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                                <span className="font-bold text-indigo-900 block mb-1">Evaluación de IA ({gradedFeedback[q.id].score} / {q.points} ptos)</span>
                                <p className="text-[11px] leading-relaxed text-slate-700">{gradedFeedback[q.id].feedback}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <div>
                              Tu respuesta: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-150 font-bold">{studentAns ? String(studentAns) : "(Ninguna)"}</span>
                            </div>
                            {!isQuestionCorrect && (
                              <div className="mt-1 text-slate-500">
                                Respuesta Correcta: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-150 font-bold">{q.correctAnswer}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 border-t border-slate-200/60 pt-2 font-sans">
                        <b>Explicación formativa:</b> {q.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom redirection */}
          <div className="flex gap-4 max-w-sm mx-auto pt-6 border-t border-slate-100">
            <button
              onClick={() => handleStartExam(deliveryMode)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Rendir de Nuevo</span>
            </button>
            <button
              onClick={() => {
                setDeliveryMode(null);
                setResult(null);
              }}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
            >
              Volver al Menú
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
