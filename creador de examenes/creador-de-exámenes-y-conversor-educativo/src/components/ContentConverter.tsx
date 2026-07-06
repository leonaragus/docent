import React, { useState } from "react";
import { 
  FileText, Sparkles, BookOpen, Layers, 
  User, Volume2, HelpCircle, Map, Copy, 
  Check, ArrowRight, RefreshCw, Eye, BookMarked,
  ArrowUpDown, Search, Play, Pause, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ConvertedContent, ConversionFormat } from "../types";

// Creative Educational Quotes for the loading screen
const LOADING_QUOTES = [
  "«La educación no es llenar un cubo, sino encender un fuego.» — W.B. Yeats",
  "«El aprendizaje nunca agota la mente.» — Leonardo da Vinci",
  "«Dime y lo olvido, enséñame y lo recuerdo, involúcrame y lo aprendo.» — Benjamin Franklin",
  "«La IA está estructurando las ideas para que florezca tu conocimiento...»",
  "«Sintetizando conceptos complejos en píldoras de aprendizaje ágil...»",
  "«Diseñando mnemónicos y analogías para mejorar la retención cognitiva...»"
];

// Sample Educational Inputs for the user to try instantly
const SAMPLE_INPUTS = [
  {
    title: "La Fotosíntesis y la Luz",
    text: "La fotosíntesis es el proceso metabólico por el cual las plantas, algas y algunas bacterias convierten materia inorgánica (dióxido de carbono y agua) en materia orgánica (hidratos de carbono) utilizando la energía lumínica de la luz solar. Este proceso es vital para la vida en la Tierra, ya que libera oxígeno como subproducto. La clorofila, un pigmento verde ubicado en los cloroplastos, absorbe principalmente la luz roja y azul, reflejando la verde. La fotosíntesis consta de dos fases principales: la fase luminosa (dependiente de la luz), que ocurre en los tilacoides y produce ATP y NADPH; y la fase oscura o ciclo de Calvin (independiente de la luz), que ocurre en el estroma de los cloroplastos y utiliza esos productos para fijar el CO2 y producir glucosa."
  },
  {
    title: "La Caída del Imperio Romano",
    text: "La caída del Imperio Romano de Occidente en el año 476 d.C. fue un proceso multicausal complejo. Tradicionalmente se asocia con las invasiones de pueblos germánicos (bárbaros) como los visigodos, vándalos y hunos, quienes presionaron las fronteras y saquearon ciudades clave. Sin embargo, factores internos desempeñaron un rol crítico: una severa crisis económica y fiscal inflacionaria, la inestabilidad política con constantes asesinatos de emperadores y usurpaciones, la división del imperio en Occidente y Oriente decretada por Teodosio, y la creciente debilidad del ejército, que dependía de mercenarios bárbaros no leales. Al final, el último emperador, Rómulo Augústulo, fue depuesto por el jefe bárbaro Odoacro, marcando el fin de la Edad Antigua y el inicio de la Edad Media."
  },
  {
    title: "Introducción a la Inteligencia Artificial",
    text: "La Inteligencia Artificial (IA) es un campo de la informática que busca crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana, como el razonamiento, el aprendizaje, la percepción y la toma de decisiones. Se divide en dos ramas principales: IA Débil o Estrecha, diseñada para tareas específicas (como traductores de texto, asistentes virtuales y filtros de spam); e IA Fuerte o General (AGI), una teoría de sistema con autoconciencia y capacidades cognitivas humanas que aún no existe. Actualmente, el éxito de la IA se debe al Machine Learning (Aprendizaje Automático), donde los algoritmos detectan patrones en cantidades masivas de datos para hacer predicciones, y al Deep Learning, que utiliza redes neuronales artificiales profundas inspiradas en la corteza cerebral."
  }
];

interface ContentConverterProps {
  onSaveContent: (content: ConvertedContent) => void;
  savedContents: ConvertedContent[];
  onTriggerExamGeneration: (sourceText: string, title: string) => void;
}

export default function ContentConverter({ 
  onSaveContent, 
  savedContents,
  onTriggerExamGeneration 
}: ContentConverterProps) {
  // Input form state
  const [sourceText, setSourceText] = useState("");
  const [format, setFormat] = useState<ConversionFormat>("summary");
  const [tone, setTone] = useState("friendly");
  const [level, setLevel] = useState("Universidad");
  const [customInstructions, setCustomInstructions] = useState("");
  
  // Loading & interactive states
  const [loading, setLoading] = useState(false);
  const [loadingQuoteIndex, setLoadingQuoteIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Selection/active content display
  const [activeContent, setActiveContent] = useState<ConvertedContent | null>(null);
  
  // Flashcard review deck states
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<{ [key: number]: 'easy' | 'hard' | 'none' }>({});

  // Audio/TTS state for podcast script reader
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState<SpeechSynthesis | null>(
    typeof window !== "undefined" ? window.speechSynthesis : null
  );

  // Interval for changing quote on loading screen
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingQuoteIndex((prev) => (prev + 1) % LOADING_QUOTES.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleApplySample = (text: string) => {
    setSourceText(text);
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceText.trim()) return;

    setLoading(true);
    setError(null);
    setLoadingQuoteIndex(Math.floor(Math.random() * LOADING_QUOTES.length));

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceText,
          format,
          tone,
          level,
          customInstructions
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error inesperado al procesar el contenido.");
      }

      // Map API response to our ConvertedContent structure
      const newContent: ConvertedContent = {
        id: 'c_' + Date.now(),
        title: data.title || `Recurso Educativo (${format})`,
        sourceText,
        format,
        summaryData: format === 'summary' ? {
          mainTakeaway: data.mainTakeaway || "",
          sections: data.sections || []
        } : undefined,
        flashcards: format === 'flashcards' ? (data.flashcards || []) : undefined,
        studyGuide: format === 'study_guide' ? (data.studyGuide || []) : undefined,
        podcastScript: format === 'podcast_script' ? (data.podcastScript || null) : undefined,
        glossary: format === 'glossary' ? (data.glossary || []) : undefined,
        conceptMap: format === 'concept_map' ? (data.conceptMap || null) : undefined,
        createdAt: new Date().toLocaleDateString('es-ES', { 
          hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' 
        })
      };

      onSaveContent(newContent);
      setActiveContent(newContent);
      
      // Reset interactive sub-states
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setReviewedCards({});
      
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor de inteligencia artificial.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const speakText = (text: string) => {
    if (!speechSynthesisActive) return;
    
    if (speakingText === text) {
      speechSynthesisActive.cancel();
      setSpeakingText(null);
      return;
    }

    speechSynthesisActive.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingText(null);
    setSpeakingText(text);
    speechSynthesisActive.speak(utterance);
  };

  return (
    <div id="converter_container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: Input Control Panel */}
      <div id="converter_input_panel" className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Conversor Educativo</h2>
            <p className="text-xs text-slate-500">Transforma textos áridos en recursos listos para estudiar</p>
          </div>
        </div>

        {/* Templates instantáneos */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Inyección rápida de textos de ejemplo:
          </label>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_INPUTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplySample(sample.text)}
                className="text-xs font-medium bg-slate-50 hover:bg-sky-50 hover:text-sky-600 text-slate-600 px-3 py-1.5 rounded-full border border-slate-100 transition-all cursor-pointer"
              >
                ⚡ {sample.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleConvert} className="space-y-5">
          {/* Text Area Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="source_text" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Texto base u Apuntes de clase
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {sourceText.length} caract.
              </span>
            </div>
            <textarea
              id="source_text"
              rows={7}
              placeholder="Pega aquí cualquier material de lectura, notas de voz transcritas, capítulos de libros, PDF copiado o temática general..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-2xl p-4 text-slate-700 outline-none transition-all placeholder:text-slate-400 leading-relaxed font-sans"
              required
            />
          </div>

          {/* Formats variants Grid */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
              1. Variante de Formato Educativo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat("summary")}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  format === "summary" 
                    ? "bg-sky-50 border-sky-300 text-sky-700 shadow-sm" 
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Resumen Pro</div>
                  <div className="text-[9px] text-slate-400 truncate">Estructurado y conciso</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("flashcards")}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  format === "flashcards" 
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm" 
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Flashcards 3D</div>
                  <div className="text-[9px] text-slate-400 truncate font-sans">Active recall interactivo</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("study_guide")}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  format === "study_guide" 
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm" 
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Guía de Estudio</div>
                  <div className="text-[9px] text-slate-400 truncate">Niveles & Mnemónicos</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("podcast_script")}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  format === "podcast_script" 
                    ? "bg-amber-50 border-amber-300 text-amber-700 shadow-sm" 
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Volume2 className="w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Guión de Audio</div>
                  <div className="text-[9px] text-slate-400 truncate">Voz / Podcast dinámico</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("glossary")}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  format === "glossary" 
                    ? "bg-rose-50 border-rose-300 text-rose-700 shadow-sm" 
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <HelpCircle className="w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Glosario Técnico</div>
                  <div className="text-[9px] text-slate-400 truncate">Definición y ejemplo</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("concept_map")}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  format === "concept_map" 
                    ? "bg-violet-50 border-violet-300 text-violet-700 shadow-sm" 
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Map className="w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Mapa Conceptual</div>
                  <div className="text-[9px] text-slate-400 truncate">Diagrama de flujo visual</div>
                </div>
              </button>
            </div>
          </div>

          {/* Tone & Audience Level parameters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tone_selector" className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                Tono Narrativo
              </label>
              <select
                id="tone_selector"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-sky-500"
              >
                <option value="friendly">Cercano y Amigable</option>
                <option value="academic">Académico y Riguroso</option>
                <option value="storyteller">Narrativo (Historias)</option>
                <option value="technical">Altamente Técnico</option>
              </select>
            </div>

            <div>
              <label htmlFor="level_selector" className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                Nivel de Audiencia
              </label>
              <select
                id="level_selector"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-sky-500"
              >
                <option value="Primaria">Primaria (Niños)</option>
                <option value="Secundaria">Secundaria</option>
                <option value="Bachillerato">Preparatoria / Bachillerato</option>
                <option value="Universidad">Universidad</option>
                <option value="Profesional">Profesional Avanzado</option>
              </select>
            </div>
          </div>

          {/* Custom prompt tweaks */}
          <div>
            <label htmlFor="custom_inst" className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              Instrucciones Extras AI (Opcional)
            </label>
            <input
              id="custom_inst"
              type="text"
              placeholder="Ej: Usar analogías culinarias, destacar fechas, en rima..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl p-3 text-slate-700 outline-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-xl border border-red-150 flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !sourceText.trim()}
            className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Generando con Inteligencia de punta...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Convertir Contenido</span>
              </>
            )}
          </button>
        </form>

        {/* Saved resources sidebar lists */}
        {savedContents.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Recursos Convertidos en esta sesión ({savedContents.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {savedContents.map((content) => (
                <button
                  key={content.id}
                  onClick={() => {
                    setActiveContent(content);
                    // Reset flashcards
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                    activeContent?.id === content.id 
                      ? "bg-slate-100 font-semibold text-slate-900 border border-slate-200" 
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="capitalize font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 mr-2">
                      {content.format}
                    </span>
                    {content.title}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{content.createdAt}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Output display area */}
      <div id="converter_output_display" className="lg:col-span-7 bg-slate-50 border border-slate-200/60 rounded-3xl p-6 min-h-[580px] flex flex-col justify-between">
        
        {/* Loading Screen */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin"></div>
              <Sparkles className="w-6 h-6 text-sky-500 absolute top-5 left-5 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Reescribiendo con Inteligencia Artificial</h3>
            <div className="max-w-md bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <p className="text-sm italic text-slate-600 animate-fade-in">
                {LOADING_QUOTES[loadingQuoteIndex]}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !activeContent && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-3xl flex items-center justify-center text-slate-400 mb-4 shadow-inner">
              <FileText className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Visualizador de Resultados</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-6">
              Elige un ejemplo rápido a la izquierda o escribe tus apuntes, y mira la magia aquí con variantes visuales ricas.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md w-full">
              <div className="p-4 bg-white rounded-2xl border border-slate-100 text-left">
                <h4 className="text-xs font-bold text-slate-700 mb-1">Active Recall</h4>
                <p className="text-[11px] text-slate-400">Genera fichas memorizables interactivas en 3D en segundos.</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-100 text-left">
                <h4 className="text-xs font-bold text-slate-700 mb-1">Conexión Visual</h4>
                <p className="text-[11px] text-slate-400">Extrae las jerarquías en mapas visuales interactivos de conceptos.</p>
              </div>
            </div>
          </div>
        )}

        {/* Active Converted Content Renderers */}
        {!loading && activeContent && (
          <div className="flex-1 flex flex-col justify-between">
            {/* Header toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
              <div>
                <span className="text-[9px] font-mono uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                  {activeContent.format === 'summary' ? 'Resumen' :
                   activeContent.format === 'flashcards' ? 'Fichas 3D' :
                   activeContent.format === 'study_guide' ? 'Guía de Estudio' :
                   activeContent.format === 'podcast_script' ? 'Guión Podcast' :
                   activeContent.format === 'glossary' ? 'Glosario' : 'Mapa Conceptual'}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-1">{activeContent.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(JSON.stringify(activeContent, null, 2), activeContent.id)}
                  className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                  title="Copiar JSON del Recurso"
                >
                  {copiedId === activeContent.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Content Display Body */}
            <div className="flex-1 overflow-y-auto max-h-[460px] pr-1 mb-6">
              
              {/* FORMAT: SUMMARY */}
              {activeContent.format === 'summary' && activeContent.summaryData && (
                <div className="space-y-5">
                  <div className="bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-100 p-5 rounded-2xl">
                    <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Idea Clave / Conclusión Principal
                    </h4>
                    <p className="text-sm text-slate-700 font-medium italic leading-relaxed">
                      "{activeContent.summaryData.mainTakeaway}"
                    </p>
                  </div>

                  <div className="space-y-4">
                    {activeContent.summaryData.sections.map((section, sIdx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: sIdx * 0.1 }}
                        key={sIdx} 
                        className="bg-white border border-slate-150 p-5 rounded-2xl shadow-sm"
                      >
                        <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                          <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 font-mono">
                            {sIdx + 1}
                          </span>
                          {section.heading}
                        </h4>
                        <ul className="space-y-2.5">
                          {section.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                              <span className="text-sky-500 text-sm leading-none mt-0.5">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* FORMAT: FLASHCARDS (3D Interactive Review) */}
              {activeContent.format === 'flashcards' && activeContent.flashcards && (
                <div className="flex flex-col items-center">
                  {/* Progress tracker */}
                  <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-4 px-2">
                    <span>Mazo: <b>{currentCardIndex + 1}</b> de <b>{activeContent.flashcards.length}</b> fichas</span>
                    <span>
                      Revisadas: <b>{Object.keys(reviewedCards).length}</b>
                    </span>
                  </div>

                  {activeContent.flashcards.length > 0 ? (
                    <div className="w-full max-w-sm">
                      {/* Interactive 3D Card */}
                      <div 
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="h-64 cursor-pointer relative group perspective-1000 w-full mb-6"
                      >
                        <motion.div
                          animate={{ rotateY: isFlipped ? 180 : 0 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          style={{ transformStyle: "preserve-3d" }}
                          className="w-full h-full relative duration-500 rounded-3xl"
                        >
                          {/* Front of card */}
                          <div 
                            style={{ backfaceVisibility: "hidden" }}
                            className="absolute inset-0 bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-between shadow-sm group-hover:border-slate-300 transition-colors"
                          >
                            <span className="text-[10px] font-mono tracking-widest text-emerald-600 font-bold uppercase">PREGUNTA / CONCEPTO</span>
                            <div className="flex-1 flex items-center justify-center text-center px-4">
                              <p className="text-base font-bold text-slate-800 leading-relaxed">
                                {activeContent.flashcards[currentCardIndex]?.front}
                              </p>
                            </div>
                            <span className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" /> Haz clic para revelar el reverso
                            </span>
                          </div>

                          {/* Back of card */}
                          <div 
                            style={{ 
                              backfaceVisibility: "hidden",
                              transform: "rotateY(180deg)"
                            }}
                            className="absolute inset-0 bg-emerald-50/80 border border-emerald-200 p-6 rounded-3xl flex flex-col justify-between shadow-sm"
                          >
                            <span className="text-[10px] font-mono tracking-widest text-emerald-800 font-bold uppercase">EXPLICACIÓN / RESPUESTA</span>
                            <div className="flex-1 flex items-center justify-center text-center overflow-y-auto px-4 my-2">
                              <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                                {activeContent.flashcards[currentCardIndex]?.back}
                              </p>
                            </div>
                            <span className="text-[11px] text-emerald-600 text-center flex items-center justify-center gap-1.5 font-medium">
                              Haz clic para volver a la pregunta
                            </span>
                          </div>
                        </motion.div>
                      </div>

                      {/* Card Actions (Easy/Hard/Skip) */}
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReviewedCards({ ...reviewedCards, [currentCardIndex]: 'hard' });
                            setIsFlipped(false);
                            if (currentCardIndex < (activeContent.flashcards?.length || 0) - 1) {
                              setCurrentCardIndex(currentCardIndex + 1);
                            }
                          }}
                          className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                            reviewedCards[currentCardIndex] === 'hard'
                              ? "bg-rose-100 border-rose-300 text-rose-700"
                              : "bg-white border-slate-200 hover:bg-rose-50 text-rose-600 hover:border-rose-200"
                          }`}
                        >
                          🔴 Repasar de Nuevo
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReviewedCards({ ...reviewedCards, [currentCardIndex]: 'easy' });
                            setIsFlipped(false);
                            if (currentCardIndex < (activeContent.flashcards?.length || 0) - 1) {
                              setCurrentCardIndex(currentCardIndex + 1);
                            }
                          }}
                          className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                            reviewedCards[currentCardIndex] === 'easy'
                              ? "bg-green-100 border-green-300 text-green-700"
                              : "bg-white border-slate-200 hover:bg-green-50 text-green-600 hover:border-green-200"
                          }`}
                        >
                          🟢 Ya me lo sé
                        </button>
                      </div>

                      {/* Manual Next / Prev */}
                      <div className="flex justify-between mt-6 max-w-xs mx-auto">
                        <button
                          disabled={currentCardIndex === 0}
                          onClick={() => {
                            setCurrentCardIndex((p) => p - 1);
                            setIsFlipped(false);
                          }}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                        >
                          ← Anterior
                        </button>
                        <span className="text-xs font-mono text-slate-400 font-bold">
                          {currentCardIndex + 1} / {activeContent.flashcards.length}
                        </span>
                        <button
                          disabled={currentCardIndex === activeContent.flashcards.length - 1}
                          onClick={() => {
                            setCurrentCardIndex((p) => p + 1);
                            setIsFlipped(false);
                          }}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                        >
                          Siguiente →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs">No hay fichas en este mazo.</div>
                  )}
                </div>
              )}

              {/* FORMAT: STUDY GUIDE (Multi-level accordion guide) */}
              {activeContent.format === 'study_guide' && activeContent.studyGuide && (
                <div className="space-y-6">
                  {activeContent.studyGuide.map((diffGroup, idx) => (
                    <div key={idx} className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                      <div className={`p-4 font-bold text-xs flex items-center justify-between ${
                        diffGroup.difficulty === 'Fácil' ? "bg-emerald-50 text-emerald-800" :
                        diffGroup.difficulty === 'Medio' ? "bg-amber-50 text-amber-800" :
                        "bg-rose-50 text-rose-800"
                      }`}>
                        <div className="flex items-center gap-2">
                          <BookMarked className="w-4 h-4" />
                          <span>Módulo de Estudio • Nivel: {diffGroup.difficulty}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider bg-white/60 px-2 py-0.5 rounded-full font-mono font-bold">
                          {diffGroup.difficulty === 'Fácil' ? 'Concepto General' : 
                           diffGroup.difficulty === 'Medio' ? 'Análisis Medio' : 'Inmersión Crítica'}
                        </span>
                      </div>
                      
                      <div className="p-5 divide-y divide-slate-100">
                        {diffGroup.sections.map((sec, sIdx) => (
                          <div key={sIdx} className="py-4 first:pt-0 last:pb-0">
                            <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                              <span className="w-1.5 h-3 bg-indigo-500 rounded-sm"></span>
                              {sec.topic}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-sans">
                              {sec.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* FORMAT: PODCAST / AUDIO SCRIPT READER */}
              {activeContent.format === 'podcast_script' && activeContent.podcastScript && (
                <div className="space-y-4">
                  {/* Scene context banner */}
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Ambientación / Escena</h4>
                      <p className="text-xs italic text-amber-800 leading-relaxed">
                        {activeContent.podcastScript.scene}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Dialogue scripts */}
                  <div className="space-y-3.5 mt-2">
                    {activeContent.podcastScript.dialogue.map((dial, idx) => {
                      const isEven = idx % 2 === 0;
                      return (
                        <motion.div 
                          initial={{ opacity: 0, x: isEven ? -10 : 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={idx} 
                          className={`p-4 rounded-2xl max-w-[85%] border relative ${
                            isEven 
                              ? "bg-white border-slate-150 mr-auto rounded-tl-none" 
                              : "bg-sky-50/50 border-sky-100 ml-auto rounded-tr-none text-right"
                          }`}
                        >
                          <div className={`flex items-center gap-2 mb-1.5 ${isEven ? "justify-start" : "justify-end"}`}>
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                              🗣️ {dial.speaker}
                            </span>
                            {speechSynthesisActive && (
                              <button
                                onClick={() => speakText(dial.text)}
                                className={`p-1 rounded-md transition-all cursor-pointer ${
                                  speakingText === dial.text 
                                    ? "bg-sky-600 text-white" 
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-500"
                                }`}
                                title="Escuchar este diálogo"
                              >
                                {speakingText === dial.text ? (
                                  <Pause className="w-3 h-3" />
                                ) : (
                                  <Play className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed">
                            {dial.text}
                          </p>

                          {dial.soundEffect && (
                            <span className="inline-block mt-2 text-[10px] font-mono italic text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                              {dial.soundEffect}
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FORMAT: GLOSSARY */}
              {activeContent.format === 'glossary' && activeContent.glossary && (
                <div className="space-y-4">
                  {/* Simple Search bar */}
                  <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center gap-2 mb-4">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Filtrar términos clave..." 
                      className="text-xs bg-transparent outline-none w-full"
                      id="glossary_search"
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase();
                        const cards = document.querySelectorAll(".glossary-term-card");
                        cards.forEach((card: any) => {
                          const term = card.getAttribute("data-term").toLowerCase();
                          if (term.includes(val)) {
                            card.style.display = "block";
                          } else {
                            card.style.display = "none";
                          }
                        });
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeContent.glossary.map((item, idx) => (
                      <div 
                        key={idx} 
                        data-term={item.term}
                        className="glossary-term-card bg-white border border-slate-150 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all"
                      >
                        <h4 className="text-xs font-bold text-rose-700 font-mono tracking-wider mb-1 uppercase">
                          {item.term}
                        </h4>
                        <p className="text-xs text-slate-700 font-medium mb-2.5 leading-relaxed">
                          {item.definition}
                        </p>
                        <div className="bg-slate-50 border-l-2 border-slate-300 p-2 rounded-r-lg">
                          <span className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">💡 Ejemplo Contextualizado</span>
                          <p className="text-[11px] italic text-slate-600 leading-relaxed">
                            "{item.example}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FORMAT: CONCEPT MAP (Animated Concept Node Graph) */}
              {activeContent.format === 'concept_map' && activeContent.conceptMap && (
                <div className="space-y-6">
                  {/* Interactive node map presentation */}
                  <div className="bg-white border border-slate-250 rounded-2xl p-4 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Red de Conceptos Relacionados</h4>
                    
                    {/* Visual graph block layout */}
                    <div className="flex flex-col items-center gap-4 bg-slate-50 rounded-xl p-5 border border-dashed border-slate-200">
                      <div className="flex flex-wrap justify-center gap-4 max-w-xl">
                        {activeContent.conceptMap.nodes.map((node, nIdx) => (
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            key={node.id} 
                            className="bg-white border-2 border-indigo-200 rounded-2xl p-3 shadow-sm text-center max-w-[160px] flex flex-col items-center"
                          >
                            <span className="w-6 h-6 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center text-[10px] font-bold font-mono mb-1">
                              {node.id}
                            </span>
                            <h5 className="text-xs font-bold text-slate-800 mb-1">{node.label}</h5>
                            <p className="text-[10px] text-slate-500 leading-tight">
                              {node.description}
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Direction indicator */}
                      <div className="text-slate-400 text-xs flex items-center gap-1 font-mono">
                        <ArrowUpDown className="w-3.5 h-3.5" /> Las conexiones fluyen desde la premisa inicial
                      </div>
                    </div>
                  </div>

                  {/* Mermaid Raw Code Section */}
                  <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto relative">
                    <div className="flex justify-between items-center text-slate-500 border-b border-slate-800 pb-2 mb-2">
                      <span>Código para Mermaid.js</span>
                      <button
                        onClick={() => handleCopyText(activeContent.conceptMap?.mermaidCode || "", activeContent.id + "_mermaid")}
                        className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedId === activeContent.id + "_mermaid" ? (
                          <>
                            <Check className="w-3 h-3 text-green-500" />
                            <span className="text-green-500">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar Código</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-[11px] leading-relaxed text-emerald-400">
                      {activeContent.conceptMap.mermaidCode}
                    </pre>
                  </div>
                </div>
              )}

            </div>

            {/* SEAMLESS BRIDGE FOOTER: Create exam based on this conversion */}
            <div className="bg-indigo-50 border border-indigo-200/60 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Sparkles className="w-5 h-5 text-indigo-600 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">¿Listo para poner a prueba los conocimientos?</h4>
                  <p className="text-xs text-slate-500">Convierte este recurso transformado directamente en un examen personalizado.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (activeContent) {
                    onTriggerExamGeneration(activeContent.sourceText, activeContent.title);
                  }
                }}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>Generar Examen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
