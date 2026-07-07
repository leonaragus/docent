import { CheckCircle2, Volume2, HelpCircle, AlertCircle } from 'lucide-react';

export function Instructions() {
  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-slate-800 shadow-2xl space-y-5">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <HelpCircle className="w-5 h-5 text-emerald-400" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
          GUÍA RÁPIDA DE GRABACIÓN
        </h2>
      </div>

      <div className="space-y-4">
        {/* Step 1 */}
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold shrink-0 mt-0.5 border border-emerald-500/20">
            1
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Prepara tus fuentes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Activa o desactiva tu micrófono y el audio del sistema usando los interruptores del panel de configuración. Elige el micrófono correcto en el selector.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold shrink-0 mt-0.5 border border-emerald-500/20">
            2
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5 flex-wrap">
              ¡Crucial para audio de vídeos!
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                <Volume2 className="w-3 h-3" /> AUDIO DEL SISTEMA
              </span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Al hacer clic en <strong className="text-slate-300 font-bold uppercase">"Iniciar Grabación"</strong>, tu navegador abrirá la ventana flotante de compartir pantalla:
            </p>
            <ul className="list-disc list-inside pl-1 text-[11px] text-slate-400 space-y-1 pt-1">
              <li>
                <span className="text-emerald-400 font-bold uppercase font-mono text-[10px]">Windows/Chrome:</span> Selecciona <span className="text-slate-300 font-medium">"Toda la pantalla"</span> o <span className="text-slate-300 font-medium">"Pestaña de Chrome"</span> y marca la casilla <strong className="text-amber-400 font-bold">"Compartir audio del sistema"</strong> en la esquina inferior izquierda.
              </li>
              <li>
                <span className="text-emerald-400 font-bold uppercase font-mono text-[10px]">macOS:</span> Asegúrate de dar permisos de grabación de pantalla al navegador en las Preferencias del Sistema. Para audio del sistema, se recomienda compartir una <span className="text-slate-300 font-medium">"Pestaña"</span> para capturar su sonido directo.
              </li>
            </ul>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold shrink-0 mt-0.5 border border-emerald-500/20">
            3
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Graba y Controla</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Puedes pausar la grabación en cualquier momento si necesitas un descanso y reanudarla sin perder el hilo. Si detienes la pantalla compartida desde el botón flotante del navegador, la grabación finalizará de forma automática y segura.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold shrink-0 mt-0.5 border border-emerald-500/20">
            4
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Previsualiza y Descarga MP4</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Al finalizar, tendrás un reproductor para revisar la clase grabada al instante. Presiona <strong className="text-emerald-400 uppercase font-bold">"Descargar Clase MP4"</strong> para bajar tu archivo directo en formato <strong className="text-emerald-400 font-mono font-bold">.mp4</strong> de alta calidad.
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 bg-emerald-500/5 rounded border border-emerald-500/10 flex items-start gap-3 mt-4">
        <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-400 leading-normal">
          <strong className="text-emerald-300 font-bold uppercase tracking-wide">Nota del iFrame:</strong> Si experimentas limitaciones para compartir pantalla en este visor integrado de AI Studio, haz clic en el botón de <strong className="text-slate-300">"Abrir en pestaña nueva"</strong> arriba a la derecha. Esto se debe a las políticas de seguridad de los navegadores respecto a la captura de pantalla dentro de un iFrame.
        </p>
      </div>
    </div>
  );
}
