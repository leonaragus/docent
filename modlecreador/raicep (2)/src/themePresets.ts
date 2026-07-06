import { ThemePreset } from './types';

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'indigo',
    name: 'Royal Indigo (Creativo Digital)',
    primaryColor: 'indigo',
    bgGradient: 'from-indigo-900 to-purple-950',
    secondaryBg: 'bg-indigo-50/40',
    accentBorder: 'border-indigo-100',
    accentText: 'text-indigo-600',
    accentTextHover: 'hover:text-indigo-800',
    accentBg: 'bg-indigo-50',
    primaryButton: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    accentRing: 'focus:ring-indigo-500',
    bannerColor: 'from-indigo-900 to-purple-950'
  },
  {
    id: 'emerald',
    name: 'Emerald Forest (Ecológico y Bio)',
    primaryColor: 'emerald',
    bgGradient: 'from-emerald-900 to-teal-950',
    secondaryBg: 'bg-emerald-50/40',
    accentBorder: 'border-emerald-100',
    accentText: 'text-emerald-750',
    accentTextHover: 'hover:text-emerald-900',
    accentBg: 'bg-emerald-50',
    primaryButton: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    accentRing: 'focus:ring-emerald-500',
    bannerColor: 'from-emerald-900 to-teal-950'
  },
  {
    id: 'amber',
    name: 'Sunset Amber (Emprendedores)',
    primaryColor: 'amber',
    bgGradient: 'from-amber-900 to-orange-950',
    secondaryBg: 'bg-amber-50/40',
    accentBorder: 'border-amber-100',
    accentText: 'text-amber-700',
    accentTextHover: 'hover:text-amber-900',
    accentBg: 'bg-amber-50',
    primaryButton: 'bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold',
    accentRing: 'focus:ring-amber-500',
    bannerColor: 'from-amber-950 to-orange-950'
  },
  {
    id: 'rose',
    name: 'Red Velvet (Moda y Estilo)',
    primaryColor: 'rose',
    bgGradient: 'from-rose-900 to-red-950',
    secondaryBg: 'bg-rose-50/40',
    accentBorder: 'border-rose-100',
    accentText: 'text-rose-700',
    accentTextHover: 'hover:text-rose-900',
    accentBg: 'bg-rose-50',
    primaryButton: 'bg-rose-600 hover:bg-rose-500 text-white',
    accentRing: 'focus:ring-rose-500',
    bannerColor: 'from-rose-950 to-red-950'
  },
  {
    id: 'slate',
    name: 'Minimal Slate (Soberbio e Industrial)',
    primaryColor: 'slate',
    bgGradient: 'from-neutral-900 to-stone-950',
    secondaryBg: 'bg-slate-100/40',
    accentBorder: 'border-slate-200',
    accentText: 'text-slate-800',
    accentTextHover: 'hover:text-black',
    accentBg: 'bg-slate-100',
    primaryButton: 'bg-slate-900 hover:bg-slate-800 text-white',
    accentRing: 'focus:ring-slate-500',
    bannerColor: 'from-neutral-900 to-stone-950'
  },
  {
    id: 'violet',
    name: 'Cosmic Amethyst (Música y Arte)',
    primaryColor: 'violet',
    bgGradient: 'from-violet-900 to-fuchsia-950',
    secondaryBg: 'bg-violet-50/40',
    accentBorder: 'border-violet-100',
    accentText: 'text-violet-700',
    accentTextHover: 'hover:text-violet-950',
    accentBg: 'bg-violet-50',
    primaryButton: 'bg-violet-700 hover:bg-violet-600 text-white',
    accentRing: 'focus:ring-violet-500',
    bannerColor: 'from-violet-950 to-fuchsia-950'
  }
];
