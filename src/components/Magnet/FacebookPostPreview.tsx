import { useState } from "react";
import { AdCopyVariation } from "../types";
import { ThumbsUp, MessageSquare, Share2, Globe, Laptop, Smartphone, Copy, Check } from "lucide-react";

interface FacebookPostPreviewProps {
  variation: AdCopyVariation;
  courseTitle: string;
  courseFormat: string;
}

export default function FacebookPostPreview({ variation, courseTitle, courseFormat }: FacebookPostPreviewProps) {
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${variation.hook}\n\n${variation.body}\n\n${variation.cta}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Profile metadata
  const pageName = "Tu Página / Marca Personal";
  const postDate = "Justo ahora";

  return (
    <div id="facebook-post-preview" className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-4">
      {/* Device & Copy Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold tracking-wide transition-all ${
              device === "mobile"
                ? "bg-slate-900 text-indigo-600 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                : "text-slate-400 hover:text-white"
            }`}
            title="Vista Móvil"
          >
            <Smartphone size={13} />
            <span>Móvil</span>
          </button>
          <button
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold tracking-wide transition-all ${
              device === "desktop"
                ? "bg-slate-900 text-indigo-600 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                : "text-slate-400 hover:text-white"
            }`}
            title="Vista Escritorio"
          >
            <Laptop size={13} />
            <span>PC / Escritorio</span>
          </button>
        </div>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            copied
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-900 hover:bg-slate-800 text-white shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          }`}
        >
          {copied ? (
            <>
              <Check size={13} />
              <span>¡Copiado!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copiar Texto Completo</span>
            </>
          )}
        </button>
      </div>

      {/* Simulated Facebook Post Body */}
      <div className="flex justify-center transition-all">
        <div
          className={`bg-slate-900 rounded-lg border border-slate-350 shadow-[0_0_20px_rgba(0,0,0,0.5)] text-left transition-all ${
            device === "mobile" ? "w-full max-w-[400px]" : "w-full"
          }`}
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
        >
          {/* Header section */}
          <div className="p-3.5 flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              {/* Fake Page Avatar */}
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 font-bold text-sm select-none">
                {pageName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1c1e21] hover:underline cursor-pointer flex items-center gap-1">
                  {pageName}
                  <span className="inline-block w-3.5 h-3.5 bg-indigo-600 rounded-full text-[8px] text-white flex items-center justify-center font-extrabold" title="Página verificada">
                    ✓
                  </span>
                </h4>
                <div className="text-[12px] text-[#65676b] flex items-center gap-1 font-normal">
                  <span>{postDate}</span>
                  <span>•</span>
                  <Globe size={11} className="text-[#65676b]" />
                  <span>•</span>
                  <span className="bg-[#f0f2f5] px-1 rounded text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Publicidad</span>
                </div>
              </div>
            </div>
            {/* Simple FB options dot */}
            <div className="text-slate-400 font-bold hover:bg-slate-800 p-1 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-sm">
              •••
            </div>
          </div>

          {/* Post Text Paragraphs */}
          <div className="px-3.5 pb-2.5 text-[14px] text-[#050505] leading-[1.4] whitespace-pre-wrap selection:bg-indigo-100 break-words">
            <p className="font-bold text-[15px] text-white mb-1.5">{variation.hook}</p>
            <p className="font-normal">{variation.body}</p>
            <p className="font-bold text-indigo-600 mt-3">{variation.cta}</p>
          </div>

          {/* Post Creative Attachment */}
          <div className="border-t border-b border-slate-800 bg-slate-950 cursor-pointer overflow-hidden transition-all hover:bg-slate-800">
            {/* Visual Header / Mock Graphic */}
            <div className="aspect-video w-full bg-slate-900 p-6 flex flex-col justify-between relative text-white">
              <div className="absolute top-3 left-3 bg-slate-900/10 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-white/20">
                🏷️ {courseFormat || "Inscripción Abierta"}
              </div>
              <div className="mt-8 flex-1 flex flex-col justify-center">
                <h3 className="text-lg md:text-xl font-extrabold tracking-tight leading-snug drop-shadow-[0_0_20px_rgba(0,0,0,0.5)] line-clamp-2 max-w-xs font-display">
                  {courseTitle}
                </h3>
                <p className="text-[11px] text-slate-300 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] line-clamp-1 mt-1 max-w-xs">
                  Aprende paso a paso con expertos
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-2.5 mt-2">
                <span className="text-[9px] text-slate-400 tracking-wide font-mono uppercase">AD DESIGN SYSTEM</span>
                <span className="text-[11px] font-bold bg-slate-900 text-white px-3 py-1 rounded shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center gap-1">
                  Inscribirse
                </span>
              </div>
            </div>

            {/* Bottom Meta Bar of the ad attachment */}
            <div className="bg-[#f0f2f5] p-3 flex items-center justify-between border-t border-[#e4e6eb]">
              <div className="flex-1 min-w-0 pr-2">
                <div className="text-[11px] text-[#65676b] uppercase tracking-wider truncate">
                  {pageName.toUpperCase()}
                </div>
                <div className="text-[14px] font-bold text-[#1c1e21] truncate mt-0.5" title={courseTitle}>
                  {courseTitle}
                </div>
                <div className="text-[11px] text-[#65676b] truncate line-clamp-1 mt-0.5">
                  Haz clic para ver las certificaciones y los beneficios exclusivos de la comunidad. No esperes más.
                </div>
              </div>
              
              {/* Call to Action Button in Ad */}
              <button className="flex-none bg-[#e4e6eb] hover:bg-[#d8dadf] text-[#050505] font-bold py-1.5 px-3.5 rounded-md text-xs select-none transition-colors border border-slate-350 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                Más información
              </button>
            </div>
          </div>

          {/* Social Stats - Fake Likes */}
          <div className="px-3.5 py-2 flex items-center justify-between text-[13px] text-[#65676b] border-b border-[#e4e6eb]">
            <div className="flex items-center gap-1">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 border-2 border-white select-none shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <span className="text-[9px] text-white">👍</span>
              </span>
              <span className="font-semibold text-[#1c1e21]">124</span>
            </div>
            <div className="flex items-center gap-2">
              <span>24 comentarios</span>
              <span>•</span>
              <span>18 compartidos</span>
            </div>
          </div>

          {/* Fake action buttons */}
          <div className="px-1 py-1 flex items-center justify-around text-[13px] font-bold text-[#65676b]">
            <button className="flex items-center justify-center gap-1.5 py-2 px-1 hover:bg-[#f2f2f2] rounded-md flex-1 text-center cursor-pointer transition-colors">
              <ThumbsUp size={16} />
              <span>Me gusta</span>
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2 px-1 hover:bg-[#f2f2f2] rounded-md flex-1 text-center cursor-pointer transition-colors">
              <MessageSquare size={16} />
              <span>Comentar</span>
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2 px-1 hover:bg-[#f2f2f2] rounded-md flex-1 text-center cursor-pointer transition-colors">
              <Share2 size={16} />
              <span>Compartir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Creative Graphic Spec */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          💡 Dirección de Arte / Recurso Gráfico Recomendado:
        </h5>
        <p className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-indigo-500 pl-2.5">
          "{variation.suggestedImagePrompt}"
        </p>
      </div>
    </div>
  );
}
