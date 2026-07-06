import { useState, useEffect, FormEvent } from "react";
import { CourseDataInput, AdsGeneratorResult, CourseTemplate } from "./types";
import { QUICK_TEMPLATES } from "./components/QuickTemplates";
import FacebookPostPreview from "./components/FacebookPostPreview";
import AdConfigDisplay from "./components/AdConfigDisplay";
import FlyerDesigner from "./components/FlyerDesigner";
import { 
  Sparkles, 
  Award, 
  Clock, 
  User, 
  Tag, 
  HelpCircle, 
  Loader2, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Facebook, 
  Target, 
  Lightbulb, 
  Copy, 
  Check, 
  Play, 
  Trash2,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Form State
  const [formData, setFormData] = useState<CourseDataInput>({
    title: "",
    description: "",
    duration: "",
    certification: "",
    audience: "",
    pricing: "",
    format: "Online Grabado",
    extras: ""
  });

  // App States
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AdsGeneratorResult | null>(null);
  const [activeTab, setActiveTab] = useState<"copies" | "adsConfig" | "flyerDesigner">("copies");
  const [selectedCopyIndex, setSelectedCopyIndex] = useState(0);

  // Custom visual sound / notification states
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeInstructionAlert, setActiveInstructionAlert] = useState(true);

  // Dynamic status messages during loading
  const loadingMessages = [
    "Analizando el temario y el público de tu curso...",
    "Generando copys persuasivos con ángulos de alta conversión...",
    "Estructurando fórmulas psicológicas de ventas (AIDA, PAS)...",
    "Analizando el inventario de intereses meta en tiempo real...",
    "Perfilando demografía geográfica, edad y género óptimos...",
    "Compilando exclusiones avanzadas para proteger tu presupuesto...",
    "Armando el manual de optimización estratégico para Facebook Ads..."
  ];

  // Rotate loading message during loading progress
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Load template helper
  const handleSelectTemplate = (template: CourseTemplate) => {
    setFormData({
      title: template.title,
      description: template.description,
      duration: template.duration,
      certification: template.certification,
      audience: template.audience,
      pricing: template.pricing,
      format: template.format,
      extras: template.extras
    });
    setError(null);
    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(330, audioCtx.currentTime); // Mi
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.08);
      } catch (e) {
        // Audio might fail due to user interaction policies
      }
    }
  };

  // Reset form
  const handleClearForm = () => {
    setFormData({
      title: "",
      description: "",
      duration: "",
      certification: "",
      audience: "",
      pricing: "",
      format: "Online Grabado",
      extras: ""
    });
    setError(null);
  };

  // Trigger campaign generation flow
  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Por favor ingresa al menos el título o nombre del curso.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    setLoadingStep(0);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error inesperado al procesar la campaña.");
      }

      setResults(data);
      setSelectedCopyIndex(0);
      setActiveTab("copies");
      
      // Play a happy success feedback sound if enabled
      if (soundEnabled) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc1 = audioCtx.createOscillator();
          const osc2 = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
          osc1.connect(gainNode);
          osc2.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          osc1.type = "triangle";
          osc1.frequency.setValueAtTime(261.63, audioCtx.currentTime); // Do
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(523.25, audioCtx.currentTime); // Do alto
          
          gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
          osc1.start();
          osc2.start();
          
          osc1.frequency.setValueAtTime(329.63, audioCtx.currentTime + 0.1); // Mi
          osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
          
          osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime + 0.2); // Do alto
          osc2.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.2);
          
          osc1.stop(audioCtx.currentTime + 0.35);
          osc2.stop(audioCtx.currentTime + 0.35);
        } catch (e) {
          // Ignore audio policy blocks
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "No se pudo conectar con el servidor de inteligencia artificial.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans flex flex-col justify-between selection:bg-indigo-100 selection:text-slate-900">
      
      {/* Upper Brand Bar */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 sticky top-0 z-40 shrink-0">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeLineWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-800 font-display">AdFlow AI</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono tracking-wider">PREVISUALIZADOR META</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
            {/* Quick volume switch */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 px-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-xs flex items-center gap-1"
              title={soundEnabled ? "Silenciar efectos" : "Activar efectos"}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span className="hidden xs:inline text-[10px] uppercase font-bold tracking-wider">Efectos</span>
            </button>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="API lista"></span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto p-4 md:p-6 flex-1 flex flex-col gap-6">
        
        {/* Short Spanish Greeting Alert */}
        {activeInstructionAlert && (
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full filter blur-xl opacity-40"></div>
            <div className="z-10">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5 font-display">
                <Sparkles size={16} className="text-indigo-600 fill-indigo-100" />
                <span>Planificador de Campaña y Copys para Facebook</span>
              </h2>
              <p className="text-xs text-slate-500 max-w-3xl mt-1 leading-relaxed">
                Coloca la información clave de tu programa para generar tres variaciones de copies orientados a conversión. Además obtendrás recomendaciones tácticas y la segmentación estratégica exacta que debes usar al programar tu campaña.
              </p>
            </div>
            <button 
              onClick={() => setActiveInstructionAlert(false)}
              className="text-[10px] bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-bold tracking-wider uppercase transition-all cursor-pointer flex-none self-start sm:self-center"
            >
              Cerrar Guía
            </button>
          </div>
        )}

        {/* Quick Autocomplete Templates section */}
        <div className="text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
            ⚡ Autocompletar con Plantillas de Prueba Rápida:
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectTemplate(tpl)}
                className="bg-slate-50 hover:bg-indigo-50/70 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1"
              >
                <span>{tpl.name}</span>
                <ChevronRight size={12} className="text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Workspace Layout - Grid Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Column 1: Config Form (span-5) */}
          <section className="lg:col-span-5 bg-white border border-slate-200 p-5 md:p-6 rounded-2xl shadow-xs text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <BookOpen size={15} />
                </div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Detalles del Curso
                </h3>
              </div>
              <button 
                type="button"
                onClick={handleClearForm}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-600 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                title="Limpiar campos"
              >
                <Trash2 size={12} />
                <span>Limpiar</span>
              </button>
            </div>

            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              
              {/* Box: Course Title */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Título Oficial del Curso *</span>
                  <span className="text-[9px] font-normal font-mono text-indigo-600 lowercase bg-indigo-50 px-1.5 py-0.5 rounded">Obligatorio</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Excel Financiero Avanzado con VBA"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Grid: Duration & Certification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Clock size={12} className="text-slate-400" />
                    <span>Duración</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 4 semanas o 24 horas"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Award size={12} className="text-slate-400" />
                    <span>Certificación</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Digital con código QR"
                    value={formData.certification}
                    onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                  />
                </div>

              </div>

              {/* Box: Format & Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Modalidad / Formato</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800 font-medium"
                  >
                    <option value="Online Grabado">Online Grabado (Pre-grabado)</option>
                    <option value="Online En Vivo (Zoom/Meet)">En Vivo (Zoom / Meet)</option>
                    <option value="Híbrido (Vivo y Grabado)">Híbrido (Grabaciones + Vivo)</option>
                    <option value="Presencial">Presencial (Sede física)</option>
                    <option value="Taller de 1 Día">Clase magistral única / Taller</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Tag size={12} className="text-slate-400" />
                    <span>Precio / Oferta</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: $27 USD (Preventa)"
                    value={formData.pricing}
                    onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                  />
                </div>

              </div>

              {/* Box: Target Audience */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <User size={12} className="text-slate-400" />
                  <span>Público Objetivo Primario</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Contadores junior, estudiantes..."
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Box: Description */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">¿Qué aprenderán en el curso?</label>
                <textarea
                  rows={4}
                  placeholder="Describe brevemente de qué trata el curso, los módulos clave o problemas prácticos que soluciona."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium resize-none"
                />
              </div>

              {/* Box: Extras */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Extras / Bonos de Regalo</label>
                <input
                  type="text"
                  placeholder="Ej: Soporte por WhatsApp de por vida, Acceso a 15 plantillas..."
                  value={formData.extras}
                  onChange={(e) => setFormData({ ...formData, extras: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Action Error if any */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-2 text-rose-800 text-xs">
                  <AlertCircle size={15} className="text-rose-600 flex-none mt-0.5" />
                  <div>
                    <span className="font-extrabold block">Error de Generación:</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white font-bold py-3 px-4 rounded-xl mt-3 hover:bg-slate-800 transition-colors cursor-pointer text-xs uppercase tracking-wider disabled:opacity-75 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Calculando Campaña...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="fill-current text-white" />
                    <span>GENERAR ESTRATEGIA</span>
                  </>
                )}
              </button>

            </form>
          </section>

          {/* Column 2: Content Area Display (span-7) */}
          <section className="lg:col-span-12 xl:col-span-7 flex flex-col gap-6">
            
            {/* Loading Overlay State */}
            {isLoading && (
              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center min-h-[430px] w-full">
                <div className="relative flex items-center justify-center w-16 h-16 mb-5">
                  <div className="absolute inset-0 bg-indigo-50 rounded-full animate-ping"></div>
                  <div className="w-12 h-12 bg-indigo-50 border border-indigo-150 rounded-full flex items-center justify-center">
                    <Loader2 size={24} className="text-indigo-600 animate-spin" />
                  </div>
                </div>
                
                <h3 className="text-sm font-bold text-slate-800">
                  Analizando parámetros publicitarios...
                </h3>
                
                <div className="max-w-md w-full mt-3 bg-slate-50 border border-slate-150 p-4 rounded-xl min-h-[72px] flex items-center justify-center">
                  <p className="text-xs text-slate-600 font-medium leading-relaxed italic animate-pulse">
                     {loadingMessages[loadingStep]}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-center gap-1.5 text-[9px] text-slate-400 font-mono tracking-widest uppercase">
                  <span>DISEÑO MINIMALISTA DE PRECISIÓN</span>
                </div>
              </div>
            )}

            {/* Default State - Prior to generation */}
            {!isLoading && !results && (
              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center min-h-[430px] w-full text-left">
                <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-5">
                  <Sparkles size={22} className="fill-current text-slate-600" />
                </div>
                
                <h3 className="text-base font-bold text-slate-900 mb-2 font-display">
                  Launchpad de Campañas Meta Ads
                </h3>
                <p className="text-xs text-slate-500 max-w-lg text-center leading-relaxed">
                  Completa los datos de tu curso en el formulario de la izquierda o selecciona un ejemplo predefinido para generar tus copys optimizados e intereses buscables de Facebook Ads.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mt-8">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5 items-center">
                    <span className="text-base">🎯</span>
                    <span className="text-xs font-bold text-slate-800">Segmentación</span>
                    <span className="text-[11px] text-slate-500 text-center leading-normal">Intereses detallados del catálogo de Meta.</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5 items-center">
                    <span className="text-base">✍️</span>
                    <span className="text-xs font-bold text-slate-800">Copys Clave</span>
                    <span className="text-[11px] text-slate-500 text-center leading-normal">Bajo fórmulas AIDA, PAS y Storytelling.</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5 items-center">
                    <span className="text-base">📱</span>
                    <span className="text-xs font-bold text-slate-800">Vista Previa</span>
                    <span className="text-[11px] text-slate-500 text-center leading-normal">Simulado interactivo de post de Facebook.</span>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-1.5 bg-indigo-50 text-indigo-800 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-indigo-100 animate-pulse">
                  <Lightbulb size={12} />
                  <span>Haz clic en "📊 Excel Financiero" arriba para ver la magia de inmediato.</span>
                </div>
              </div>
            )}

            {/* Results Panel */}
            {!isLoading && results && (
              <div className="flex flex-col gap-5 w-full">
                
                {/* Result Control Menu Tabs */}
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setActiveTab("copies")}
                      className={`px-4 py-2 rounded-md text-xs font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeTab === "copies"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      🗣️ Copys Publicitarios
                    </button>
                    <button
                      onClick={() => setActiveTab("adsConfig")}
                      className={`px-4 py-2 rounded-md text-xs font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeTab === "adsConfig"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      🎯 Configuración Meta Ads
                    </button>
                    <button
                      onClick={() => setActiveTab("flyerDesigner")}
                      className={`px-4 py-2 rounded-md text-xs font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeTab === "flyerDesigner"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      🎨 Diseño de Flyer & Video
                    </button>
                  </div>

                  <div className="px-3 py-1 font-mono text-[9px] bg-slate-100 text-slate-500 tracking-wider uppercase rounded">
                    PROCESADO POR AI
                  </div>
                </div>

                {/* Tab content wrapper */}
                <div className="transition-all duration-300">
                  
                  {/* Panel Option A: COPIES FOR FACEBOOK */}
                  {activeTab === "copies" && (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                      
                      {/* Left: Variations Navigation list (span-4) */}
                      <div className="xl:col-span-4 flex flex-col gap-2 text-left">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                          Ángulos Persuasivos:
                        </span>
                        {results.variations.map((v, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedCopyIndex(index);
                              if (soundEnabled) {
                                try {
                                  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                                  const osc = audioCtx.createOscillator();
                                  const gainNode = audioCtx.createGain();
                                  osc.connect(gainNode);
                                  gainNode.connect(audioCtx.destination);
                                  osc.type = "sine";
                                  osc.frequency.setValueAtTime(440, audioCtx.currentTime); // La
                                  gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
                                  osc.start();
                                  osc.stop(audioCtx.currentTime + 0.05);
                                } catch (e) {}
                              }
                            }}
                            className={`w-full p-4 rounded-xl border text-left cursor-pointer transition-all ${
                              selectedCopyIndex === index
                                ? "bg-slate-950 text-white border-slate-950 shadow-sm scale-[1.01]"
                                : "bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50"
                            }`}
                          >
                            <span className={`text-[9px] font-bold uppercase tracking-widest block ${
                              selectedCopyIndex === index ? "text-indigo-200" : "text-indigo-600"
                            }`}>
                              Variación {index + 1}
                            </span>
                            <span className="text-xs font-bold block truncate mt-0.5 leading-tight">
                              {v.style}
                            </span>
                          </button>
                        ))}

                        <div className="mt-4 p-4 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-left">
                          <span className="text-xs font-bold block">💡 Test de Variaciones:</span>
                          <span className="text-[11px] leading-relaxed block mt-1">
                            Lanza los 3 copys simultáneamente para evaluar el CTR (Click-Through Rate) más óptimo.
                          </span>
                        </div>
                      </div>

                      {/* Right: Selected Copy detailed inspector & Simulated FB feed (span-8) */}
                      <div className="xl:col-span-8 flex flex-col gap-4">
                        <FacebookPostPreview
                          variation={results.variations[selectedCopyIndex]}
                          courseTitle={formData.title || "Tu Curso Increíble"}
                          courseFormat={formData.format}
                        />
                      </div>

                    </div>
                  )}

                  {/* Panel Option B: ADS TARGETING & MEDIA CONFIG */}
                  {activeTab === "adsConfig" && (
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                      <AdConfigDisplay config={results.adsConfig} />
                    </div>
                  )}

                  {/* Panel Option C: INTERACTIVE FLYER DESIGNER & MINI VIDEO PROMPTS */}
                  {activeTab === "flyerDesigner" && (
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                      <FlyerDesigner
                        courseTitle={formData.title || "Tu Curso Increíble"}
                        courseFormat={formData.format}
                        courseDuration={formData.duration}
                        courseCertification={formData.certification}
                      />
                    </div>
                  )}

                </div>

              </div>
            )}

          </section>

        </div>

      </main>

      {/* Aesthetic humanized footer info */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 mt-12 text-center text-xs text-slate-400 leading-relaxed font-normal">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            AI Ready: Optimizado para API de Meta v18.0 & 2026 Campaigns
          </p>
          <div className="text-[10px] text-slate-400 font-medium tracking-tight">
            v1.2.0 - Diseño Minimalista de Precisión
          </div>
        </div>
      </footer>

    </div>
  );
}
