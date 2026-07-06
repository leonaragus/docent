import { useState, useEffect, FormEvent } from "react";
import { CourseDataInput, AdsGeneratorResult, CourseTemplate } from "./Magnet/types";
import { QUICK_TEMPLATES } from "./Magnet/QuickTemplates";
import FacebookPostPreview from "./Magnet/FacebookPostPreview";
import AdConfigDisplay from "./Magnet/AdConfigDisplay";
import FlyerDesigner from "./Magnet/FlyerDesigner";
import { GoogleGenAI } from "@google/genai";
import { useLanguage } from "../contexts/LanguageContext";
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
  ChevronRight,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DocentMagnet({ 
  initialCourseData, 
  onSendToTeleprompter 
}: { 
  initialCourseData?: any; 
  onSendToTeleprompter?: (script: string) => void;
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  // Form State
  const [formData, setFormData] = useState<CourseDataInput>({
    title: initialCourseData?.name || "",
    description: initialCourseData?.chapters?.join(", ") || "",
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
    isEn ? "Analyzing course syllabus and audience..." : "Analizando el temario y el público de tu curso...",
    isEn ? "Generating persuasive copy with high-conversion angles..." : "Generando copys persuasivos con ángulos de alta conversión...",
    isEn ? "Structuring psychological sales formulas (AIDA, PAS)..." : "Estructurando fórmulas psicológicas de ventas (AIDA, PAS)...",
    isEn ? "Analyzing meta interests inventory in real time..." : "Analizando el inventario de intereses meta en tiempo real...",
    isEn ? "Profiling optimal geographic, age and gender demographics..." : "Perfilando demografía geográfica, edad y género óptimos...",
    isEn ? "Compiling advanced exclusions to protect your budget..." : "Compilando exclusiones avanzadas para proteger tu presupuesto...",
    isEn ? "Assembling the strategic optimization manual for Facebook Ads..." : "Armando el manual de optimización estratégico para Facebook Ads..."
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

  const triggerFallback = () => {
    // Advanced offline heuristic generation
    const fallbackResults: AdsGeneratorResult = {
      variations: [
        {
          style: "Storytelling / Conexión Emocional",
          hook: `¿Te sientes estancado intentando dominar ${formData.title || "esta habilidad"}? 😢`,
          body: `Conozco la frustración de intentar avanzar y sentir que el tiempo no alcanza. Por eso he diseñado este programa ${formData.format}, para que vayas a tu propio ritmo. \n\nEn solo ${formData.duration || "unas semanas"}, aprenderás exactamente lo que necesitas: ${formData.description || "Habilidades prácticas aplicables hoy mismo."}\n\nAdemás te llevas: ${formData.extras || "Material exclusivo y sorpresas de bonus."} 🎁\n\nY al finalizar, recibes tu certificado ${formData.certification || "de finalización"} para destacar en tu sector.`,
          cta: `🔥 Únete ahora por ${formData.pricing || "un precio especial"} 🔥\n\nHaz clic en el botón de abajo y comienza tu transformación. 👇`,
          suggestedImagePrompt: "Imagen de una persona sonriendo de alivio mientras ve una laptop en un ambiente cálido de estudio."
        },
        {
          style: "Directo enfocado en Beneficios y Urgencia",
          hook: `🚨 ÚLTIMA OPORTUNIDAD: Domina ${formData.title || "tu área"} en tiempo récord ⏳`,
          body: `No pierdas más tiempo buscando información suelta. Esto es lo que obtienes hoy:\n\n✅ Acceso inmediato al formato ${formData.format}\n✅ Duración optimizada de ${formData.duration || "estudio enfocado"}\n✅ ${formData.extras ? `BONUS INCLUIDO: ${formData.extras}` : "Plantillas listas para usar"}\n✅ Aval oficial con certificado ${formData.certification || "digital"}\n\nSi eres ${formData.audience || "un profesional en busca de crecimiento"}, esto es para ti.`,
          cta: `⚠️ El precio de ${formData.pricing || "oferta"} está a punto de subir. \n\nHaz clic aquí y asegura tu cupo YA. 👉`,
          suggestedImagePrompt: "Gráfico de barras subiendo rápidamente con texto destacado de oferta y reloj de arena."
        },
        {
          style: "Problema - Agitación - Solución (Fórmula PAS)",
          hook: `⚠️ El mayor error que comete la gente al aprender ${formData.title || "esto"}... 👇`,
          body: `El problema es estudiar teoría sin práctica, gastando cientos de horas sin ver resultados claros. Y si no cambias tu enfoque ahora, te quedarás atrás de tu competencia.\n\nLa solución es simple:\nNuestro método ${formData.format} está diseñado para que en ${formData.duration || "poco tiempo"} puedas implementar cada lección de forma práctica.\n\n${formData.audience ? `Especialmente diseñado para ${formData.audience}.` : ""} \n\nTodo con un certificado ${formData.certification || "de garantía"} y con ${formData.extras || "materiales premium"}.`,
          cta: `Todo esto por apenas ${formData.pricing || "una pequeña inversión"}.\n\n¡Inscríbete dando clic abajo antes de que cerremos! 💥`,
          suggestedImagePrompt: "Persona con cara de estrés en una oficina oscura, con una flecha apuntando a una persona relajada usando una tablet luminosa."
        }
      ],
      adsConfig: {
        objective: "Ventas o Clientes Potenciales",
        conversionLocation: "Sitio web o Formulario instantáneo",
        estimatedBudget: "$5 a $10 USD diarios para la fase de testeo",
        demographics: {
          locations: "América Latina y España (O países clave según moneda)",
          ageRange: "25 - 45 años",
          genders: "Ambos géneros (Abierto en fase inicial)"
        },
        interestsToTarget: [
          {
            interest: formData.title.split(" ")[0] || "Educación en línea",
            reason: "Interés primario directamente relacionado con el nombre de tu curso."
          },
          {
            interest: formData.audience.split(" ")[0] || "Desarrollo personal",
            reason: "Segmentación hacia el perfil demográfico que has definido."
          },
          {
            interest: "Cursos masivos abiertos en línea",
            reason: "Para encontrar personas con historial de compra de infoproductos educativos."
          }
        ],
        exclusions: "Excluye: Empleados de Facebook, Hotmart, o Clickbank (si deseas evitar que competidores de marketing de afiliados vean tu anuncio).",
        placements: "Advantage+ Placements (Ubicaciones automáticas de Meta)",
        formatRecommendation: "Video corto estilo Reel/TikTok (9:16) con subtítulos dinámicos.",
        dynamicRealTimeTips: [
          "Usa Campañas CBO (Advantage+ Campaign Budget) para optimizar presupuesto.",
          "Crea un público personalizado de 'Reproducciones de Video al 50%' para retargeting.",
          "Activa las Mejoras Estándar en los creativos para que Meta ajuste colores y música."
        ]
      }
    };
    
    setResults(fallbackResults);
    setSelectedCopyIndex(0);
    setActiveTab("copies");
  };

  // Trigger campaign generation flow
  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError(isEn ? "Please enter at least the course title or name." : "Por favor ingresa al menos el título o nombre del curso.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    setLoadingStep(0);

    // Artificial delay for UI UX
    await new Promise(r => setTimeout(r, 2000));

    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) {
        // Fallback to local algorithms if no API key
        triggerFallback();
      } else {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
Eres un experto en Marketing de Afiliación, Copywriting Profesional y Especialista en Meta/Facebook Ads con más de 10 años de experiencia.
Tu tarea es generar tres (3) copys de anuncios promocionales para Facebook altamente persuasivos y la CONFIGURACIÓN DE SEGMENTACIÓN DETALLADA e IDEAL en Meta Ads Manager para promover el siguiente curso:

=== DATOS DEL CURSO ===
- Título: ${formData.title}
- Descripción: ${formData.description || "No especificada"}
- Duración: ${formData.duration || "No especificada"}
- Certificación / Certificado: ${formData.certification || "No especificada"}
- Público Objetivo Primario: ${formData.audience || "Público general interesado en el sector"}
- Precio / Oferta: ${formData.pricing || "No especificado"}
- Modalidad / Formato: ${formData.format || "Online"}
- Datos Extras: ${formData.extras || "Ninguno"}

=== REQUISITOS DEL COPYWRITING (VARIACIONES) ===
Genera 3 variaciones de copys con los siguientes perfiles/estilos:
1. "Storytelling / Conexión Emocional": Empieza con una historia real o dolor, transformación y CTA.
2. "Directo enfocado en Beneficios y Urgencia": Bullet points y escasez.
3. "Problema - Agitación - Solución (Fórmula PAS)".

=== REQUISITOS DE CONFIGURACIÓN DE FACEBOOK ADS ===
Proporciona: objetivo, conversión, presupuesto, demografía, 3 intereses detallados, exclusiones, ubicaciones, formato y 3 tips dinámicos.

Devuelve rigurosamente el JSON estructurado con:
{
  "variations": [ { "style": "", "hook": "", "body": "", "cta": "", "suggestedImagePrompt": "" } ],
  "adsConfig": { "objective": "", "conversionLocation": "", "estimatedBudget": "", "demographics": { "locations": "", "ageRange": "", "genders": "" }, "interestsToTarget": [ { "interest": "", "reason": "" } ], "exclusions": "", "placements": "", "formatRecommendation": "", "dynamicRealTimeTips": [""] }
}
`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        if (response.text) {
          const result = JSON.parse(response.text);
          setResults(result);
          setSelectedCopyIndex(0);
          setActiveTab("copies");
        } else {
          throw new Error("Empty response");
        }
      }
    } catch (err: any) {
      console.error(err);
      triggerFallback(); // Graceful degrade offline
    } finally {
      setIsLoading(false);
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
    }
  };

  const handleSendToTeleprompter = () => {
    if (results && results.variations[selectedCopyIndex]) {
      const copy = results.variations[selectedCopyIndex];
      // Generate a script optimized for speaking
      const script = `--- GUIÓN DE ANUNCIO DE VIDEO ---\n\n(Mirando a la cámara, con energía)\n\n${copy.hook}\n\n${copy.body}\n\n${copy.cta}\n\n(Sonríe y mantén la pose 3 segundos al final)`;
      if (onSendToTeleprompter) {
        onSendToTeleprompter(script);
        // Also dispatch global event
        const event = new CustomEvent('magnet_script_generated', { detail: script });
        window.dispatchEvent(event);
      }
    }
  };

  return (
    <div className="flex-1 w-full bg-black text-white antialiased font-sans flex flex-col justify-start selection:bg-indigo-500/30 selection:text-white p-6 lg:p-8">
      
      {/* Upper Brand Bar */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between mb-8 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-xl flex items-center justify-center text-white shadow-lg border border-indigo-500/30">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">DOCENT Suite</span>
            <span className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              DOCENT Magnet <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 rounded uppercase font-bold border border-emerald-500/20">AI</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-2"
            title={soundEnabled ? (isEn ? "Mute effects" : "Silenciar efectos") : (isEn ? "Enable effects" : "Activar efectos")}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="hidden sm:inline text-xs uppercase font-bold tracking-wider">{isEn ? "Effects" : "Efectos"}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto flex flex-col gap-6 relative z-10">
        
        {/* Short Instruction Alert */}
        <AnimatePresence>
          {activeInstructionAlert && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
              <div className="z-10">
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles size={20} className="text-indigo-400" />
                  <span>{isEn ? "Campaign & Script Planner (Offline-First)" : "Planificador de Campañas y Guiones (Offline-First)"}</span>
                </h2>
                <p className="text-sm text-slate-400 max-w-3xl mt-2 leading-relaxed">
                  {isEn ? "Enter your course information to generate multiple ad variations and the exact strategic segmentation in Facebook Ads. Send the result directly to the Recording Studio Teleprompter!" : "Coloca la información de tu curso para generar múltiples variaciones de anuncios y la segmentación estratégica exacta en Facebook Ads. ¡Enviá el resultado directamente al Teleprompter del Estudio de Grabación!"}
                </p>
              </div>
              <button 
                onClick={() => setActiveInstructionAlert(false)}
                className="text-xs bg-slate-950 hover:bg-black border border-slate-800 text-white px-4 py-2 rounded-xl font-bold tracking-widest uppercase transition-all flex-none self-start sm:self-center"
              >
                {isEn ? "Close Guide" : "Cerrar Guía"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Autocomplete Templates section */}
        <div className="text-left bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-4">
            {isEn ? "⚡ Autocomplete with Quick Test Templates:" : "⚡ Autocompletar con Plantillas de Prueba Rápida:"}
          </span>
          <div className="flex flex-wrap gap-3">
            {QUICK_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectTemplate(tpl)}
                className="bg-slate-950 hover:bg-indigo-900/40 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
              >
                <span>{tpl.name}</span>
                <ChevronRight size={14} className="text-slate-500" />
              </button>
            ))}
          </div>
        </div>

        {/* Workspace Layout - Grid Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Config Form (span-5) */}
          <section className="lg:col-span-5 bg-slate-900/50 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <BookOpen size={18} />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {isEn ? "Course Details" : "Detalles del Curso"}
                </h3>
              </div>
              <button 
                type="button"
                onClick={handleClearForm}
                className="text-[10px] font-bold text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-wider flex items-center gap-1.5"
                title={isEn ? "Clear fields" : "Limpiar campos"}
              >
                <Trash2 size={14} />
                <span>{isEn ? "Clear" : "Limpiar"}</span>
              </button>
            </div>

            <form onSubmit={handleGenerate} className="flex flex-col gap-5">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                  <span>{isEn ? "Official Course Title *" : "Título Oficial del Curso *"}</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={isEn ? "Ex: Advanced Financial Excel with VBA" : "Ej: Excel Financiero Avanzado con VBA"}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all text-white placeholder:text-slate-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={12} className="text-slate-500" />
                    <span>{isEn ? "Duration" : "Duración"}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={isEn ? "Ex: 4 weeks" : "Ej: 4 semanas"}
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Award size={12} className="text-slate-500" />
                    <span>{isEn ? "Certification" : "Certificación"}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={isEn ? "Ex: Digital" : "Ej: Digital"}
                    value={formData.certification}
                    onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isEn ? "Format" : "Modalidad"}</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-white"
                  >
                    <option value="Online Grabado">{isEn ? "Pre-recorded Online" : "Online Grabado"}</option>
                    <option value="Online En Vivo (Zoom/Meet)">{isEn ? "Live Online (Zoom/Meet)" : "En Vivo"}</option>
                    <option value="Híbrido (Vivo y Grabado)">{isEn ? "Hybrid (Live and Recorded)" : "Híbrido"}</option>
                    <option value="Presencial">{isEn ? "In-person" : "Presencial"}</option>
                    <option value="Taller de 1 Día">{isEn ? "1-Day Workshop" : "Clase única / Taller"}</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Tag size={12} className="text-slate-500" />
                    <span>{isEn ? "Offer" : "Oferta"}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={isEn ? "Ex: $27 USD" : "Ej: $27 USD"}
                    value={formData.pricing}
                    onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User size={12} className="text-slate-500" />
                  <span>{isEn ? "Target Audience" : "Público Objetivo"}</span>
                </label>
                <input
                  type="text"
                  placeholder={isEn ? "Ex: Junior accountants, students..." : "Ej: Contadores junior, estudiantes..."}
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isEn ? "What will they learn in the course?" : "¿Qué aprenderán en el curso?"}</label>
                <textarea
                  rows={3}
                  placeholder={isEn ? "Briefly describe what the course is about." : "Describe brevemente de qué trata el curso."}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-white placeholder:text-slate-600 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isEn ? "Extras / Bonuses" : "Extras / Bonos"}</label>
                <input
                  type="text"
                  placeholder={isEn ? "Ex: VIP Support, Templates..." : "Ej: Soporte VIP, Plantillas..."}
                  value={formData.extras}
                  onChange={(e) => setFormData({ ...formData, extras: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                />
              </div>

              {error && (
                <div className="bg-rose-950/50 border border-rose-900 p-4 rounded-xl flex items-start gap-3 text-rose-400 text-xs">
                  <AlertCircle size={16} className="text-rose-500 flex-none" />
                  <div>
                    <span className="font-extrabold block mb-1">{isEn ? "Error:" : "Error:"}</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-black py-4 px-6 rounded-2xl mt-4 hover:from-indigo-500 hover:to-indigo-400 transition-all cursor-pointer text-sm tracking-widest disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{isEn ? "CALCULATING STRATEGY..." : "CALCULANDO ESTRATEGIA..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="fill-current text-indigo-200" />
                    <span>{isEn ? "GENERATE CAMPAIGN" : "GENERAR CAMPAÑA"}</span>
                  </>
                )}
              </button>

            </form>
          </section>

          {/* Column 2: Content Area Display (span-7) */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Loading State */}
            {isLoading && (
              <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-3xl shadow-2xl backdrop-blur-md text-center flex flex-col items-center justify-center min-h-[500px] w-full">
                <div className="relative flex items-center justify-center w-20 h-20 mb-8">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
                  <div className="w-16 h-16 bg-slate-950 border border-indigo-500/50 rounded-full flex items-center justify-center">
                    <Loader2 size={32} className="text-indigo-400 animate-spin" />
                  </div>
                </div>
                
                <h3 className="text-lg font-black text-white mb-2 tracking-tight">
                  {isEn ? "Synthesizing advertising profile..." : "Sintetizando perfil publicitario..."}
                </h3>
                
                <div className="max-w-md w-full mt-4 bg-slate-950 border border-slate-800 p-5 rounded-2xl min-h-[80px] flex items-center justify-center">
                  <p className="text-sm text-indigo-300 font-medium italic animate-pulse text-center">
                     {loadingMessages[loadingStep]}
                  </p>
                </div>
              </div>
            )}

            {/* Default State */}
            {!isLoading && !results && (
              <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-3xl shadow-2xl backdrop-blur-md text-center flex flex-col items-center justify-center min-h-[500px] w-full text-left">
                <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                  <Target size={32} />
                </div>
                
                <h3 className="text-2xl font-black text-white mb-3">
                  {isEn ? "Meta Ads Command Center" : "Centro de Mando Meta Ads"}
                </h3>
                <p className="text-sm text-slate-400 max-w-md text-center leading-relaxed">
                  {isEn ? "Complete the course details or choose a template to generate irresistible ads and hyper-targeted segmentation." : "Completá los datos del curso o elegí una plantilla para generar anuncios irresistibles y segmentación hiper-dirigida."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mt-10">
                  <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-2 items-center text-center">
                    <span className="text-2xl">🎯</span>
                    <span className="text-sm font-bold text-white">{isEn ? "Segmentation" : "Segmentación"}</span>
                    <span className="text-xs text-slate-500">{isEn ? "Tactical interests" : "Intereses tácticos"}</span>
                  </div>
                  <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-2 items-center text-center">
                    <span className="text-2xl">✍️</span>
                    <span className="text-sm font-bold text-white">{isEn ? "Scripts & Copys" : "Guiones & Copys"}</span>
                    <span className="text-xs text-slate-500">{isEn ? "PAS Formulas & Storytelling" : "Fórmulas PAS y Storytelling"}</span>
                  </div>
                  <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-2 items-center text-center">
                    <span className="text-2xl">🎥</span>
                    <span className="text-sm font-bold text-white">{isEn ? "Direct Studio" : "Estudio Directo"}</span>
                    <span className="text-xs text-slate-500">{isEn ? "Send to Teleprompter" : "Envío al Teleprompter"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Results Panel */}
            {!isLoading && results && (
              <div className="flex flex-col gap-6 w-full">
                
                {/* Result Tabs */}
                <div className="bg-slate-900/80 p-2 rounded-2xl border border-slate-800 shadow-lg flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl">
                    <button
                      onClick={() => setActiveTab("copies")}
                      className={`px-5 py-2.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === "copies"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {isEn ? "🗣️ Sales Scripts" : "🗣️ Guiones de Venta"}
                    </button>
                    <button
                      onClick={() => setActiveTab("adsConfig")}
                      className={`px-5 py-2.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === "adsConfig"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {isEn ? "🎯 Meta Audiences" : "🎯 Públicos Meta"}
                    </button>
                    <button
                      onClick={() => setActiveTab("flyerDesigner")}
                      className={`px-5 py-2.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === "flyerDesigner"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {isEn ? "🎨 Design" : "🎨 Diseño"}
                    </button>
                  </div>
                </div>

                {/* Tab content */}
                <div className="transition-all duration-300">
                  
                  {activeTab === "copies" && (
                    <div className="flex flex-col gap-6">
                      {/* Teleprompter Action Button (THE KILLER FEATURE) */}
                      <button 
                        onClick={handleSendToTeleprompter}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white p-6 rounded-3xl font-black text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-4 transition-transform transform hover:scale-[1.02]"
                      >
                        <Send className="w-6 h-6" />
                        {isEn ? "SEND SCRIPT DIRECTLY TO TELEPROMPTER" : "ENVIAR GUION DIRECTO AL TELEPROMPTER"}
                      </button>

                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                        {/* Variations List */}
                        <div className="xl:col-span-5 flex flex-col gap-3 text-left">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                            {isEn ? "Persuasive Angles:" : "Ángulos Persuasivos:"}
                          </span>
                          {results.variations.map((v, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedCopyIndex(index)}
                              className={`w-full p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                                selectedCopyIndex === index
                                  ? "bg-slate-800 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                                  : "bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800"
                              }`}
                            >
                              <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${
                                selectedCopyIndex === index ? "text-indigo-400" : "text-slate-500"
                              }`}>
                                {isEn ? "Variation" : "Variación"} {index + 1}
                              </span>
                              <span className={`text-sm font-bold block truncate leading-tight ${
                                selectedCopyIndex === index ? "text-white" : "text-slate-300"
                              }`}>
                                {v.style}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Facebook Post Preview */}
                        <div className="xl:col-span-7 flex flex-col gap-4">
                          <FacebookPostPreview
                            variation={results.variations[selectedCopyIndex]}
                            courseTitle={formData.title || (isEn ? "Your Amazing Course" : "Tu Curso Increíble")}
                            courseFormat={formData.format}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "adsConfig" && (
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-md">
                      <AdConfigDisplay config={results.adsConfig} />
                    </div>
                  )}

                  {activeTab === "flyerDesigner" && (
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-md">
                      <FlyerDesigner
                        courseTitle={formData.title || (isEn ? "Your Amazing Course" : "Tu Curso Increíble")}
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
    </div>
  );
}
