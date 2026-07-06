import { useState } from "react";
import { MetaAdsConfig } from "../types";
import { Target, Users, MapPin, DollarSign, HelpCircle, Layers, Sliders, Check, Copy } from "lucide-react";

interface AdConfigDisplayProps {
  config: MetaAdsConfig;
}

export default function AdConfigDisplay({ config }: AdConfigDisplayProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(identifier);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 text-left" id="ads-planner-display">
      
      {/* Structural Block 1: Strategy & Target Objective */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Recommended Objective */}
        <div className="bg-slate-900 border border-slate-205 rounded-xl p-5 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 bg-slate-800 text-slate-100 rounded-lg flex items-center justify-center mb-3">
              <Target size={16} />
            </div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Objetivo en Meta</h4>
            <p className="text-base font-bold text-white mt-1">{config.objective}</p>
          </div>
          <p className="text-xs text-slate-400 mt-2 border-t border-slate-800 pt-2 leading-relaxed">
            Selecciona este objetivo al crear tu campaña en Meta Ads Manager.
          </p>
        </div>

        {/* Conversion Location */}
        <div className="bg-slate-900 border border-slate-205 rounded-xl p-5 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-3">
              <Layers size={16} />
            </div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Ubicación de Conversión</h4>
            <p className="text-base font-bold text-white mt-1">{config.conversionLocation}</p>
          </div>
          <p className="text-xs text-slate-400 mt-2 border-t border-slate-800 pt-2 leading-relaxed">
            El destino del tráfico publicitario (Landing, WhatsApp o Formulario).
          </p>
        </div>

        {/* Estimated Budget */}
        <div className="bg-slate-900 border border-slate-205 rounded-xl p-5 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center mb-3">
              <DollarSign size={16} />
            </div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Presupuesto Sugerido</h4>
            <p className="text-base font-bold text-white mt-1">{config.estimatedBudget}</p>
          </div>
          <p className="text-xs text-slate-400 mt-2 border-t border-slate-800 pt-2 leading-relaxed">
            Fondo de testeo recomendado para validar la audiencia eficientemente.
          </p>
        </div>

      </div>

      {/* Demographics Area */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
        <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Users size={15} className="text-slate-400" />
          <span>Perfil Demográfico Sugerido</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Locations */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 relative">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              <MapPin size={13} className="text-rose-500" />
              <span>Grup. Geográfico</span>
            </div>
            <p className="text-xs font-semibold text-slate-100 pr-8">{config.demographics.locations}</p>
            <button
              onClick={() => copyToClipboard(config.demographics.locations, "location")}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-400 cursor-pointer"
              title="Copiar ubicaciones"
            >
              {copiedText === "location" ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            </button>
          </div>

          {/* Age range */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              <Sliders size={13} className="text-indigo-500" />
              <span>Rango de Edades</span>
            </div>
            <p className="text-xs font-semibold text-slate-100">{config.demographics.ageRange}</p>
          </div>

          {/* Gender */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              <Users size={13} className="text-slate-400" />
              <span>Género Recomendado</span>
            </div>
            <p className="text-xs font-semibold text-slate-100">{config.demographics.genders}</p>
          </div>
        </div>
      </div>

      {/* Target Interests Grid (The core value of real-time FB targeting) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Target size={16} className="text-slate-300" />
            <span>Segmentación Detallada (Intereses recomendados en Meta)</span>
          </h3>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Busca estos nombres exactos dentro de Facebook Ads Manager
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.interestsToTarget.map((item, index) => (
            <div key={index} className="border border-slate-800 hover:border-slate-350 rounded-lg p-4 transition-all relative group bg-slate-950/40">
              <div className="flex items-center justify-between pr-8">
                <span className="inline-block bg-slate-900 text-slate-100 text-[11px] font-bold px-2.5 py-1 rounded border border-slate-250 font-mono tracking-wide">
                  {item.interest}
                </span>
                <button
                  onClick={() => copyToClipboard(item.interest, `interest-${index}`)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-400 transition-opacity cursor-pointer"
                  title={`Copiar interés "${item.interest}"`}
                >
                  {copiedText === `interest-${index}` ? (
                    <Check size={13} className="text-emerald-500" />
                  ) : (
                    <Copy size={12} className="opacity-70 hover:opacity-100" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed border-t border-slate-800 pt-2">
                <strong className="text-slate-300 block text-[9px] uppercase tracking-wider mb-0.5">Razón Estratégica:</strong>
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Exclusions & Placements Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Exclusions block */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
          <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            🚫 Exclusiones Recomendadas
          </h4>
          <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
            {config.exclusions || "No se especificaron exclusiones."}
          </p>
          <div className="bg-slate-900 p-2.5 rounded border border-slate-800 mt-3 text-[11px] text-slate-400 italic">
            💡 <strong>Consejo de exclusión:</strong> Al excluir personas que ya convirtieron o interactuaron con tus recursos en los últimos 30 días, optimizas la prospección de frío.
          </div>
        </div>

        {/* Placements block */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
          <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            📱 Ubicaciones (Placements)
          </h4>
          <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
            {config.placements || "Recomendado usar ubicaciones Advantage+ de Meta para permitir que la inteligencia artificial optimice según el costo por resultado."}
          </p>
          
          <div className="bg-slate-900 p-2.5 rounded border border-slate-800 mt-3 text-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Formato Creativo Recomendado:</span>
            <p className="text-slate-100 font-medium">
              {config.formatRecommendation}
            </p>
          </div>
        </div>

      </div>

      {/* Real-Time Meta Expert Optimization tips */}
      <div className="bg-slate-950 text-slate-200 rounded-xl p-5 relative overflow-hidden border border-slate-855">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <HelpCircle size={15} className="text-indigo-400" />
          <span>Manual de Acción y Consejos de Optimización</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {config.dynamicRealTimeTips.map((tip, idx) => (
            <div key={idx} className="flex gap-2 bg-slate-900 p-3 rounded border border-slate-850">
              <div className="w-5 h-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold flex-none mt-0.5">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed text-left">
                {tip}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="text-[11px] text-slate-400 leading-relaxed">
            🚀 <strong>¿Listo para arrancar?</strong> Copia los copys persuasivos generados en la sección anterior, diseña una imagen con base en las recomendaciones y monta tu campaña respetando esta segmentación.
          </div>
          <div className="bg-slate-800 text-slate-350 px-2.5 py-1 rounded text-[9px] font-mono tracking-widest flex-none">
            META RADAR 2026
          </div>
        </div>
      </div>

    </div>
  );
}
