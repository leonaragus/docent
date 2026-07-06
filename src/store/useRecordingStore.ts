import { create } from 'zustand';
import { Recording } from '../types';

interface RecordingStore {
  recordings: Recording[];
  setRecordings: (recs: Recording[]) => void;
  addRecording: (recording: Recording) => void;
  removeRecording: (id: string) => void;
  clearCache: (id: string) => void;
  clearAllCache: () => void;
}

export const useRecordingStore = create<RecordingStore>((set, get) => ({
  recordings: [],
  setRecordings: (recs) => set({ recordings: recs }),
  addRecording: (recording) => 
    set((state) => ({ recordings: [recording, ...state.recordings] })),
  
  removeRecording: (id) => 
    set((state) => {
      const rec = state.recordings.find(r => r.id === id);
      if (rec && rec.url) {
        URL.revokeObjectURL(rec.url);
      }
      return { recordings: state.recordings.filter(r => r.id !== id) };
    }),

  // Clears the heavy blobs from memory without removing the item from the list
  // Useful for keeping history while freeing up RAM
  clearCache: (id) => 
    set((state) => {
      const updated = state.recordings.map(rec => {
        if (rec.id === id) {
          if (rec.url) URL.revokeObjectURL(rec.url);
          return { ...rec, url: '', blob: new Blob() }; // free memory
        }
        return rec;
      });
      return { recordings: updated };
    }),

  clearAllCache: () => 
    set((state) => {
      const updated = state.recordings.map(rec => {
        if (rec.url) URL.revokeObjectURL(rec.url);
        return { ...rec, url: '', blob: new Blob() };
      });
      return { recordings: updated };
    })
}));
