import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseRecorderOptions {
  onStop?: (blob: Blob, url: string) => void;
}

export function useRecorder(options: UseRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>('');
  const [recordMic, setRecordMic] = useState(true);
  const [recordSystemAudio, setRecordSystemAudio] = useState(true);
  const [micVolume, setMicVolume] = useState(1.0);
  const [systemVolume, setSystemVolume] = useState(1.0);
  const [videoQuality, setVideoQuality] = useState<'high' | 'standard'>('high');
  const [systemAudioMissingWarning, setSystemAudioMissingWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  // References to keep track of stream, recorder and AudioContext
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  // Analyser nodes for volume meters
  const [micAnalyser, setMicAnalyser] = useState<AnalyserNode | null>(null);
  const [systemAnalyser, setSystemAnalyser] = useState<AnalyserNode | null>(null);

  // Gain nodes for live volume adjustment during recording
  const micGainNodeRef = useRef<GainNode | null>(null);
  const systemGainNodeRef = useRef<GainNode | null>(null);

  // Live update gain nodes if volumes change
  useEffect(() => {
    if (micGainNodeRef.current) {
      micGainNodeRef.current.gain.value = micVolume;
    }
  }, [micVolume]);

  useEffect(() => {
    if (systemGainNodeRef.current) {
      systemGainNodeRef.current.gain.value = systemVolume;
    }
  }, [systemVolume]);

  // Load available microphone devices
  const loadDevices = useCallback(async () => {
    try {
      // First ensure permissions are loaded
      const devicesList = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devicesList.filter(device => device.kind === 'audioinput');
      setDevices(audioInputs);
      
      // Select default mic if not set
      if (audioInputs.length > 0 && !selectedMicId) {
        setSelectedMicId(audioInputs[0].deviceId);
      }
    } catch (err) {
      console.error('Error listing devices:', err);
    }
  }, [selectedMicId]);

  // Request mic permission to get labels
  const requestMicPermission = useCallback(async () => {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Release immediately
      tempStream.getTracks().forEach(track => track.stop());
      await loadDevices();
      return true;
    } catch (err) {
      console.warn('Microphone permission denied or not available:', err);
      return false;
    }
  }, [loadDevices]);

  // Load devices on mount
  useEffect(() => {
    loadDevices();
    // Watch for device changes
    navigator.mediaDevices.addEventListener('devicechange', loadDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', loadDevices);
    };
  }, [loadDevices]);

  // Clean up recording URL
  useEffect(() => {
    return () => {
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [recordedUrl]);

  // Get optimal mime type for MP4 download
  const getSupportedMimeType = () => {
    const candidates = [
      'video/mp4;codecs=h264,aac',
      'video/mp4;codecs=h264,mp3',
      'video/mp4',
      'video/webm;codecs=h264,aac',
      'video/webm;codecs=h264,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];
    for (const candidate of candidates) {
      if (MediaRecorder.isTypeSupported(candidate)) {
        return candidate;
      }
    }
    return '';
  };

  // Start timer helper
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Stop recording function (can be called internally or externally)
  const stopRecording = useCallback(() => {
    if (!isRecording) return;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    stopTimer();
    setIsRecording(false);
    setIsPaused(false);

    // Stop all media tracks to release camera/microphone/screen capture
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }

    // Close AudioContext
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Clear analysers
    setMicAnalyser(null);
    setSystemAnalyser(null);
  }, [isRecording]);

  // Start recording function
  const startRecording = async () => {
    setError(null);
    setSystemAudioMissingWarning(false);
    chunksRef.current = [];
    setRecordedBlob(null);
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }

    try {
      // 1. Setup video config
      const videoConfig = {
        frameRate: { ideal: videoQuality === 'high' ? 60 : 30, max: 60 },
        width: { ideal: videoQuality === 'high' ? 1920 : 1280 },
        height: { ideal: videoQuality === 'high' ? 1080 : 720 },
      };

      // 2. Request screen stream (with system audio if enabled)
      let screenStream: MediaStream;
      try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: videoConfig,
          audio: recordSystemAudio ? {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          } : false
        });
      } catch (err: any) {
        // If system audio failed, try without it or handle cancel
        if (err.name === 'NotAllowedError') {
          throw new Error('Permiso para compartir pantalla denegado por el usuario.');
        }

        if (recordSystemAudio) {
          try {
            screenStream = await navigator.mediaDevices.getDisplayMedia({
              video: videoConfig,
              audio: false
            });
            setSystemAudioMissingWarning(true);
            setError('Tu navegador o sistema operativo no admite capturar audio del sistema directamente. Grabando solo pantalla.');
          } catch (innerErr) {
            throw new Error('No se pudo compartir la pantalla.');
          }
        } else {
          throw new Error('No se pudo compartir la pantalla.');
        }
      }

      screenStreamRef.current = screenStream;

      // Detect if user stops screen sharing natively
      const videoTrack = screenStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          stopRecording();
        };
      }

      // 3. Request microphone stream if enabled
      let micStream: MediaStream | null = null;
      if (recordMic) {
        try {
          micStream = await navigator.mediaDevices.getUserMedia({
            audio: selectedMicId ? { deviceId: { exact: selectedMicId } } : true
          });
          micStreamRef.current = micStream;
        } catch (err) {
          console.warn('No se pudo acceder al micrófono:', err);
          setError('No se pudo acceder al micrófono. Grabando solo audio de pantalla.');
        }
      }

      // 4. Setup AudioContext and mixing
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      audioContextRef.current = audioCtx;

      // Resume context on user gesture (this code is executed directly on button click)
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const destination = audioCtx.createMediaStreamDestination();
      let hasAnyAudio = false;

      // Connect microphone to destination and analyser
      if (micStream && micStream.getAudioTracks().length > 0) {
        const micSource = audioCtx.createMediaStreamSource(micStream);
        const micGainNode = audioCtx.createGain();
        micGainNode.gain.value = micVolume;
        micGainNodeRef.current = micGainNode;

        const micAnalyserNode = audioCtx.createAnalyser();
        micAnalyserNode.fftSize = 256;

        micSource.connect(micGainNode);
        micGainNode.connect(micAnalyserNode);
        micAnalyserNode.connect(destination);
        
        setMicAnalyser(micAnalyserNode);
        hasAnyAudio = true;
      }

      // Connect screen audio to destination and analyser
      const screenAudioTracks = screenStream.getAudioTracks();
      if (recordSystemAudio && screenAudioTracks.length > 0) {
        const screenAudioStream = new MediaStream([screenAudioTracks[0]]);
        const screenSource = audioCtx.createMediaStreamSource(screenAudioStream);
        const systemGainNode = audioCtx.createGain();
        systemGainNode.gain.value = systemVolume;
        systemGainNodeRef.current = systemGainNode;

        const systemAnalyserNode = audioCtx.createAnalyser();
        systemAnalyserNode.fftSize = 256;

        screenSource.connect(systemGainNode);
        systemGainNode.connect(systemAnalyserNode);
        systemAnalyserNode.connect(destination);

        setSystemAnalyser(systemAnalyserNode);
        hasAnyAudio = true;
        setSystemAudioMissingWarning(false);
      } else if (recordSystemAudio && screenAudioTracks.length === 0) {
        // Requested but missing (user didn't tick the check box)
        setSystemAudioMissingWarning(true);
      }

      // 5. Combine Video Track and Mixed Audio Track
      const tracksToRecord: MediaStreamTrack[] = [videoTrack];
      if (hasAnyAudio && destination.stream.getAudioTracks().length > 0) {
        tracksToRecord.push(destination.stream.getAudioTracks()[0]);
      }

      const recordStream = new MediaStream(tracksToRecord);

      // 6. Set up MediaRecorder
      const mimeType = getSupportedMimeType();
      const recorderOptions: MediaRecorderOptions = {};
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }

      // Set highly crisp video bits
      recorderOptions.videoBitsPerSecond = videoQuality === 'high' ? 5000000 : 2500000; // 5 Mbps or 2.5 Mbps
      recorderOptions.audioBitsPerSecond = 128000; // 128 kbps crisp audio

      const recorder = new MediaRecorder(recordStream, recorderOptions);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalMimeType = recorder.mimeType || 'video/mp4';
        const blob = new Blob(chunksRef.current, { type: finalMimeType });
        const url = URL.createObjectURL(blob);
        
        setRecordedBlob(blob);
        setRecordedUrl(url);

        if (options.onStop) {
          options.onStop(blob, url);
        }
      };

      // Record chunks every 1 second (safer in case of page crashes, preserves data)
      recorder.start(1000);
      setDuration(0);
      startTimer();
      setIsRecording(true);
      setIsPaused(false);

    } catch (err: any) {
      console.error('Error starting recording:', err);
      setError(err.message || 'Error desconocido al iniciar la grabación.');
      
      // Cleanup any stream that might have started
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
      }
      setIsRecording(false);
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
      
      // Pause AudioContext
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.suspend();
      }
    }
  };

  // Resume recording
  const resumeRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      // Resume AudioContext
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    }
  };

  return {
    isRecording,
    isPaused,
    duration,
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
    systemAudioMissingWarning,
    error,
    setError,
    recordedBlob,
    recordedUrl,
    micAnalyser,
    systemAnalyser,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    requestMicPermission
  };
}
