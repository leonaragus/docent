import { useState } from 'react';
import { Sparkles, ArrowRight, BookOpen, Copy, Check } from 'lucide-react';
import { LessonPlanResult } from '../types';
import { toast } from 'sonner';

interface AIAssistantProps {
  onLoadScript: (script: string) => void;
  onLoadChapters: (chapters: string[]) => void;
  lang: string;
}

export default function AIAssistant({ onLoadScript, onLoadChapters, lang }: AIAssistantProps) {
  
  const generateLocalLessonPlan = (topic: string, gradeLevel: string, duration: string, isEn: boolean) => {
    const cleanTopic = topic.trim();
    
    const suggestedChapters = isEn 
      ? [
          `Introduction to ${cleanTopic}`,
          `Core Concepts and Case Studies`,
          `Practical Exercises & Q&A`
        ]
      : [
          `Introducción a ${cleanTopic}`,
          `Conceptos Fundamentales y Casos de Estudio`,
          `Práctica Dirigida y Cierre de la Sesión`
        ];

    const lessonPlan = isEn
      ? `# Lesson Plan: ${cleanTopic}
**Level:** ${gradeLevel} | **Duration:** ${duration}
**Pedagogical Framework:** Structured Active Learning

## 1. Learning Objectives
* Comprehend the fundamental mechanics and utility of **${cleanTopic}**.
* Apply best practices and solve interactive case studies under direct guidance.
* Validate core skills and clear general doubts during the closing session.

## 2. Recommended Syllabus & Timeline
* **00:00 - 05:00 | Introduction:** Concept presentation, scope definition, and real-world relevance.
* **05:00 - 15:00 | Core Theory:** Detailed breakdown of the elements of **${cleanTopic}**.
* **15:00 - 30:00 | Practice:** Guided workshop, common pitfalls, and live demonstrations.
* **30:00 - End | Wrap-up:** Focus quiz review and student feedback collection.

## 3. Classroom Activity
Have students list two real-world examples where **${cleanTopic}** is critical. Discuss their choices in small groups.`
      : `# Plan de Clase: ${cleanTopic}
**Nivel:** ${gradeLevel} | **Duración:** ${duration}
**Marco Pedagógico:** Aprendizaje Activo Estructurado

## 1. Objetivos de Aprendizaje
* Comprender la mecánica fundamental y utilidad práctica de **${cleanTopic}**.
* Aplicar buenas prácticas y resolver casos de estudio prácticos bajo guía directa.
* Validar habilidades clave y despejar dudas generales durante el cierre.

## 2. Cronograma y Syllabus Recomendado
* **00:00 - 05:00 | Introducción:** Presentación del concepto, alcance y relevancia práctica.
* **05:00 - 15:00 | Teoría Central:** Desglose detallado de los elementos clave de **${cleanTopic}**.
* **15:00 - 30:00 | Práctica Dirigida:** Taller interactivo guiado y resolución de errores comunes.
* **30:00 - Fin | Cierre:** Revisión de la evaluación rápida y recepción de feedback.

## 3. Dinámica Grupal Sugerida
Pide a los alumnos que propongan dos ejemplos reales donde **${cleanTopic}** sea crucial. Discute sus ideas en grupos pequeños.`;

    const teleprompterScript = isEn
      ? `[Smile] Hello everyone! Welcome to today's class on ${cleanTopic}.

Today, we are going to explore the core aspects of this subject, designed specifically for our ${gradeLevel} level. 

Let's begin by defining what ${cleanTopic} is and why it matters in our professional path. [Show slide or point to board]

As we go through the main concepts, remember that we have structured chapters for this session. Feel free to follow along the timeline at your own pace.

[Pause] Now, let's analyze a practical case study. Notice how the variables interact when we apply the main framework. This is the most crucial takeaway from today's lesson.

To wrap up, you will find a Focus Quiz on the right side of the interactive player. Please complete the quiz to validate your progress. See you in the next session!`
      : `[Sonreír] ¡Hola a todos! Bienvenidos a la clase de hoy sobre ${cleanTopic}.

En esta sesión, vamos a explorar los aspectos centrales de esta disciplina, adaptados especialmente para nuestro nivel de ${gradeLevel}.

Comencemos por definir qué es ${cleanTopic} y por qué es tan relevante en nuestro desarrollo formativo. [Mostrar diapositiva o señalar pizarrón]

A medida que avancemos por los conceptos clave, recuerden que tenemos estructurados los marcadores interactivos de la clase a un costado de la pantalla. Pueden usarlos para navegar la línea de tiempo.

[Pausa] Ahora, analicemos un caso práctico. Observen cómo interactúan las variables al aplicar la teoría principal. Este es el punto más importante de la lección de hoy.

Para finalizar, recuerden que tienen disponible el Focus Quiz interactivo en el panel derecho del reproductor. Por favor, respondan el cuestionario para validar su aprendizaje. ¡Nos vemos en la siguiente clase!`;

    return {
      lessonPlan,
      teleprompterScript,
      suggestedChapters
    };
  };

  const isEn = lang === 'en';

  const gradeLevels = isEn
    ? ['Primary', 'Secondary', 'High School / Baccalaureate', 'University', 'Any level']
    : ['Primaria', 'Secundaria', 'Preparatoria / Bachillerato', 'Universidad', 'Cualquiera'];

  const durations = isEn
    ? ['5 minutes', '15 minutes', '30 minutes', '45 minutes']
    : ['5 minutos', '15 minutos', '30 minutos', '45 minutos'];

  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState(gradeLevels[1]);
  const [duration, setDuration] = useState(durations[1]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LessonPlanResult | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'script'>('plan');
  const [copied, setCopied] = useState(false);

  const generateLessonPlan = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/ai/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, gradeLevel, duration, lang }),
      });
      const data = await response.json();
      if (data.error) {
        console.warn("Gemini API key error, falling back to local generator:", data.error);
        const fallback = generateLocalLessonPlan(topic, gradeLevel, duration, isEn);
        setResult(fallback);
        setActiveTab('plan');
        toast.info(isEn 
          ? "Lesson plan generated locally (Offline/Keyless Mode)." 
          : "Plan de clase generado localmente (Modo sin clave de API)."
        );
      } else {
        setResult(data);
        setActiveTab('plan');
      }
    } catch (e) {
      console.warn("Connection/Server error, falling back to local generator:", e);
      const fallback = generateLocalLessonPlan(topic, gradeLevel, duration, isEn);
      setResult(fallback);
      setActiveTab('plan');
      toast.info(isEn 
        ? "Lesson plan generated locally (Offline/Keyless Mode)." 
        : "Plan de clase generado localmente (Modo sin clave de API)."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col h-full">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400">
          <Sparkles size={18} />
        </div>
        <div>
          <h3 className="text-base font-bold tracking-tight">
            {isEn ? 'AI Class Assistant' : 'Asistente de Clase AI'}
          </h3>
          <p className="text-xs text-slate-400">
            {isEn ? 'Plan your class and generate a script in seconds' : 'Planifica tu clase y genera el guión en segundos'}
          </p>
        </div>
      </div>

      {/* Generator Inputs */}
      <div className="space-y-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60 mb-5">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
            {isEn ? 'Class Topic or Title' : 'Tema o Título de la Clase'}
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={isEn ? 'e.g. Introduction to Fractions, Newton\'s Laws, etc.' : 'Ej. Introducción a las Fracciones, Leyes de Newton, etc.'}
            className="w-full bg-slate-900 text-slate-200 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2 text-sm placeholder-slate-600 focus:outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
              {isEn ? 'Grade / Level' : 'Nivel / Curso'}
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full bg-slate-900 text-slate-200 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none transition-all"
            >
              {gradeLevels.map((gl) => (
                <option key={gl} value={gl}>{gl}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
              {isEn ? 'Estimated Duration' : 'Duración Estimada'}
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-slate-900 text-slate-200 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none transition-all"
            >
              {durations.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={generateLessonPlan}
          disabled={loading || !topic.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 font-semibold text-xs text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-600/10"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{isEn ? 'Generating lesson material...' : 'Generando material pedagógico...'}</span>
            </div>
          ) : (
            <>
              <Sparkles size={14} /> {isEn ? 'Generate Lesson Plan & Script' : 'Generar Plan de Clase & Guión'}
            </>
          )}
        </button>
      </div>

      {/* AI Output Result Panels */}
      {result && (
        <div className="flex-grow flex flex-col bg-slate-950/20 rounded-2xl border border-slate-800 overflow-hidden">
          {/* Tabs header */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
            <button
              onClick={() => setActiveTab('plan')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'plan' ? 'bg-indigo-600/15 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen size={12} /> {isEn ? 'Lesson Plan' : 'Plan de Clase'}
            </button>
            <button
              onClick={() => setActiveTab('script')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'script' ? 'bg-indigo-600/15 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles size={12} /> {isEn ? 'Teleprompter Script' : 'Guión para Apuntador'}
            </button>
          </div>

          <div className="p-4 flex-grow overflow-y-auto max-h-[300px]">
            {activeTab === 'plan' ? (
              <div className="space-y-3 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {result.lessonPlan}
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed italic">
                {result.teleprompterScript}
              </div>
            )}
          </div>

          {/* Load CTAs */}
          <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => onLoadScript(result.teleprompterScript)}
                className="flex-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-[11px] font-bold py-2 rounded-xl border border-indigo-500/20 transition-all flex items-center justify-center gap-1"
              >
                {isEn ? 'Load Script to Teleprompter' : 'Cargar Guión en Apuntador'} <ArrowRight size={12} />
              </button>
              <button
                onClick={() => onLoadChapters(result.suggestedChapters)}
                className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[11px] font-bold py-2 rounded-xl border border-emerald-500/20 transition-all flex items-center justify-center gap-1"
              >
                {isEn ? 'Load Chapters' : 'Cargar Capítulos'}
              </button>
            </div>
            <button
              onClick={() => copyToClipboard(activeTab === 'plan' ? result.lessonPlan : result.teleprompterScript)}
              className="w-full text-slate-400 hover:text-slate-200 text-[10px] py-1 flex items-center justify-center gap-1 transition-colors"
            >
              {copied ? (
                <>
                  <Check size={10} className="text-emerald-400" /> {isEn ? 'Copied!' : 'Copiado con éxito'}
                </>
              ) : (
                <>
                  <Copy size={10} /> {isEn ? 'Copy text of this tab' : 'Copiar texto de esta pestaña'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
