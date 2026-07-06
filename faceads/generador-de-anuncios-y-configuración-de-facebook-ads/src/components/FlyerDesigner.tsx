import { useState } from "react";
import { Copy, Check, Sparkles, Video, Image, Play, Sliders, Palette, RefreshCw } from "lucide-react";

interface FlyerDesignerProps {
  courseTitle: string;
  courseFormat: string;
  courseDuration?: string;
  courseCertification?: string;
}

export default function FlyerDesigner({
  courseTitle,
  courseFormat,
  courseDuration = "8 semanas",
  courseCertification = "Certificado Oficial"
}: FlyerDesignerProps) {
  // Preset styles
  const BACKGROUNDS = [
    { name: "Minimal Dark Carbon", class: "from-slate-950 via-slate-900 to-slate-950 text-white", border: "border-slate-800" },
    { name: "Neon Indigo Surge", class: "from-indigo-950 via-slate-900 to-slate-950 text-indigo-100", border: "border-indigo-900" },
    { name: "Emerald Growth", class: "from-emerald-950 via-slate-900 to-slate-950 text-emerald-100", border: "border-emerald-900" },
    { name: "Sunset Warmth", class: "from-amber-950 via-stone-900 to-stone-950 text-amber-100", border: "border-amber-900/50" },
    { name: "Monochrome Pure Blanco", class: "from-white via-slate-50 to-white text-slate-900", border: "border-slate-200" }
  ];

  const BADGE_PRESETS = [
    "¡CUPOS LIMITADOS!",
    "MATRÍCULA ABIERTA",
    "70% DESCUENTO HOY",
    "100% ONLINE",
    "APRENDE PRÁCTICO"
  ];

  // States
  const [selectedBg, setSelectedBg] = useState(0);
  const [badgeText, setBadgeText] = useState("¡CUPOS LIMITADOS!");
  const [customHeading, setCustomHeading] = useState(courseTitle);
  const [customDetail, setCustomDetail] = useState(`Duración: ${courseDuration} • Incluye ${courseCertification}`);
  const [highlightColor, setHighlightColor] = useState<"indigo" | "rose" | "emerald" | "amber" | "white">("indigo");
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [copiedAction, setCopiedAction] = useState(false);

  // Sync to course title changes
  if (customHeading !== courseTitle && customHeading === "") {
    setCustomHeading(courseTitle);
  }

  const activeBg = BACKGROUNDS[selectedBg];

  // Color mappings
  const colorClasses = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    white: "text-slate-300 bg-slate-500/10 border-slate-500/20"
  };

  const getBadgeColor = () => {
    if (activeBg.name === "Monochrome Pure Blanco") {
      return "text-indigo-600 bg-indigo-50 border-indigo-200";
    }
    return colorClasses[highlightColor];
  };

  const getSubtleTextColor = () => {
    return activeBg.name === "Monochrome Pure Blanco" ? "text-slate-500" : "text-slate-400";
  };

  const getTitleColor = () => {
    return activeBg.name === "Monochrome Pure Blanco" ? "text-slate-900" : "text-white";
  };

  // Video Cinematic Animation Prompts for AI Tool Suites
  const VIDEO_PROMPTS = [
    {
      title: "1. Zoom Cinematográfico 3D (Animación de Lanzamiento)",
      tool: "Luma Dream Machine o Runway Gen-3",
      prompt: `Cinematic commercial for professional course "${customHeading}". A sleek, glossy dark tech textbook slowly rotates in the center under clean studio lighting. The dynamic badge glows in elegant neon text stating "${badgeText}". Subtle particle dust flows in the dark background, ultra-realistic, high contrast, smooth 3D slow zoom motion, 4k, marketing quality.`
    },
    {
      title: "2. Revelación de Texto Cinético (Estilo Reel/TikTok Dinámico)",
      tool: "Runway Gen-2 / Sora / CapCut Studio",
      prompt: `Fast-paced typography animation. Ultra crisp text displaying "${customHeading}" and "${customDetail}" zooms smoothly toward the camera against an elegant minimalist background with rich volumetric lighting. High-end financial and tech aesthetic, modern corporate commercial styling, motion design, flawless motion graphics.`
    },
    {
      title: "3. Holograma Futurista de Crecimiento Profesional",
      tool: "Kling AI o Runway Gen-3",
      prompt: `A close-up shot of an ambitious student looking at a glowing holographic interface displaying interactive charts, network nodes, and the title "${customHeading}". Shimmering neon light reflects on their professional wear, extremely clean minimalist corporate technology style, futuristic learning concept, smooth camera pan.`
    }
  ];

  const handleCopyPrompt = (promptText: string, index: number) => {
    navigator.clipboard.writeText(promptText);
    setCopiedPromptIndex(index);
    setTimeout(() => setCopiedPromptIndex(null), 2000);
  };

  const handleCopyDesignLink = () => {
    navigator.clipboard.writeText(JSON.stringify({
      title: customHeading,
      badge: badgeText,
      detail: customDetail,
      theme: activeBg.name
    }, null, 2));
    setCopiedAction(true);
    setTimeout(() => setCopiedAction(false), 2000);
  };

  return (
    <div id="flyer-designer-container" className="flex flex-col gap-6 text-left">
      
      {/* Intro explanation matching user query about mini video & flyers */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex items-start gap-3.5 shadow-2xs">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-150 flex items-center justify-center flex-none">
          <Sparkles className="text-indigo-600 w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800 tracking-tight">Creador de Flyers y Storyboarding para Mini Video Publicitario</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Para optimizar tus campañas, te dotamos de un **Constructor Interactivo de Flyers**. Además de la imagen promocional, obtienes **Prompts Cinematográficos de Video** para que puedas animarlos de manera totalmente gratuita en 10 segundos con herramientas de video AI comerciales.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Control Panel inside Designer (span 5) */}
        <div className="xl:col-span-5 flex flex-col gap-5">
          
          {/* Section: Base Theme Grid selection */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-display">
              <Palette size={13} className="text-slate-500" />
              <span>Plantilla Visual de Fondo</span>
            </h5>
            <div className="flex flex-col gap-1.5">
              {BACKGROUNDS.map((bg, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedBg(idx)}
                  className={`w-full p-2.5 rounded-lg text-xs font-semibold text-left border flex items-center justify-between cursor-pointer transition-all ${
                    selectedBg === idx
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  <span>{bg.name}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 block" style={{
                    background: bg.name === "Monochrome Pure Blanco" ? "#ffffff" : "linear-gradient(to right, #000000, #312e81)"
                  }}></span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Design parameter customization fields */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs flex flex-col gap-4">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-display">
              <Sliders size={13} className="text-slate-500" />
              <span>Personalizar Datos del Flyer</span>
            </h5>

            {/* Custom Input: Badge Text preset */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-600">Texto del Badge Promocional</label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value.toUpperCase())}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 font-semibold"
              />
              <div className="flex flex-wrap gap-1 mt-1">
                {BADGE_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setBadgeText(p)}
                    className="text-[9px] bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-600 cursor-pointer font-medium"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input: Custom Heading text */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-600">Título para el Canvas</label>
              <textarea
                rows={2}
                value={customHeading}
                onChange={(e) => setCustomHeading(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 font-medium resize-none"
              />
            </div>

            {/* Custom Input: Custom Detail sentence */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-600">Detalles / Beneficios del Certificado</label>
              <input
                type="text"
                value={customDetail}
                onChange={(e) => setCustomDetail(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800"
              />
            </div>

            {/* Custom Palette selection for Glow effects */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-600">Color Destacado</label>
              <div className="flex gap-2">
                {(["indigo", "rose", "emerald", "amber", "white"] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => setHighlightColor(color)}
                    className={`w-6 h-6 rounded-full border cursor-pointer flex items-center justify-center text-[10px] uppercase font-bold ${
                      highlightColor === color ? "border-slate-800 scale-110 shadow-xs" : "border-slate-200"
                    }`}
                    style={{
                      backgroundColor:
                        color === "indigo" ? "#6366f1" :
                        color === "rose" ? "#f43f5e" :
                        color === "emerald" ? "#10b981" :
                        color === "amber" ? "#f59e0b" : "#e2e8f0"
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Section Call to action for designs export */}
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-250 flex flex-col gap-2.5">
            <span className="text-xs font-bold text-slate-700 block">📥 Cómo usar este Flyer en tus campañas:</span>
            <p className="text-[11px] text-slate-500 leading-normal">
              1. Configura el texto, fondo y colores idóneos a la izquierda.
              2. Toma una captura de pantalla del canvas de la derecha o copia los parámetros estructurados para enviarlos a tu diseñador oficial.
            </p>
            <button
              onClick={handleCopyDesignLink}
              className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                copiedAction ? "bg-emerald-600 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              {copiedAction ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedAction ? "¡Copiado al Portapapeles!" : "Copiar Ficha Técnica del Diseño"}</span>
            </button>
          </div>

        </div>

        {/* Right Active Preview & Prompts area (span 7) */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          
          {/* Sub block: Active Flyer Canvas preview */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">
              VISTA PREVIA DE TU CANVAS (FORMATO FLYER DE FACEBOOK: 1:1 SQUARE)
            </span>

            {/* Dynamic Flyer box wrapper */}
            <div
              id="clean-minimalism-flyer-canvas"
              className={`aspect-square w-full rounded-xl p-8 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br border shadow-sm select-none ${activeBg.class} ${activeBg.border}`}
            >
              {/* Glowing Ambient Mesh overlay inside card */}
              {activeBg.name !== "Monochrome Pure Blanco" && (
                <div 
                  className={`absolute bottom-[-15%] right-[-10%] w-60 h-60 rounded-full filter blur-3xl opacity-35 mix-blend-screen transition-all ${
                    highlightColor === "indigo" ? "bg-indigo-600" :
                    highlightColor === "rose" ? "bg-rose-600" :
                    highlightColor === "emerald" ? "bg-emerald-600" :
                    highlightColor === "amber" ? "bg-amber-600" : "bg-slate-500"
                  }`}
                />
              )}

              {/* Flyer Top Header */}
              <div className="flex justify-between items-start z-10">
                <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full border tracking-widest font-sans uppercase ${getBadgeColor()}`}>
                  🎯 {badgeText || "INSCRIBETE HOY"}
                </span>
                
                {/* Visual Minimal logo icon */}
                <div className="flex items-center gap-1 opacity-70">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span className="text-[9px] font-mono tracking-widest uppercase">ADFLOW DESIGN STUDIO</span>
                </div>
              </div>

              {/* Flyer Center Display Title Section */}
              <div className="my-auto z-10 flex flex-col gap-3 text-left max-w-sm">
                <span className="text-[11px] tracking-wider font-mono font-bold uppercase text-indigo-400 opacity-90">
                  PROGRAMA PROFESIONAL EN VIVO
                </span>
                <h2 className={`text-xl md:text-2xl font-black tracking-tight leading-snug uppercase ${getTitleColor()}`}>
                  {customHeading}
                </h2>
                
                {/* Horizontal divider */}
                <div className="w-16 h-1 bg-indigo-500 rounded my-1"></div>
              </div>

              {/* Flyer Bottom Footer details box */}
              <div className="flex justify-between items-end border-t border-slate-800/10 pt-4 z-10 mt-auto">
                <div className="flex flex-col gap-1">
                  <span className={`text-[11px] font-medium leading-relaxed ${getSubtleTextColor()}`}>
                    {customDetail}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1 uppercase">
                    <span>⚡ Garantía de Devolución</span>
                    <span>•</span>
                    <span>Format: {courseFormat}</span>
                  </span>
                </div>

                <span className="text-xs bg-slate-900 border border-slate-800/50 hover:bg-slate-800 font-bold px-3.5 py-2 rounded text-white tracking-wider flex-none uppercase shadow-xs">
                  Inscribirse
                </span>
              </div>

            </div>
          </div>

          {/* Sub block: Direct actionable Prompts to generate mini videos */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-2xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Video size={16} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                  Prompts de Video AI Personalizados para este Curso
                </h5>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  El secreto para aplastar a la competencia: genera videos cortos (TikToks, Reels) con estas directivas exactas.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {VIDEO_PROMPTS.map((p, idx) => (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 relative text-left">
                  <div className="flex flex-wrap items-center justify-between gap-2 pr-8 mb-1.5">
                    <span className="text-xs font-bold text-slate-800">{p.title}</span>
                    <span className="text-[9px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                      {p.tool}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-100 italic select-all leading-relaxed">
                    "{p.prompt}"
                  </p>

                  <button
                    onClick={() => handleCopyPrompt(p.prompt, idx)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title="Copiar prompt de video"
                  >
                    {copiedPromptIndex === idx ? (
                      <Check size={14} className="text-emerald-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Action advice block to explain capcut / Canva integration */}
            <div className="mt-4 p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-slate-600 leading-relaxed">
              💡 <strong>¿Cómo lograr el mejor resultado?</strong> Ingresa a <strong>Luma Dream Machine</strong> o <strong>RunwayML</strong> (ambos tienen planes gratuitos), pega cualquiera de los prompts anteriores y obtendrás un video cinematográfico de 4-5 segundos de tu curso. Luego usa <strong>CapCut</strong> para ponerle música y transiciones. Eso genera un CTR del 7% al 12% (comparado con el 1.5% promedio de flyers estáticos).
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
