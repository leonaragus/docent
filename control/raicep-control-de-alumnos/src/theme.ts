export type ColorThemeId = 'indigo' | 'emerald' | 'purple';

export interface ColorThemeDefinition {
  id: ColorThemeId;
  name: string;
  description: string;
  primaryBg: string;
  primaryHoverBg: string;
  primaryText: string;
  primaryBorder: string;
  primaryFocusRing: string;
  lightBg: string;
  lightBorder: string;
  lightText: string;
  badgeBg: string;
  badgeText: string;
  gradientFrom: string;
  gradientTo: string;
  selectionBg: string;
  glowBg: string;
  buttonRing: string;
  activeTabBorder: string;
  hoverBgLite: string;
  accentCircle: string;
  shadowColor: string;
  bannerGradient: string;
}

export const COLOR_THEMES: Record<ColorThemeId, ColorThemeDefinition> = {
  indigo: {
    id: 'indigo',
    name: 'Índigo Imperial',
    description: 'Elegancia clásica corporativa con contrastes de azul profundo',
    primaryBg: 'bg-indigo-600',
    primaryHoverBg: 'hover:bg-indigo-700',
    primaryText: 'text-indigo-600',
    primaryBorder: 'border-indigo-600',
    primaryFocusRing: 'focus:ring-indigo-500',
    lightBg: 'bg-indigo-50/50',
    lightBorder: 'border-indigo-100/60',
    lightText: 'text-indigo-700',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    gradientFrom: 'from-indigo-500',
    gradientTo: 'to-indigo-600',
    selectionBg: 'selection:bg-indigo-100',
    glowBg: 'bg-indigo-200/20',
    buttonRing: 'focus:ring-indigo-500',
    activeTabBorder: 'border-indigo-600 text-indigo-600',
    hoverBgLite: 'hover:bg-indigo-50/40',
    accentCircle: 'bg-indigo-600',
    shadowColor: 'shadow-indigo-600/10',
    bannerGradient: 'from-indigo-500 via-indigo-600 to-indigo-700'
  },
  emerald: {
    id: 'emerald',
    name: 'Esmeralda Educativa',
    description: 'Aspecto fresco, moderno y orgánico para portales académicos',
    primaryBg: 'bg-emerald-600',
    primaryHoverBg: 'hover:bg-emerald-700',
    primaryText: 'text-emerald-600',
    primaryBorder: 'border-emerald-600',
    primaryFocusRing: 'focus:ring-emerald-500',
    lightBg: 'bg-emerald-50/50',
    lightBorder: 'border-emerald-100/60',
    lightText: 'text-emerald-700',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-emerald-600',
    selectionBg: 'selection:bg-emerald-100',
    glowBg: 'bg-emerald-200/20',
    buttonRing: 'focus:ring-emerald-500',
    activeTabBorder: 'border-emerald-600 text-emerald-600',
    hoverBgLite: 'hover:bg-emerald-50/40',
    accentCircle: 'bg-emerald-600',
    shadowColor: 'shadow-emerald-600/10',
    bannerGradient: 'from-emerald-500 via-emerald-600 to-emerald-700'
  },
  purple: {
    id: 'purple',
    name: 'Púrpura Prestige',
    description: 'Diseño prémium de alto impacto con sofisticación tecnológica',
    primaryBg: 'bg-purple-600',
    primaryHoverBg: 'hover:bg-purple-700',
    primaryText: 'text-purple-600',
    primaryBorder: 'border-purple-600',
    primaryFocusRing: 'focus:ring-purple-500',
    lightBg: 'bg-purple-50/50',
    lightBorder: 'border-purple-100/60',
    lightText: 'text-purple-700',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-purple-600',
    selectionBg: 'selection:bg-purple-100',
    glowBg: 'bg-purple-200/20',
    buttonRing: 'focus:ring-purple-500',
    activeTabBorder: 'border-purple-600 text-purple-600',
    hoverBgLite: 'hover:bg-purple-50/40',
    accentCircle: 'bg-purple-600',
    shadowColor: 'shadow-purple-600/10',
    bannerGradient: 'from-purple-500 via-purple-600 to-purple-700'
  }
};
