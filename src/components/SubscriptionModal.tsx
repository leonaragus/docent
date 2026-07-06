import React from 'react';
import { CheckCircle2, Sparkles, X } from 'lucide-react';
import { TranslationSet } from '../locales';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationSet;
}

export default function SubscriptionModal({ isOpen, onClose, t }: SubscriptionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(99,102,241,0.2)] overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/10 z-0"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-lg shadow-indigo-500/50">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2">{t.proPlanName}</h2>
            <div className="flex justify-center items-end gap-1 mb-4">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-300">{t.proPlanPrice.split(' ')[0]}</span>
              <span className="text-slate-400 font-medium pb-2">/ {t.proPlanPrice.split('/ ')[1]}</span>
            </div>
            <p className="text-slate-300 mb-8">{t.proPlanDesc}</p>
            
            <div className="space-y-4 text-left">
              {[t.proFeature1, t.proFeature2, t.proFeature3, t.proFeature4, t.proFeature5].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200 text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-10 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all transform hover:scale-[1.02]">
              {t.proSubscribeBtn}
            </button>
            <button onClick={onClose} className="w-full mt-4 py-3 text-slate-400 hover:text-white text-sm font-medium transition-colors">
              {t.proCancelBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
