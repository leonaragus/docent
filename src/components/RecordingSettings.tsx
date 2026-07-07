import { Mic, Volume2, Video, Settings, AlertTriangle, Image as ImageIcon, Upload, X } from 'lucide-react';

interface RecordingSettingsProps {
  devices: MediaDeviceInfo[];
  selectedMicId: string;
  setSelectedMicId: (id: string) => void;
  recordMic: boolean;
  setRecordMic: (val: boolean) => void;
  recordSystemAudio: boolean;
  setRecordSystemAudio: (val: boolean) => void;
  micVolume: number;
  setMicVolume: (vol: number) => void;
  systemVolume: number;
  setSystemVolume: (vol: number) => void;
  videoQuality: 'high' | 'standard';
  setVideoQuality: (q: 'high' | 'standard') => void;
  isRecording: boolean;
  systemAudioMissingWarning: boolean;
  requestMicPermission: () => Promise<boolean>;
  profilePhoto: string | null;
  setProfilePhoto: (url: string | null) => void;
}

export function RecordingSettings({
  devices,
  selectedMicId,
  setSelectedMicId,
  recordMic,
  setRecordMic,
  recordSystemAudio,
  setRecordSystemAudio,
  micVolume,
  setMicVolume,
  systemVolume,
  setSystemVolume,
  videoQuality,
  setVideoQuality,
  isRecording,
  systemAudioMissingWarning,
  requestMicPermission,
  profilePhoto,
  setProfilePhoto
}: RecordingSettingsProps) {

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-slate-800 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            CONFIGURACIÓN DE CAPTURA
          </h2>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded">
          WEBRTC CODES
        </span>
      </div>

      {isRecording && (
        <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs text-emerald-300 font-semibold">
            AJUSTES BLOQUEADOS EN GRABACIÓN ACTIVA
          </span>
        </div>
      )}

      <div className="space-y-5">
        {/* Profile Photo PIP */}
        <div className="space-y-3 bg-slate-950 border border-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" /> FOTO DE PERFIL PIP (PRESENTACIÓN)
            </label>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="PIP Profile" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-600" />
                )}
              </div>
              {profilePhoto && (
                <button 
                  onClick={() => setProfilePhoto(null)}
                  disabled={isRecording}
                  className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-400 rounded-full p-0.5 text-white shadow-md disabled:opacity-50"
                  title="Eliminar foto"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 mb-2 leading-tight">Esta imagen se mostrará en lugar de la cámara en vivo cuando compartas pantalla, evitando problemas de rendimiento.</p>
              <label className={`inline-flex items-center gap-2 px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-tight text-slate-300 hover:text-white hover:bg-slate-700 transition-colors ${isRecording ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <Upload className="w-3 h-3" />
                SUBIR FOTO
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoUpload}
                  disabled={isRecording}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Quality Config */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-slate-500" /> CALIDAD DE VÍDEO
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={isRecording}
              onClick={() => setVideoQuality('high')}
              className={`p-2.5 rounded border text-xs font-bold uppercase tracking-tight transition-all duration-200 cursor-pointer ${
                videoQuality === 'high'
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-500/5'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-900/40'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              1080p FHD (60 FPS)
            </button>
            <button
              disabled={isRecording}
              onClick={() => setVideoQuality('standard')}
              className={`p-2.5 rounded border text-xs font-bold uppercase tracking-tight transition-all duration-200 cursor-pointer ${
                videoQuality === 'standard'
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-500/5'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-900/40'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              720p HD (30 FPS)
            </button>
          </div>
        </div>

        {/* Microphone Config */}
        <div className="space-y-3 bg-slate-950 border border-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-slate-500" /> GRABAR MICRÓFONO
            </label>
            <button
              disabled={isRecording}
              onClick={() => setRecordMic(!recordMic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                recordMic ? 'bg-emerald-500' : 'bg-slate-800'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform duration-200 ${
                  recordMic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {recordMic && (
            <div className="space-y-3 pt-1 animate-fadeIn">
              <div className="flex items-center gap-2">
                <select
                  disabled={isRecording}
                  value={selectedMicId}
                  onChange={(e) => setSelectedMicId(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded px-3 py-2.5 outline-none focus:border-emerald-500/60 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {devices.length === 0 ? (
                    <option value="">No se encontraron micrófonos</option>
                  ) : (
                    devices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Micrófono (${device.deviceId.slice(0, 5)})`}
                      </option>
                    ))
                  )}
                </select>
                {devices.length === 0 && (
                  <button
                    disabled={isRecording}
                    onClick={requestMicPermission}
                    className="shrink-0 bg-slate-800 border border-slate-700 hover:bg-slate-700/80 text-slate-300 text-xs font-bold px-3 py-2.5 rounded transition-all cursor-pointer uppercase"
                  >
                    Permitir
                  </button>
                )}
              </div>

              {/* Volume Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase font-bold">
                  <span>Ganancia Micrófono</span>
                  <span className="text-emerald-400">{Math.round(micVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={micVolume}
                  onChange={(e) => setMicVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* System Audio Config */}
        <div className="space-y-3 bg-slate-950 border border-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-slate-500" /> AUDIO DEL SISTEMA
            </label>
            <button
              disabled={isRecording}
              onClick={() => setRecordSystemAudio(!recordSystemAudio)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                recordSystemAudio ? 'bg-emerald-500' : 'bg-slate-800'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform duration-200 ${
                  recordSystemAudio ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {recordSystemAudio && (
            <div className="space-y-3 pt-1">
              {/* Volume Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase font-bold">
                  <span>Ganancia de Vídeos</span>
                  <span className="text-emerald-400">{Math.round(systemVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={systemVolume}
                  onChange={(e) => setSystemVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warning if requested system audio but missing */}
      {systemAudioMissingWarning && recordSystemAudio && (
        <div className="p-3 bg-amber-500/10 rounded border border-amber-500/20 flex gap-2.5 items-start">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs text-amber-300 font-bold leading-normal uppercase tracking-wider">
              Audio del Sistema Ausente
            </p>
            <p className="text-[11px] text-amber-400/80 leading-normal">
              Asegúrate de marcar "Compartir audio del sistema" al seleccionar tu pantalla en el cuadro de diálogo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
