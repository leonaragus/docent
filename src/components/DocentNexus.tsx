import { useLanguage } from '../contexts/LanguageContext';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Loader2,
  Palette,
  FileText,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  Type,
  Download,
  Copy,
  Printer,
  Sparkles,
  RotateCcw,
  Sliders,
  Check,
  Eye,
  Settings,
  HelpCircle,
  FileCode,
  Layers,
  MapPin,
  Mail,
  Globe as GlobeIcon,
  Phone,
  Database,
  Save,
  Trash2,
  CheckCircle2,
  Tv,
  ShieldCheck
} from 'lucide-react';
import { SYSTEM_TEMPLATES } from './nexusTemplates';
import { LogoProps, SavedBrand } from './nexusTypes';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Pre-defined premium color presets/variantes
const COLOR_PRESETS = [
  {
    name: 'Corporativo Imperial',
    colors: ['#1E3A8A', '#3B82F6', '#F59E0B', '#1E293B'], // Primary Blue, Light Blue, Warm Gold, Dark Slate
    vibe: 'Profesional',
    font: 'modern'
  },
  {
    name: 'Ciber Tecno-Futuro',
    colors: ['#0F172A', '#06B6D4', '#22D3EE', '#020617'], // Slate Night, Vivid Cyan, Bright Aqua, Deep Void
    vibe: 'Innovador',
    font: 'tech'
  },
  {
    name: 'Esmeralda Vital',
    colors: ['#064E3B', '#10B981', '#FCD34D', '#0F291E'], // Deep Forest, Emerald, Gold Sun, Sage Charcoal
    vibe: 'Cálido / Orgánico',
    font: 'elegant'
  },
  {
    name: 'Atardecer Creativo',
    colors: ['#431407', '#EA580C', '#FB7185', '#290F0A'], // Rust Chocolate, Vibrant Orange, Rose Pink, Deep Terracotta
    vibe: 'Vibrante',
    font: 'modern'
  },
  {
    name: 'Academia Tradicional',
    colors: ['#4C1D95', '#8B5CF6', '#F59E0B', '#1F1235'], // Classic Purple, Violet, Gold Honey, Rich Blackberry
    vibe: 'Clásico',
    font: 'classic'
  }
];

// WCAG contrast calculators
function getRelativeLuminance(color: string): number {
  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  let rL = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  let gL = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  let bL = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
}

function getContrastRatio(color1: string, color2: string): number {
  let l1 = getRelativeLuminance(color1);
  let l2 = getRelativeLuminance(color2);
  let lighter = Math.max(l1, l2);
  let darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Helper to render customized SVG symbols

function LogoSymbol({ id, symbol, primary: rawPrimary, secondary: rawSecondary, size = 60, className = '', style = 'minimal' }: LogoProps) {
  let primary = rawPrimary;
  let secondary = rawSecondary;

  if (style === 'gradient') {
    primary = 'url(#global-grad-primary)';
    secondary = 'url(#global-grad-secondary)';
  } else if (style === 'engraved') {
    secondary = 'url(#global-pat-engrave)';
  }

  const wrapperFilter = style === 'neon' ? `drop-shadow(0 0 8px ${rawPrimary}) drop-shadow(0 0 2px ${rawSecondary})` : undefined;

  const element = (() => {
    switch (symbol) {
    case 'heraldic_laurel':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Detailed Laurel Wreath background wrapping the shield */}
          {/* Left Branch */}
          <path d="M22 65 C18 60 14 50 16 38 M14 55 C10 46 12 36 17 28 M18 42 C16 32 20 22 28 18 M24 30 C24 20 32 14 40 14" stroke={secondary} strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
          {/* Left Leaves */}
          <path d="M22 65 C20 65 17 60 19 56 C21 52 24 53 24 53 Z" fill={secondary} />
          <path d="M16 50 C13 49 11 44 14 41 C17 38 20 40 20 40 Z" fill={secondary} />
          <path d="M14 36 C11 34 10 29 13 26 C16 23 19 25 19 25 Z" fill={secondary} />
          <path d="M18 24 C16 21 17 16 21 14 C25 12 26 16 26 16 Z" fill={secondary} />
          <path d="M24 16 C23 12 26 8 30 7 C34 6 34 11 34 11 Z" fill={secondary} />
          
          {/* Right Branch */}
          <path d="M78 65 C82 60 86 50 84 38 M86 55 C90 46 88 36 83 28 M82 42 C84 32 80 22 72 18 M76 30 C76 20 68 14 60 14" stroke={secondary} strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
          {/* Right Leaves */}
          <path d="M78 65 C80 65 83 60 81 56 C79 52 76 53 76 53 Z" fill={secondary} />
          <path d="M84 50 C87 49 89 44 86 41 C83 38 80 40 80 40 Z" fill={secondary} />
          <path d="M86 36 C89 34 90 29 87 26 C84 23 81 25 81 25 Z" fill={secondary} />
          <path d="M82 24 C84 21 83 16 79 14 C75 12 74 16 74 16 Z" fill={secondary} />
          <path d="M76 16 C77 12 74 8 70 7 C66 6 66 11 66 11 Z" fill={secondary} />

          {/* Central Heraldic Shield */}
          <path d="M50 14 C32 14 28 22 28 48 C28 72 45 88 50 92 C55 88 72 72 72 48 C72 22 68 14 50 14 Z" fill={primary} />
          <path d="M50 14 C32 14 28 22 28 48 C28 72 45 88 50 92 C55 88 72 72 72 48 C72 22 68 14 50 14 Z" fill="none" stroke={secondary} strokeWidth="3" />
          <path d="M50 18 C35 18 31 25 31 48 C31 69 46 84 50 88 C54 84 69 69 69 48 C69 25 65 18 50 18 Z" fill="none" stroke={secondary} strokeWidth="1" opacity="0.5" />
          
          {/* Majestic Greek Column of Knowledge inside */}
          <path d="M42 74 H58 V77 H42 Z" fill={secondary} />
          <path d="M44 71 H56 V74 H44 Z" fill={secondary} />
          <path d="M46 36 H54 V71 H46 Z" fill={secondary} />
          <line x1="48.5" y1="38" x2="48.5" y2="69" stroke={primary} strokeWidth="1" />
          <line x1="51.5" y1="38" x2="51.5" y2="69" stroke={primary} strokeWidth="1" />
          {/* Column Capital */}
          <path d="M43 31 H57 V36 H43 Z" fill={secondary} />
          <path d="M41 28 C41 28 45 31 50 31 C55 31 59 28 59 28 Z" fill={secondary} />
          
          {/* Shining Wisdom Star above column */}
          <path d="M50 20 L52 24 L56 25 L53 28 L54 32 L50 30 L46 32 L47 28 L44 25 L48 24 Z" fill={secondary} />
        </svg>
      );
    case 'noble_crest':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Baroque filigree scrolls / wings representation */}
          <path d="M12 40 C6 30 14 18 24 24 C18 10 32 8 42 18" stroke={secondary} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <path d="M88 40 C94 30 86 18 76 24 C82 10 68 8 58 18" stroke={secondary} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <path d="M10 50 C4 65 18 75 26 70 M90 50 C96 65 82 75 74 70" stroke={secondary} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />

          {/* Central Royal Shield */}
          <path d="M50 18 L24 24 V52 C24 72 44 88 50 92 C56 88 76 72 76 52 V24 L50 18 Z" fill={primary} />
          <path d="M50 18 L24 24 V52 C24 72 44 88 50 92 C56 88 76 72 76 52 V24 L50 18 Z" fill="none" stroke={secondary} strokeWidth="3.5" strokeLinejoin="round" />
          
          {/* Inner shield border */}
          <path d="M50 23 L28 28 V52 C28 68 45 82 50 86 C55 82 72 68 72 52 V28 L50 23 Z" fill="none" stroke={secondary} strokeWidth="1" opacity="0.4" />

          {/* Dividing cross into 4 Quadrants */}
          <line x1="50" y1="18" x2="50" y2="92" stroke={secondary} strokeWidth="1.5" />
          <line x1="24" y1="50" x2="76" y2="50" stroke={secondary} strokeWidth="1.5" />

          {/* Quadrant 1 (Top Left): Book of Knowledge */}
          <path d="M32 32 C38 30 42 33 42 33 V44 C42 44 38 41 32 43 Z" fill={secondary} />
          <path d="M46 32 C40 32 36 35 36 35 V46 C36 46 40 43 46 43 Z" fill={secondary} className="opacity-80" />

          {/* Quadrant 2 (Top Right): Torch / Flame of Wisdom */}
          <path d="M58 42 L62 34 L66 42 Z" fill={secondary} />
          <path d="M57 32 C60 28 62 26 62 26 C62 26 64 28 67 32 C64 34 60 34 57 32 Z" fill={secondary} />

          {/* Quadrant 3 (Bottom Left): Tower of Strength */}
          <rect x="33" y="60" width="10" height="18" fill={secondary} />
          <path d="M31 57 H45 L42 60 H34 L31 57 Z" fill={secondary} />
          <rect x="36" y="64" width="4" height="6" fill={primary} />

          {/* Quadrant 4 (Bottom Right): Scales of Justice / Integrity */}
          <line x1="56" y1="62" x2="70" y2="62" stroke={secondary} strokeWidth="2" />
          <line x1="63" y1="58" x2="63" y2="76" stroke={secondary} strokeWidth="1.5" />
          <line x1="58" y1="62" x2="58" y2="70" stroke={secondary} strokeWidth="1" />
          <line x1="68" y1="62" x2="68" y2="70" stroke={secondary} strokeWidth="1" />
          <path d="M55 70 H61 L58 73 Z M65 70 H71 L68 73 Z" fill={secondary} />

          {/* Sovereign Top Crown overlay */}
          <path d="M38 12 L41 6 L50 10 L59 6 L62 12 Z" fill={secondary} />
          <circle cx="50" cy="4" r="2.5" fill={secondary} />
          <circle cx="39" cy="6" r="1.5" fill={secondary} />
          <circle cx="61" cy="6" r="1.5" fill={secondary} />
        </svg>
      );
    case 'corporate_nexus':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Intricate concentric circles & grid lines */}
          <circle cx="50" cy="50" r="46" stroke={secondary} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          <circle cx="50" cy="50" r="42" stroke={secondary} strokeWidth="1.5" opacity="0.6" />
          <circle cx="50" cy="50" r="38" stroke={primary} strokeWidth="1" opacity="0.3" />
          
          {/* Multi-angle radial axis */}
          <line x1="50" y1="4" x2="50" y2="96" stroke={secondary} strokeWidth="0.8" opacity="0.25" />
          <line x1="4" y1="50" x2="96" y2="50" stroke={secondary} strokeWidth="0.8" opacity="0.25" />
          <line x1="17.5" y1="17.5" x2="82.5" y2="82.5" stroke={secondary} strokeWidth="0.5" opacity="0.2" />
          <line x1="17.5" y1="82.5" x2="82.5" y2="17.5" stroke={secondary} strokeWidth="0.5" opacity="0.2" />

          {/* Overlapping Triple Intersecting Squares (Forms star-like nexus) */}
          <rect x="22" y="22" width="56" height="56" fill="none" stroke={primary} strokeWidth="3" transform="rotate(0 50 50)" />
          <rect x="22" y="22" width="56" height="56" fill="none" stroke={secondary} strokeWidth="2.2" transform="rotate(30 50 50)" />
          <rect x="22" y="22" width="56" height="56" fill="none" stroke={secondary} strokeWidth="1.5" transform="rotate(60 50 50)" opacity="0.8" />

          {/* Central core gem and orbits */}
          <circle cx="50" cy="50" r="14" fill={primary} />
          <circle cx="50" cy="50" r="14" fill="none" stroke={secondary} strokeWidth="2.5" />
          <circle cx="50" cy="50" r="8" fill="none" stroke={secondary} strokeWidth="1" opacity="0.7" />
          
          {/* Dynamic modern corner nodes */}
          <circle cx="50" cy="8" r="3" fill={secondary} />
          <circle cx="50" cy="92" r="3" fill={secondary} />
          <circle cx="8" cy="50" r="3" fill={secondary} />
          <circle cx="92" cy="50" r="3" fill={secondary} />
          
          {/* Glowing central star overlay */}
          <path d="M50 44 L52 48 L56 50 L52 52 L50 56 L48 52 L44 50 L48 48 Z" fill={secondary} />
        </svg>
      );
    case 'sovereign_seal':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Intricate security rosette frame outer rings */}
          <circle cx="50" cy="50" r="47" stroke={secondary} strokeWidth="1.2" />
          <circle cx="50" cy="50" r="44" stroke={secondary} strokeWidth="2.5" strokeDasharray="1.5 1.5" />
          <circle cx="50" cy="50" r="40" stroke={primary} strokeWidth="4" />
          <circle cx="50" cy="50" r="36" stroke={secondary} strokeWidth="1" opacity="0.5" />

          {/* Intricate Circular Wreath filling the border */}
          <circle cx="50" cy="50" r="30" fill={primary} />
          <circle cx="50" cy="50" r="30" fill="none" stroke={secondary} strokeWidth="2.5" />

          {/* Inner delicate laurel wreath */}
          <path d="M32 50 C32 40, 40 32, 50 32 C60 32, 68 40, 68 50 C68 60, 60 68, 50 68 C40 68, 32 60, 32 50" fill="none" stroke={secondary} strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
          
          {/* Intricate scales of justice with center sword / key */}
          <line x1="38" y1="44" x2="62" y2="44" stroke={secondary} strokeWidth="2" strokeLinecap="round" />
          <line x1="50" y1="36" x2="50" y2="64" stroke={secondary} strokeWidth="2.5" />
          
          {/* Scale plates */}
          <line x1="42" y1="44" x2="38" y2="54" stroke={secondary} strokeWidth="0.8" />
          <line x1="42" y1="44" x2="46" y2="54" stroke={secondary} strokeWidth="0.8" />
          <path d="M36 54 H48" stroke={secondary} strokeWidth="1.5" strokeLinecap="round" />
          
          <line x1="58" y1="44" x2="54" y2="54" stroke={secondary} strokeWidth="0.8" />
          <line x1="58" y1="44" x2="62" y2="54" stroke={secondary} strokeWidth="0.8" />
          <path d="M52 54 H64" stroke={secondary} strokeWidth="1.5" strokeLinecap="round" />

          {/* Key handle / seal decoration below */}
          <circle cx="50" cy="62" r="3.5" fill="none" stroke={secondary} strokeWidth="2" />
          <circle cx="50" cy="36" r="2.5" fill={secondary} />

          {/* Floating security stars */}
          <circle cx="24" cy="50" r="2" fill={secondary} />
          <circle cx="76" cy="50" r="2" fill={secondary} />
          <circle cx="50" cy="24" r="2.5" fill={secondary} />
          <circle cx="50" cy="76" r="2.5" fill={secondary} />
        </svg>
      );
    case 'shield':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 8 L18 18 V46 C18 70 50 92 50 92 C50 92 82 70 82 46 V18 L50 8 Z" fill={primary} />
          <path d="M50 8 V92" stroke={secondary} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
          <path d="M50 14 L24 23 V46 C24 65 50 84 50 84 C50 84 76 65 76 46 V23 L50 14 Z" fill="none" stroke={secondary} strokeWidth="3" />
          <path d="M50 25 L53 34 H63 L55 39 L57 48 L50 43 L43 48 L45 39 L37 34 H47 L50 25 Z" fill={secondary} />
          <line x1="32" y1="52" x2="68" y2="52" stroke={secondary} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="38" y1="59" x2="62" y2="59" stroke={secondary} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="44" y1="66" x2="56" y2="66" stroke={secondary} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'book':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 25 C30 18, 50 28, 50 28 C50 28, 70 18, 88 25 V75 C70 68, 50 78, 50 78 C50 78, 30 68, 12 75 Z" fill={primary} />
          <path d="M50 28 V78" stroke={secondary} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M18 31 C32 26, 45 34, 45 34 V71 C32 65, 18 69, 18 69 Z" fill="none" stroke={secondary} strokeWidth="2.5" />
          <path d="M82 31 C68 26, 55 34, 55 34 V71 C68 65, 82 69, 82 69 Z" fill="none" stroke={secondary} strokeWidth="2.5" />
          <line x1="22" y1="42" x2="40" y2="42" stroke={secondary} strokeWidth="1.5" />
          <line x1="22" y1="49" x2="40" y2="49" stroke={secondary} strokeWidth="1.5" />
          <line x1="22" y1="56" x2="36" y2="56" stroke={secondary} strokeWidth="1.5" />
          <line x1="60" y1="42" x2="78" y2="42" stroke={secondary} strokeWidth="1.5" />
          <line x1="60" y1="49" x2="78" y2="49" stroke={secondary} strokeWidth="1.5" />
          <line x1="64" y1="56" x2="78" y2="56" stroke={secondary} strokeWidth="1.5" />
          <circle cx="50" cy="18" r="4.5" fill={secondary} />
        </svg>
      );
    case 'globe':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="42" fill={primary} />
          <circle cx="50" cy="50" r="34" fill="none" stroke={secondary} strokeWidth="2" />
          <ellipse cx="50" cy="50" rx="34" ry="10" fill="none" stroke={secondary} strokeWidth="1.5" />
          <ellipse cx="50" cy="50" rx="10" ry="34" fill="none" stroke={secondary} strokeWidth="1.5" />
          <circle cx="50" cy="50" r="4" fill={secondary} />
          <path d="M50 8 V92 M8 50 H92" stroke={secondary} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.7" />
          <path d="M21 21 L79 79 M21 79 L79 21" stroke={secondary} strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
        </svg>
      );
    case 'star':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 5 L58 38 L95 50 L58 62 L50 95 L42 62 L5 50 L42 38 Z" fill={primary} />
          <path d="M50 50 L25 25 M50 50 L75 25 M50 50 L75 75 M50 50 L25 75" stroke={secondary} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M50 24 L54 36 H66 L56 42 L60 54 L50 46 L40 54 L44 42 L34 36 H46 Z" fill={secondary} />
          <circle cx="50" cy="50" r="3" fill={secondary} />
          <path d="M50 5 L50 95 M5 50 H95" stroke={secondary} strokeWidth="1" opacity="0.3" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="38" stroke={secondary} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
          <path d="M50 15 C50 34, 34 50, 15 50 C34 50, 50 66, 50 85 C50 66, 66 50, 85 50 C66 50, 50 34, 50 15 Z" fill={primary} />
          <path d="M72 20 C72 29, 64 36, 55 36 C64 36, 72 43, 72 52 C72 43, 80 36, 89 36 C80 36, 72 29, 72 20 Z" fill={secondary} />
          <circle cx="28" cy="28" r="3.5" fill={secondary} />
          <circle cx="24" cy="68" r="4.5" fill={secondary} />
          <circle cx="72" cy="72" r="3" fill={secondary} />
        </svg>
      );
    case 'hexagon':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,6 92,28 92,72 50,94 8,72 8,28" fill={primary} />
          <polygon points="50,14 84,32 84,68 50,86 16,68 16,32" fill="none" stroke={secondary} strokeWidth="2.5" />
          <polygon points="50,22 76,36 76,64 50,78 24,64 24,36" fill="none" stroke={secondary} strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />
          <circle cx="50" cy="50" r="10" fill={secondary} />
          <circle cx="50" cy="14" r="3.5" fill={secondary} />
          <circle cx="50" cy="86" r="3.5" fill={secondary} />
          <circle cx="84" cy="68" r="3.5" fill={secondary} />
          <circle cx="16" cy="32" r="3.5" fill={secondary} />
          <line x1="50" y1="14" x2="50" y2="40" stroke={secondary} strokeWidth="1.5" />
          <line x1="50" y1="60" x2="50" y2="86" stroke={secondary} strokeWidth="1.5" />
        </svg>
      );
    case 'leaf':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="42" stroke={secondary} strokeWidth="2.5" />
          <path d="M78 22 C52 22, 25 38, 20 78 C20 78, 58 82, 78 50 C88 36, 88 22, 78 22 Z" fill={primary} />
          <path d="M20 78 C38 60, 60 45, 78 22" fill="none" stroke={secondary} strokeWidth="4" strokeLinecap="round" />
          <path d="M35 62 C44 54, 56 54, 62 50 M44 50 C52 42, 66 44, 70 40 M55 38 C62 30, 72 32, 76 28" fill="none" stroke={secondary} strokeWidth="2" strokeLinecap="round" />
          <circle cx="78" cy="22" r="3" fill={secondary} />
        </svg>
      );
    case 'flame':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 92 L35 60 H65 Z" fill={primary} stroke={secondary} strokeWidth="2.5" />
          <path d="M50 6 C50 6, 72 30, 62 52 C52 74, 48 52, 48 52 C48 52, 28 38, 38 10 C38 10, 18 32, 32 58 C46 84, 62 84, 62 84 C62 84, 78 58, 50 6 Z" fill={secondary} />
          <path d="M30 60 H70 M35 68 H65 M40 76 H60" stroke={secondary} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="50" cy="38" r="4" fill={primary} />
        </svg>
      );
    case 'crown':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 80 L18 32 L38 56 L50 20 L62 56 L82 32 L86 80 Z" fill={primary} />
          <path d="M14 80 H86 L82 32 L62 56 L50 20 L38 56 L18 32 Z" fill="none" stroke={secondary} strokeWidth="3.5" strokeLinejoin="round" />
          <circle cx="18" cy="27" r="4.5" fill={secondary} />
          <circle cx="50" cy="14" r="5" fill={secondary} />
          <circle cx="82" cy="27" r="4.5" fill={secondary} />
          <circle cx="38" cy="51" r="3" fill={secondary} />
          <circle cx="62" cy="51" r="3" fill={secondary} />
          <rect x="22" y="72" width="56" height="5" rx="2" fill={secondary} />
          <circle cx="50" cy="74.5" r="2" fill={primary} />
        </svg>
      );
    case 'mountain':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="42" stroke={secondary} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <path d="M50 16 L88 80 H12 Z" fill={primary} />
          <path d="M50 16 L56 36 L48 42 L54 55 L42 50 L38 38 L50 16 Z" fill={secondary} />
          <path d="M26 48 L44 80 H8 Z" fill={secondary} opacity="0.4" />
          <path d="M74 48 L92 80 H56 Z" fill={secondary} opacity="0.4" />
          <path d="M50 16 L88 80 H12 Z" fill="none" stroke={secondary} strokeWidth="3.5" strokeLinejoin="round" />
        </svg>
      );
    case 'tower':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M25 88 L34 38 L42 12 H58 L66 38 L75 88 Z" fill={primary} />
          <rect x="36" y="22" width="28" height="6" fill={secondary} />
          <rect x="33" y="46" width="34" height="6" fill={secondary} />
          <rect x="30" y="70" width="40" height="6" fill={secondary} />
          <path d="M49 38 V12 H51 V38 Z" stroke={secondary} strokeWidth="2.5" />
          <circle cx="50" cy="28" r="4" fill={secondary} />
          <path d="M50 12 C40 12, 38 2, 50 2 C62 2, 60 12, 50 12" fill="none" stroke={secondary} strokeWidth="1.5" strokeDasharray="2 1" />
        </svg>
      );
    case 'compass':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="42" fill={primary} />
          <circle cx="50" cy="50" r="34" fill="none" stroke={secondary} strokeWidth="2.5" />
          <path d="M50 15 L57 45 L50 50 L43 45 Z" fill={secondary} />
          <path d="M50 85 L43 55 L50 50 L57 55 Z" fill="none" stroke={secondary} strokeWidth="2" />
          <circle cx="50" cy="50" r="4.5" fill={secondary} />
          <path d="M50 8 V16 M50 84 V92 M8 50 H16 M84 50 H92 M21 21 L27 27 M73 73 L79 79 M21 79 L27 73 M73 21 L79 27" stroke={secondary} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'gear':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="34" fill={primary} />
          <circle cx="50" cy="50" r="16" fill="none" stroke={secondary} strokeWidth="3" />
          <path d="M46 10 H54 V20 H46 Z M46 80 H54 V90 H46 Z M10 46 H20 V54 H10 Z M80 46 H90 V54 H80 Z M22 22 L29 29 L36 22 L29 15 Z M71 71 L78 78 L64 85 L57 78 Z M22 71 L29 64 L36 71 L29 78 Z M71 22 L78 29 L64 15 L57 22 Z" fill={primary} />
          <path d="M44 14 H56 M44 86 H56 M14 44 V56 M86 44 V56" stroke={secondary} strokeWidth="2.5" />
          <circle cx="50" cy="50" r="5" fill={secondary} />
        </svg>
      );
    case 'atom':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="14" fill={primary} />
          <ellipse cx="50" cy="50" rx="42" ry="12" fill="none" stroke={primary} strokeWidth="2" transform="rotate(30 50 50)" />
          <ellipse cx="50" cy="50" rx="42" ry="12" fill="none" stroke={secondary} strokeWidth="2" transform="rotate(90 50 50)" />
          <ellipse cx="50" cy="50" rx="42" ry="12" fill="none" stroke={primary} strokeWidth="2" transform="rotate(150 50 50)" />
          <circle cx="50" cy="50" r="6" fill={secondary} />
          <circle cx="14" cy="29" r="4" fill={secondary} />
          <circle cx="86" cy="71" r="4" fill={secondary} />
          <circle cx="50" cy="8" r="4" fill={secondary} />
          <circle cx="50" cy="92" r="4" fill={secondary} />
        </svg>
      );
    case 'wheat':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="42" stroke={secondary} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <path d="M50 90 V15" stroke={primary} strokeWidth="3" strokeLinecap="round" />
          <path d="M50 72 C40 67, 34 55, 37 45 C41 45, 45 52, 50 62 Z" fill={secondary} />
          <path d="M50 72 C60 67, 66 55, 63 45 C59 45, 55 52, 50 62 Z" fill={secondary} />
          <path d="M50 55 C40 50, 34 38, 37 28 C41 28, 45 35, 50 45 Z" fill={secondary} />
          <path d="M50 55 C60 50, 66 38, 63 28 C59 28, 55 35, 50 45 Z" fill={secondary} />
          <path d="M50 38 C40 33, 34 21, 37 11 C41 11, 45 18, 50 28 Z" fill={secondary} />
          <path d="M50 38 C60 33, 66 21, 63 11 C59 11, 55 18, 50 28 Z" fill={secondary} />
          <circle cx="50" cy="15" r="3" fill={primary} />
        </svg>
      );
    case 'anchor':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="18" r="9" fill="none" stroke={secondary} strokeWidth="3.5" />
          <line x1="50" y1="27" x2="50" y2="78" stroke={primary} strokeWidth="5.5" strokeLinecap="round" />
          <line x1="28" y1="42" x2="72" y2="42" stroke={secondary} strokeWidth="4.5" strokeLinecap="round" />
          <path d="M18 52 C18 76, 82 76, 82 52" fill="none" stroke={primary} strokeWidth="5.5" strokeLinecap="round" />
          <path d="M12 48 L24 52 L18 64 Z M88 48 L76 52 L82 64 Z" fill={secondary} />
          <circle cx="50" cy="78" r="4" fill={secondary} />
        </svg>
      );
    case 'feather':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 85 L32 76 C58 64, 82 38, 86 12 C58 18, 32 42, 22 68 Z" fill={primary} />
          <path d="M15 85 L85 15" stroke={secondary} strokeWidth="3" strokeLinecap="round" />
          <path d="M32 64 L42 67 M42 53 L55 57 M53 42 L68 47 M64 31 L78 37" fill="none" stroke={secondary} strokeWidth="2" strokeLinecap="round" />
          <circle cx="15" cy="85" r="3.5" fill={secondary} />
        </svg>
      );
    case 'scale':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="50" y1="12" x2="50" y2="88" stroke={primary} strokeWidth="4.5" />
          <rect x="32" y="84" width="36" height="5" rx="2.5" fill={primary} />
          <line x1="16" y1="26" x2="84" y2="26" stroke={secondary} strokeWidth="3.5" strokeLinecap="round" />
          <line x1="16" y1="26" x2="6" y2="62" stroke={secondary} strokeWidth="1.5" />
          <line x1="16" y1="26" x2="26" y2="62" stroke={secondary} strokeWidth="1.5" />
          <path d="M4 62 H28" stroke={primary} strokeWidth="4" strokeLinecap="round" />
          <line x1="84" y1="26" x2="74" y2="62" stroke={secondary} strokeWidth="1.5" />
          <line x1="84" y1="26" x2="94" y2="62" stroke={secondary} strokeWidth="1.5" />
          <path d="M72 62 H96" stroke={primary} strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="20" r="3" fill={secondary} />
        </svg>
      );
    case 'heart':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 85 L18 53 C4 39, 11 14, 32 14 C42 14, 48 21, 50 24 C52 21, 58 14, 68 14 C89 14, 96 39, 82 53 Z" fill={primary} />
          <path d="M50 78 L23 51 C12 40, 18 20, 33 20 C41 20, 47 26, 50 30 C53 26, 59 20, 67 20 C82 20, 88 40, 77 51 Z" fill="none" stroke={secondary} strokeWidth="2.5" />
          <path d="M26 48 H36 L42 36 L48 60 L54 44 L60 52 H74" stroke={secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'building':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="14" y="80" width="72" height="8" rx="2" fill={primary} />
          <polygon points="50,10 88,32 12,32" fill={primary} />
          <line x1="16" y1="32" x2="84" y2="32" stroke={secondary} strokeWidth="3" />
          <rect x="22" y="32" width="8" height="48" fill={secondary} />
          <rect x="38" y="32" width="8" height="48" fill={secondary} />
          <rect x="54" y="32" width="8" height="48" fill={secondary} />
          <rect x="70" y="32" width="8" height="48" fill={secondary} />
          <circle cx="50" cy="21" r="3.5" fill={secondary} />
          <line x1="14" y1="88" x2="86" y2="88" stroke={secondary} strokeWidth="2" />
        </svg>
      );
    case 'lightbulb':
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 82 C30 82, 18 64, 18 44 C18 24, 32 8, 50 8 C68 8, 82 24, 82 44 C82 64, 70 82, 50 82 Z" fill={primary} />
          <path d="M34 82 H66 L60 90 H40 Z" fill={secondary} />
          <circle cx="50" cy="44" r="14" fill="none" stroke={secondary} strokeWidth="2.5" />
          <circle cx="50" cy="44" r="6" fill={secondary} />
          <line x1="50" y1="44" x2="50" y2="22" stroke={secondary} strokeWidth="2" />
          <line x1="50" y1="44" x2="50" y2="66" stroke={secondary} strokeWidth="2" />
          <line x1="50" y1="44" x2="72" y2="44" stroke={secondary} strokeWidth="2" />
          <line x1="50" y1="44" x2="28" y2="44" stroke={secondary} strokeWidth="2" />
          <path d="M22 22 L28 28 M78 22 L72 28 M22 66 L28 60 M78 66 L72 60" stroke={secondary} strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} style={{ width: size, height: size }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill={primary} />
          <circle cx="50" cy="50" r="25" fill={secondary} />
        </svg>
      );
  }
  })();

  if (style === 'neon') {
    return (
      <div className="inline-flex items-center justify-center" style={{ filter: wrapperFilter }}>
        {element}
      </div>
    );
  }

  return element;
}

export default function DocentNexus() {
  const { lang } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    institutionName: '',
    vibe: 'Profesional',
    type: 'Educativo',
    font: 'Moderna',
    slogan: 'Excelencia y Compromiso con el Futuro',
    location: 'Sede Central Metropolitana',
    phone: '+54 11 4821-9988',
    email: 'contacto@institucion.edu',
    domain: 'www.institucion.edu'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [branding, setBranding] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');

  // Brand customized states (allows live modification)
  const [activeTab, setActiveTab] = useState<'visual' | 'pdf' | 'variants' | 'mockups' | 'guidelines' | 'database'>('visual');
  const [editorTab, setEditorTab] = useState<'colors' | 'logo' | 'text' | 'pdf'>('colors');
  
  // Premium Studio Features State
  const [mockupModel, setMockupModel] = useState<'plaque' | 'badge'>('plaque');
  const [guillocheDensity, setGuillocheDensity] = useState<number>(30);
  const [guillocheStroke, setGuillocheStroke] = useState<number>(0.5);
  const [guillocheOpacity, setGuillocheOpacity] = useState<number>(0.15);

  // Local Database / Saved Brands state
  const [savedBrands, setSavedBrands] = useState<SavedBrand[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('brand_builder_saved_designs');
    if (stored) {
      try {
        setSavedBrands(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing stored designs:', e);
      }
    }
  }, []);

  const saveCurrentBrandToDb = () => {
    const newDesign: SavedBrand = {
      id: 'brand-' + Date.now(),
      savedAt: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      brandName,
      brandSlogan,
      brandColors,
      brandFont,
      brandSymbol,
      brandLayout,
      pdfHeaderStyle,
      pdfTitle,
      pdfBody,
      pdfHeaderDescription,
      type: formData.type,
      location: formData.location,
      phone: formData.phone,
      email: formData.email,
      domain: formData.domain,
      brandStyle
    };

    const updated = [newDesign, ...savedBrands.filter(b => b.brandName !== brandName)];
    setSavedBrands(updated);
    localStorage.setItem('brand_builder_saved_designs', JSON.stringify(updated));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const deleteBrandFromDb = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedBrands.filter(b => b.id !== id);
    setSavedBrands(updated);
    localStorage.setItem('brand_builder_saved_designs', JSON.stringify(updated));
  };

  const loadBrandFromDb = (brand: SavedBrand) => {
    setBrandName(brand.brandName);
    setBrandSlogan(brand.brandSlogan);
    setBrandColors(brand.brandColors);
    setBrandFont(brand.brandFont);
    setBrandSymbol(brand.brandSymbol);
    setBrandLayout(brand.brandLayout);
    setPdfHeaderStyle(brand.pdfHeaderStyle);
    setPdfTitle(brand.pdfTitle);
    setPdfBody(brand.pdfBody);
    setPdfHeaderDescription(brand.pdfHeaderDescription);
    setBrandStyle(brand.brandStyle as any || 'minimal');
    setFormData({
      institutionName: brand.brandName,
      vibe: 'Guardado Local',
      type: brand.type || 'Educativo',
      font: brand.brandFont === 'classic' ? 'Clásica' : brand.brandFont === 'tech' ? 'Técnica' : 'Moderna',
      slogan: brand.brandSlogan,
      location: brand.location || '',
      phone: brand.phone || '',
      email: brand.email || '',
      domain: brand.domain || ''
    });
    setBranding({
      colors: brand.brandColors,
      font: brand.brandFont,
      pdfHeaderDescription: brand.pdfHeaderDescription,
      isDatabaseLoaded: true
    });
    setActiveTab('visual');
  };

  const loadSystemTemplate = (template: typeof SYSTEM_TEMPLATES[0]) => {
    const mappedBrand: SavedBrand = {
      id: template.id,
      savedAt: '',
      brandName: template.institutionName,
      brandSlogan: template.slogan,
      brandColors: template.colors,
      brandFont: template.font,
      brandSymbol: template.symbol,
      brandLayout: template.layout || 'horizontal',
      pdfHeaderStyle: template.pdfHeaderStyle,
      pdfTitle: template.pdfTitle,
      pdfBody: template.pdfBody,
      pdfHeaderDescription: template.description,
      type: template.category || 'Educativo',
      location: 'Sede Central Metropolitana',
      phone: '+54 11 4821-9988',
      email: 'contacto@institucion.edu',
      domain: 'www.institucion.edu',
      brandStyle: template.brandStyle || 'minimal'
    };
    loadBrandFromDb(mappedBrand);
  };
  
  const [brandName, setBrandName] = useState('');
  const [brandSlogan, setBrandSlogan] = useState('');
  const [brandColors, setBrandColors] = useState<string[]>(['#1E3A8A', '#3B82F6', '#F59E0B', '#1E293B']);
  const [brandFont, setBrandFont] = useState('modern');
  const [brandSymbol, setBrandSymbol] = useState('shield');
  const [brandLayout, setBrandLayout] = useState<'horizontal' | 'vertical' | 'badge' | 'icon'>('horizontal');
  const [brandStyle, setBrandStyle] = useState<'minimal' | 'gradient' | 'neon' | 'engraved'>('minimal');
  const [pdfHeaderStyle, setPdfHeaderStyle] = useState<'banner' | 'clean' | 'traditional'>('banner');
  const [pdfHeaderDescription, setPdfHeaderDescription] = useState('');
  
  // PDF custom content editor state
  const [pdfTitle, setPdfTitle] = useState('DOCUMENTO DE CERTIFICACIÓN OFICIAL');
  const [pdfBody, setPdfBody] = useState(
    'Por la presente se hace constar formalmente que la institución cumple con todos los estándares y normativas vigentes en sus programas y actividades oficiales para el año corriente. Este documento ha sido diseñado en consonancia con la nueva identidad de marca oficial, reflejando solidez, innovación y transparencia ante la comunidad.'
  );

  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Fallback generation helper
  const triggerFallback = (name: string, type: string, vibe: string, fontPref: string) => {
    const normVibe = (vibe || 'Profesional').toLowerCase();
    const normFont = (fontPref || 'Moderna').toLowerCase();
    
    // Set preset colors matching vibe
    let colors = ['#1E3A8A', '#3B82F6', '#F59E0B', '#1F2937'];
    let symbol = 'heraldic_laurel'; // Ultra premium default
    let fontClass = 'modern';

    const nameLower = name.toLowerCase();

    if (normVibe.includes('solemne') || normVibe.includes('clásico') || normVibe.includes('clasico')) {
      colors = ['#4C1D95', '#8B5CF6', '#F59E0B', '#1E1B4B']; // Purple & Gold
      symbol = 'heraldic_laurel';
      fontClass = 'classic';
    } else if (normVibe.includes('moderna') || normVibe.includes('tecn') || normVibe.includes('innovador') || normVibe.includes('técnica')) {
      colors = ['#0F172A', '#06B6D4', '#22D3EE', '#020617']; // Cyber Cyan
      symbol = 'corporate_nexus';
      fontClass = 'tech';
    } else if (normVibe.includes('vibrante') || normVibe.includes('creativa') || normVibe.includes('creativo')) {
      colors = ['#431407', '#EA580C', '#FB7185', '#290F0A']; // Orange Rust
      symbol = 'sparkles';
      fontClass = 'modern';
    } else if (type.toLowerCase().includes('salud') || type.toLowerCase().includes('médica')) {
      colors = ['#064E3B', '#10B981', '#FCD34D', '#0F291E']; // Sage Green
      symbol = 'leaf';
      fontClass = 'elegant';
    }

    if (type.toLowerCase().includes('educativo') || type.toLowerCase().includes('universidad')) {
      symbol = 'noble_crest';
    } else if (nameLower.includes('raicep') || nameLower.includes('registr') || nameLower.includes('homolog')) {
      symbol = 'sovereign_seal';
    }

    const desc = `Un diseño de membrete institucional altamente pulido y solemne para "${name}". Presenta un isotipo vectorizado minimalista de alta definición que representa los valores fundamentales de la organización, acompañado de una cuidada retícula geométrica, fuentes fluidas y una disposición adaptada para comunicados formales, reportes y cartas de presentación.`;

    // Apply values to states
    setBrandName(name);
    setBrandSlogan(formData.slogan);
    setBrandColors(colors);
    setBrandFont(fontClass);
    setBrandSymbol(symbol);
    setBrandLayout('horizontal');
    setBrandStyle('minimal');
    setPdfHeaderStyle('banner');
    setPdfHeaderDescription(desc);
    
    setBranding({
      colors,
      font: fontClass === 'modern' ? 'Outfit' : fontClass === 'classic' ? 'Playfair Display' : 'Space Grotesk',
      pdfHeaderDescription: desc,
      isFallback: true
    });
  };

  const generateBranding = () => {
    if (!formData.institutionName) return;

    setIsLoading(true);
    setError(null);
    setBranding(null);
    setProgressMessage('Iniciando servidores de diseño...');

    const params = new URLSearchParams({
      institutionName: formData.institutionName,
      vibe: formData.vibe,
      type: formData.type,
      font: formData.font,
    });

    // OFFLINE FIRST ENFORCEMENT
    setTimeout(() => {
      triggerFallback(formData.institutionName, formData.type, formData.vibe, formData.font);
      setIsLoading(false);
    }, 1500); // Simulate processing time for UX
  };

  // Switch font class names for CSS
  const getFontFamilyClass = (f: string) => {
    switch (f) {
      case 'classic': return 'font-classic';
      case 'tech': return 'font-display';
      case 'elegant': return 'font-serif';
      default: return 'font-premium';
    }
  };

  const getFontBodyClass = (f: string) => {
    switch (f) {
      case 'classic': return 'font-serif';
      case 'tech': return 'font-mono';
      default: return 'font-sans';
    }
  };

  // Download Logo as SVG
  const downloadLogoSVG = () => {
    const svgElement = document.getElementById('studio-svg-logo');
    if (!svgElement) return;

    // Clone the node so we don't modify the on-screen live DOM
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Create and inject self-contained defs matching the active brand colors and style
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    defs.innerHTML = `
      <linearGradient id="global-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${brandColors[0]}" />
        <stop offset="100%" stop-color="${brandColors[2] || brandColors[1]}" />
      </linearGradient>
      <linearGradient id="global-grad-secondary" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${brandColors[2] || brandColors[1]}" />
        <stop offset="100%" stop-color="${brandColors[0]}" />
      </linearGradient>
      <pattern id="global-pat-engrave" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" stroke="${brandColors[2] || brandColors[1]}" stroke-width="1.2" opacity="0.4" />
      </pattern>
    `;
    clonedSvg.insertBefore(defs, clonedSvg.firstChild);

    // If style is neon, we embed the glow filter directly into the downloaded SVG
    if (brandStyle === 'neon') {
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter.setAttribute('id', 'global-neon-glow');
      filter.setAttribute('x', '-30%');
      filter.setAttribute('y', '-30%');
      filter.setAttribute('width', '160%');
      filter.setAttribute('height', '160%');
      filter.innerHTML = `
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      `;
      defs.appendChild(filter);
      
      // Wrap children of clonedSvg in a g element with the filter, except defs
      const children = Array.from(clonedSvg.childNodes).filter(node => node.nodeName !== 'defs');
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('filter', 'url(#global-neon-glow)');
      children.forEach(child => {
        clonedSvg.removeChild(child);
        g.appendChild(child);
      });
      clonedSvg.appendChild(g);
    }

    const svgString = new XMLSerializer().serializeToString(clonedSvg);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logo-${(brandName || 'brand').toLowerCase().replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy CSS and Palette specs to clipboard
  const handleExportToSuite = () => {
    localStorage.setItem('docent_nexus_brand', JSON.stringify({
      name: brandName,
      colors: brandColors,
      font: brandFont
    }));
    setCopiedColor('suite');
    setTimeout(() => setCopiedColor(null), 3000);
    // Dispath an event so App.tsx can listen and apply
    window.dispatchEvent(new Event('nexus_brand_updated'));
  };
  const copyBrandSpecs = () => {
    const specs = `/* GUÍA DE ESTILO - RAICEP GENERADOR DE MARCA */
/* Institución: ${brandName} */
/* Slogan: ${brandSlogan} */

:root {
  --color-primary: ${brandColors[0]};
  --color-secondary: ${brandColors[1]};
  --color-accent: ${brandColors[2]};
  --color-dark: ${brandColors[3] || '#1E293B'};
  --font-heading: "${brandFont === 'classic' ? 'Playfair Display' : brandFont === 'tech' ? 'Space Grotesk' : 'Outfit'}";
  --font-body: "${brandFont === 'classic' ? 'Lora' : brandFont === 'tech' ? 'JetBrains Mono' : 'Inter'}";
}

/* Membrete PDF: Estilo ${pdfHeaderStyle.toUpperCase()} */
/* Descripción oficial: ${pdfHeaderDescription} */
`;
    navigator.clipboard.writeText(specs);
    setCopiedColor('specs');
    setTimeout(() => setCopiedColor(null), 3000);
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Print PDF document using browser capabilities
  const printDocument = () => {
    window.print();
  };

  // Directly export printable-area element as an official PDF file using html2canvas & jspdf
  const exportPDFDocument = async () => {
    setIsExportingPdf(true);
    try {
      // If the active tab is not 'pdf', we must switch to it first so the '#printable-area' element is mounted in the DOM
      const originalTab = activeTab;
      if (activeTab !== 'pdf') {
        setActiveTab('pdf');
        // Wait for the tab to switch, mount the element, and let initial motion animations complete
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      // Find the element with dynamic retries
      let element = document.getElementById('printable-area');
      if (!element) {
        for (let i = 0; i < 5; i++) {
          await new Promise((resolve) => setTimeout(resolve, 150));
          element = document.getElementById('printable-area');
          if (element) break;
        }
      }

      if (!element) {
        throw new Error('No se encontró el elemento imprimible en el DOM para la exportación.');
      }
      
      // Configure canvas options for maximum fidelity and crispness
      const canvas = await html2canvas(element, {
        scale: 2.2, // Balanced high resolution for quick render and small size
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions: 210mm x 297mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / imgHeight;
      
      // Fit to paper width
      const width = pdfWidth;
      const height = pdfWidth / ratio;
      
      // Top-aligned or centered
      const yOffset = height < pdfHeight ? (pdfHeight - height) / 2 : 0;
      
      pdf.addImage(imgData, 'PNG', 0, yOffset, width, height, undefined, 'FAST');
      
      const filename = `membrete-${(brandName || 'raicep').toLowerCase().replace(/\s+/g, '-') || 'institucional'}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('Error generando el archivo PDF, iniciando impresión de respaldo:', err);
      // Fallback to browser print if rendering fails completely
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Load a complete brand variant instantly
  const applyPresetVariant = (preset: typeof COLOR_PRESETS[0]) => {
    setBrandColors(preset.colors);
    setBrandFont(preset.font);
    
    // Select best symbol match
    let sym = 'shield';
    if (preset.name.includes('Atardecer')) sym = 'sparkles';
    if (preset.name.includes('Esmeralda')) sym = 'leaf';
    if (preset.name.includes('Ciber')) sym = 'hexagon';
    setBrandSymbol(sym);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-indigo-900/300 selection:text-white pb-12 relative overflow-y-auto">
      {/* SVG master defs for branding styles */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
        <defs>
          <linearGradient id="global-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={brandColors[0]} />
            <stop offset="100%" stopColor={brandColors[2] || brandColors[1]} />
          </linearGradient>
          <linearGradient id="global-grad-secondary" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={brandColors[2] || brandColors[1]} />
            <stop offset="100%" stopColor={brandColors[0]} />
          </linearGradient>
          <pattern id="global-pat-engrave" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={brandColors[2] || brandColors[1]} strokeWidth="1.2" opacity="0.4" />
          </pattern>
        </defs>
      </svg>

      {/* Animated Dynamic Cosmic Background with Violet and Fuchsia Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -left-20 w-[420px] h-[420px] rounded-full bg-violet-400/25 blur-[100px]"
        />
        <motion.div 
          animate={{
            x: [0, -70, 50, 0],
            y: [0, 60, -40, 0],
            scale: [1, 0.9, 1.15, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-1/2 -right-20 w-[460px] h-[460px] rounded-full bg-fuchsia-400/20 blur-[110px]"
        />
        <motion.div 
          animate={{
            scale: [0.95, 1.1, 0.95],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-1/4 w-[380px] h-[380px] rounded-full bg-indigo-400/20 blur-[90px]"
        />
        {/* Subtle digital grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf606_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf606_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-100"></div>
      </div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 pt-10 pb-8 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-violet-500 via-indigo-500 to-fuchsia-600 p-2.5 rounded-2xl shadow-lg shadow-violet-500/20">
            <Palette className="text-white w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-violet-700 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent tracking-tight">{lang === 'es' ? 'RAICEP GENERADOR DE MARCA' : 'DOCENT NEXUS BRAND BUILDER'}</h1>
            <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">{lang === 'es' ? 'Registro Argentino de Instituciones y Homologación de Estudios Profesionales' : 'Official Identity & Academic Letterhead Generator'}</p>
          </div>
        </div>
        {branding && (
          <button
            onClick={() => {
              setStep(1);
              setBranding(null);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 hover:bg-indigo-500/20 text-indigo-300 transition text-sm font-semibold shadow-sm"
          >
            <RotateCcw size={16} /> {lang === 'es' ? 'Crear otra marca' : 'Create another brand'}
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 relative z-10">
        {!branding && !isLoading && (
          <div className="max-w-3xl mx-auto">
            {/* Onboarding steps */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 md:p-10 rounded-3xl shadow-xl shadow-indigo-500/10 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-900/300/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Step indicator */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step === 1 ? 'bg-indigo-900/300 text-white shadow-lg shadow-violet-500/30 ring-4 ring-indigo-500/40' : 'bg-emerald-500 text-white'}`}>
                  {step > 1 ? <Check size={16} /> : '1'}
                </div>
                <div className="h-0.5 bg-indigo-900/50 flex-1"></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step === 2 ? 'bg-indigo-900/300 text-white shadow-lg shadow-violet-500/30 ring-4 ring-indigo-500/40' : 'bg-indigo-900/50 text-violet-500'}`}>
                  2
                </div>
              </div>

              {step === 1 ? (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">{lang === 'es' ? 'Comencemos tu Marca' : "Let's Start Your Brand"}</h2>
                    <p className="text-slate-400 text-sm mt-1">{lang === 'es' ? 'Introduce el nombre oficial de la institución que representas.' : 'Enter the official name of the institution you represent.'}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{lang === 'es' ? 'Nombre de la Institución' : 'Institution Name'}</label>
                      <input
                        type="text"
                        value={formData.institutionName}
                        onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                        className="w-full bg-slate-950/80 border-2 border-slate-800 rounded-2xl px-5 py-4 text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/30 transition text-lg font-medium placeholder:text-slate-450"
                        placeholder={lang === 'es' ? 'ej. Colegio Máximo San Martín, Universidad Tecnológica...' : 'e.g. Maximo San Martin High School, Technological University...'}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{lang === 'es' ? 'Eslogan o Lema Institucional (Opcional)' : 'Institutional Slogan or Motto (Optional)'}</label>
                      <input
                        type="text"
                        value={formData.slogan}
                        onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                        className="w-full bg-slate-950/80 border-2 border-slate-800 rounded-2xl px-5 py-3.5 text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/30 transition text-sm placeholder:text-slate-450"
                        placeholder={lang === 'es' ? 'ej. Formando Líderes para el Mañana' : 'e.g. Training Leaders for Tomorrow'}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.institutionName.trim()}
                    className="w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-fuchsia-600 text-white py-4.5 rounded-2xl font-bold hover:from-violet-600 hover:via-indigo-600 hover:to-fuchsia-700 transition flex items-center justify-center gap-2 shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 disabled:opacity-50 disabled:pointer-events-none text-base"
                  >
                    {lang === 'es' ? 'Definir Estilo & Preferencias' : 'Define Style & Preferences'} <ChevronRight size={18} />
                  </button>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">{lang === 'es' ? 'Estilo y Categoría' : 'Style & Category'}</h2>
                    <p className="text-slate-400 text-sm mt-1">{lang === 'es' ? 'Define el sector y el tono visual que se adaptarán a tu membrete.' : 'Define the sector and visual tone that will adapt to your letterhead.'}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">{lang === 'es' ? 'Tipo de Institución' : 'Institution Type'}</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-4 py-3.5 text-slate-100 focus:outline-none focus:border-indigo-400 transition font-medium"
                      >
                        <option value="Educativo">{lang === 'es' ? 'Educativo (Colegio, Universidad)' : 'Educational (School, University)'}</option>
                        <option value="Corporativo">{lang === 'es' ? 'Corporativo (Empresa, Oficina)' : 'Corporate (Business, Office)'}</option>
                        <option value="Salud">{lang === 'es' ? 'Salud (Clínica, Sanatorio)' : 'Health (Clinic, Sanitarium)'}</option>
                        <option value="Tecnológico">{lang === 'es' ? 'Tecnológico (Laboratorio, Desarrollo)' : 'Technology (Laboratory, Dev)'}</option>
                        <option value="Creativo">{lang === 'es' ? 'Creativo (Agencia, Fundación)' : 'Creative (Agency, Foundation)'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">{lang === 'es' ? 'Estilo Visual (Vibe)' : 'Visual Style (Vibe)'}</label>
                      <select
                        value={formData.vibe}
                        onChange={(e) => setFormData({ ...formData, vibe: e.target.value })}
                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-4 py-3.5 text-slate-100 focus:outline-none focus:border-indigo-400 transition font-medium"
                      >
                        <option value="Solemne / Académico">{lang === 'es' ? 'Solemne / Académico' : 'Solemn / Academic'}</option>
                        <option value="Moderna / Tecnológica">{lang === 'es' ? 'Moderna / Tecnológica' : 'Modern / Technical'}</option>
                        <option value="Mínimal Organico">{lang === 'es' ? 'Mínimal Orgánico' : 'Minimal Organic'}</option>
                        <option value="Vibrante / Creativa">{lang === 'es' ? 'Vibrante / Creativa' : 'Vibrant / Creative'}</option>
                        <option value="Clásica Corporativa">{lang === 'es' ? 'Clásica Corporativa' : 'Classic Corporate'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">{lang === 'es' ? 'Tipografía Preferida' : 'Preferred Typography'}</label>
                      <select
                        value={formData.font}
                        onChange={(e) => setFormData({ ...formData, font: e.target.value })}
                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-4 py-3.5 text-slate-100 focus:outline-none focus:border-indigo-400 transition font-medium"
                      >
                        <option value="Moderna">{lang === 'es' ? 'Moderna (Outfit / Sans)' : 'Modern (Outfit / Sans)'}</option>
                        <option value="Clásica">{lang === 'es' ? 'Clásica (Playfair / Serif)' : 'Classic (Playfair / Serif)'}</option>
                        <option value="Técnica">{lang === 'es' ? 'Técnica (Space / Mono)' : 'Technical (Space / Mono)'}</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">{lang === 'es' ? 'Teléfono' : 'Phone'}</label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-400 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">{lang === 'es' ? 'Web / Dominio' : 'Web / Domain'}</label>
                        <input
                          type="text"
                          value={formData.domain}
                          onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                          className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-400 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="w-1/3 bg-slate-800 border border-slate-700 hover:bg-slate-700/80 text-indigo-300 py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2"
                    >
                      <ChevronLeft size={18} /> {lang === 'es' ? 'Atrás' : 'Back'}
                    </button>
                    <button
                      onClick={generateBranding}
                      className="w-2/3 bg-gradient-to-r from-violet-500 via-indigo-500 to-fuchsia-600 text-white py-4 rounded-2xl font-bold hover:from-violet-600 hover:via-indigo-600 hover:to-fuchsia-700 transition flex items-center justify-center gap-2 shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40"
                    >
                      {lang === 'es' ? 'Generar Identidad de Marca' : 'Generate Brand Identity'} <Sparkles size={18} />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Loading overlay with progressive updates */}
        {isLoading && (
          <div className="max-w-2xl mx-auto py-16">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-xl shadow-indigo-500/10 backdrop-blur-xl relative overflow-hidden">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-violet-150 border-t-violet-500 animate-spin"></div>
                <Palette className="absolute inset-0 m-auto text-violet-500 animate-pulse" size={24} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-100 mb-2">{lang === 'es' ? 'Diseñando Identidad Institucional' : 'Designing Institutional Identity'}</h3>
              <p className="text-indigo-400 text-sm font-semibold bg-indigo-900/30 border border-slate-800 px-4 py-2 rounded-full animate-pulse">
                {progressMessage || (lang === 'es' ? 'Creando composiciones vectoriales...' : 'Creating vector compositions...')}
              </p>
              
              <div className="w-full max-w-sm bg-slate-800 h-2.5 rounded-full mt-6 overflow-hidden relative border border-slate-700/50">
                <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full animate-infinite-loading w-1/3"></div>
              </div>
              <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-xs">
                {lang === 'es' ? 'Analizando tipografías y coordinando colores corporativos adecuados para documentos oficiales y banners.' : 'Analyzing typographies and coordinating suitable corporate colors for official documents and banners.'}
              </p>
            </div>
          </div>
        )}

        {/* Active Studio Workspace */}
        {branding && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUMN 1: Customizer Panels (Left, 4 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl shadow-xl shadow-indigo-500/10 overflow-hidden backdrop-blur-md">
                
                {/* Customizer Tabs */}
                <div className="flex bg-slate-950 border-b border-slate-800 p-1.5 gap-1">
                  <button
                    onClick={() => setEditorTab('colors')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition-all ${editorTab === 'colors' ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-lg' : 'text-slate-400 hover:bg-indigo-900/30 hover:text-indigo-300'}`}
                  >
                    <Palette size={14} /> {lang === 'es' ? 'Colores' : 'Colors'}
                  </button>
                  <button
                    onClick={() => setEditorTab('logo')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition-all ${editorTab === 'logo' ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-lg' : 'text-slate-400 hover:bg-indigo-900/30 hover:text-indigo-300'}`}
                  >
                    <Sliders size={14} /> {lang === 'es' ? 'Logo' : 'Logo'}
                  </button>
                  <button
                    onClick={() => setEditorTab('text')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition-all ${editorTab === 'text' ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-lg' : 'text-slate-400 hover:bg-indigo-900/30 hover:text-indigo-300'}`}
                  >
                    <Type size={14} /> {lang === 'es' ? 'Textos' : 'Texts'}
                  </button>
                  <button
                    onClick={() => setEditorTab('pdf')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition-all ${editorTab === 'pdf' ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-lg' : 'text-slate-400 hover:bg-indigo-900/30 hover:text-indigo-300'}`}
                  >
                    <FileText size={14} /> Membrete
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* EDIT TAB: COLORS */}
                  {editorTab === 'colors' && (
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-1">{lang === 'es' ? 'Paleta de Colores' : 'Color Palette'}</h4>
                        <p className="text-xs text-slate-400">{lang === 'es' ? 'Modifica los colores corporativos exactos para tu membrete y logo.' : 'Modify the exact corporate colors for your letterhead and logo.'}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">{lang === 'es' ? 'Primario' : 'Primary'}</span>
                              <span className="text-xs font-mono font-bold text-slate-200">{brandColors[0]}</span>
                            </div>
                            <input
                              type="color"
                              value={brandColors[0]}
                              onChange={(e) => {
                                const c = [...brandColors];
                                c[0] = e.target.value;
                                setBrandColors(c);
                              }}
                              className="w-10 h-10 rounded-xl cursor-pointer border-2 border-slate-700 bg-transparent overflow-hidden"
                            />
                          </div>

                          <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">{lang === 'es' ? 'Secundario' : 'Secondary'}</span>
                              <span className="text-xs font-mono font-bold text-slate-200">{brandColors[1]}</span>
                            </div>
                            <input
                              type="color"
                              value={brandColors[1]}
                              onChange={(e) => {
                                const c = [...brandColors];
                                c[1] = e.target.value;
                                setBrandColors(c);
                              }}
                              className="w-10 h-10 rounded-xl cursor-pointer border-2 border-slate-700 bg-transparent overflow-hidden"
                            />
                          </div>

                          <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">{lang === 'es' ? 'Acento' : 'Accent'}</span>
                              <span className="text-xs font-mono font-bold text-slate-200">{brandColors[2]}</span>
                            </div>
                            <input
                              type="color"
                              value={brandColors[2]}
                              onChange={(e) => {
                                const c = [...brandColors];
                                c[2] = e.target.value;
                                setBrandColors(c);
                              }}
                              className="w-10 h-10 rounded-xl cursor-pointer border-2 border-slate-700 bg-transparent overflow-hidden"
                            />
                          </div>

                          <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">{lang === 'es' ? 'Oscuro' : 'Dark'}</span>
                              <span className="text-xs font-mono font-bold text-slate-200">{brandColors[3] || '#1E293B'}</span>
                            </div>
                            <input
                              type="color"
                              value={brandColors[3] || '#1E293B'}
                              onChange={(e) => {
                                const c = [...brandColors];
                                c[3] = e.target.value;
                                setBrandColors(c);
                              }}
                              className="w-10 h-10 rounded-xl cursor-pointer border-2 border-slate-700 bg-transparent overflow-hidden"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{lang === 'es' ? 'Ajustar Tipografía General' : 'Adjust General Typography'}</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setBrandFont('modern')}
                              className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${brandFont === 'modern' ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-500/10' : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'}`}
                            >
                              Sans-Serif (Outfit)
                            </button>
                            <button
                              onClick={() => setBrandFont('classic')}
                              className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${brandFont === 'classic' ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-500/10' : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'}`}
                            >
                              Serif Tradicional
                            </button>
                            <button
                              onClick={() => setBrandFont('tech')}
                              className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${brandFont === 'tech' ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-500/10' : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'}`}
                            >
                              Sleek Display / Mono
                            </button>
                            <button
                              onClick={() => setBrandFont('elegant')}
                              className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${brandFont === 'elegant' ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-500/10' : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'}`}
                            >
                              Elegant Lora
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EDIT TAB: LOGO */}
                  {editorTab === 'logo' && (
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-1">{lang === 'es' ? 'Estructura del Logotipo' : 'Logo Structure'}</h4>
                        <p className="text-xs text-slate-400">{lang === 'es' ? 'Selecciona el símbolo vectorizado y la disposición del texto.' : 'Select the vectorized symbol and the layout of the text.'}</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">{lang === 'es' ? 'Símbolo Iconográfico (25 Variantes Vectoriales)' : 'Iconic Symbol (25 Vector Variants)'}</label>
                          <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1.5 custom-scrollbar">
                            {[
                              { id: 'heraldic_laurel', label: '✨ Laurel Élite' },
                              { id: 'noble_crest', label: '✨ Blasón Noble' },
                              { id: 'corporate_nexus', label: '✨ Nexo Federal' },
                              { id: 'sovereign_seal', label: '✨ Sello Soberano' },
                              { id: 'shield', label: 'Escudo' },
                              { id: 'book', label: 'Libro' },
                              { id: 'globe', label: 'Globo' },
                              { id: 'star', label: 'Estrella' },
                              { id: 'sparkles', label: 'Destello' },
                              { id: 'hexagon', label: 'Hexágono' },
                              { id: 'leaf', label: 'Hoja' },
                              { id: 'flame', label: 'Antorcha' },
                              { id: 'crown', label: 'Corona' },
                              { id: 'mountain', label: 'Montaña' },
                              { id: 'tower', label: 'Torre' },
                              { id: 'compass', label: 'Brújula' },
                              { id: 'gear', label: 'Engranaje' },
                              { id: 'atom', label: 'Átomo' },
                              { id: 'wheat', label: 'Trigo' },
                              { id: 'anchor', label: 'Ancla' },
                              { id: 'feather', label: 'Pluma' },
                              { id: 'scale', label: 'Balanza' },
                              { id: 'heart', label: 'Corazón' },
                              { id: 'building', label: 'Edificio' },
                              { id: 'lightbulb', label: 'Foco' }
                            ].map((sym) => (
                              <button
                                key={sym.id}
                                onClick={() => setBrandSymbol(sym.id)}
                                className={`p-2 py-3 rounded-xl border transition flex flex-col items-center justify-between min-h-[64px] gap-1 ${brandSymbol === sym.id ? 'bg-indigo-900/50 border-indigo-500 text-indigo-300 shadow-sm font-bold' : 'bg-slate-950 border-slate-800/50 hover:border-slate-700 text-slate-300'}`}
                              >
                                <LogoSymbol symbol={sym.id} primary={brandColors[0]} secondary={brandColors[2]} size={20} />
                                <span className="text-[8px] font-bold tracking-tight text-center truncate w-full">{sym.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{lang === 'es' ? 'Estructura del Logo' : 'Logo Layout'}</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'horizontal', label: 'Logo Horizontal' },
                              { id: 'vertical', label: 'Logo Vertical' },
                              { id: 'badge', label: 'Emblema / Sello' },
                              { id: 'icon', label: 'Isotipo Solo' }
                            ].map((layout) => (
                              <button
                                key={layout.id}
                                onClick={() => setBrandLayout(layout.id as any)}
                                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${brandLayout === layout.id ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-500/10' : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'}`}
                              >
                                {layout.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{lang === 'es' ? 'Acabado y Personalidad del Isotipo (Muy Moderno)' : 'Finish and Isotype Style'}</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'minimal', label: 'Mínimal Puro' },
                              { id: 'gradient', label: 'Gradiente Líquido' },
                              { id: 'neon', label: 'Efecto Neón Glow' },
                              { id: 'engraved', label: 'Grabado Texturado' }
                            ].map((styleOpt) => (
                              <button
                                key={styleOpt.id}
                                onClick={() => setBrandStyle(styleOpt.id as any)}
                                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition ${brandStyle === styleOpt.id ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 border-transparent text-white shadow-md' : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'}`}
                              >
                                {styleOpt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EDIT TAB: TEXTS */}
                  {editorTab === 'text' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-1">{lang === 'es' ? 'Información Textual' : 'Textual Information'}</h4>
                        <p className="text-xs text-slate-400">{lang === 'es' ? 'Edita los textos de contacto e institucionales de manera dinámica.' : 'Edit contact and institutional text details dynamically.'}</p>
                      </div>

                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre de la Institución</label>
                          <input
                            type="text"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{lang === 'es' ? 'Eslogan / Lema' : 'Slogan / Motto'}</label>
                          <input
                            type="text"
                            value={brandSlogan}
                            onChange={(e) => setBrandSlogan(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-400"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{lang === 'es' ? 'Ubicación' : 'Location'}</label>
                            <input
                              type="text"
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                            <input
                              type="text"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EDIT TAB: LETTERHEAD */}
                  {editorTab === 'pdf' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-1">{lang === 'es' ? 'Formato de Membrete PDF' : 'Letterhead PDF Format'}</h4>
                        <p className="text-xs text-slate-400">{lang === 'es' ? 'Personaliza la maqueta del documento real para impresión.' : 'Customize the actual printable letterhead document mockup.'}</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{lang === 'es' ? 'Estilo de Encabezado' : 'Header Style'}</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'banner', label: 'Efecto Flyer' },
                              { id: 'clean', label: 'Mínimal' },
                              { id: 'traditional', label: 'Solemne' }
                            ].map((style) => (
                              <button
                                key={style.id}
                                onClick={() => setPdfHeaderStyle(style.id as any)}
                                className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition ${pdfHeaderStyle === style.id ? 'bg-violet-600 border-violet-600 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'}`}
                              >
                                {style.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{lang === 'es' ? 'Título del Documento' : 'Document Title'}</label>
                          <input
                            type="text"
                            value={pdfTitle}
                            onChange={(e) => setPdfTitle(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{lang === 'es' ? 'Cuerpo del Documento' : 'Document Body'}</label>
                          <textarea
                            value={pdfBody}
                            onChange={(e) => setPdfBody(e.target.value)}
                            rows={4}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none resize-none leading-relaxed focus:border-indigo-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Toolbar actions */}
                <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-wrap gap-2">
                  <button
                    onClick={saveCurrentBrandToDb}
                    className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white py-3 px-3 rounded-xl text-xs font-bold hover:from-violet-600 hover:to-fuchsia-700 transition flex items-center justify-center gap-1.5 shadow-lg shadow-violet-500/20"
                  >
                    {saveSuccess ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Save size={14} />} 
                    {saveSuccess ? '¡Guardado en tu Base de Datos!' : 'Guardar Marca en mi Base de Datos'}
                  </button>
                  <button
                    onClick={downloadLogoSVG}
                    className="flex-1 min-w-[120px] bg-emerald-600 text-white py-2.5 px-3 rounded-xl text-xs font-bold hover:bg-emerald-500 transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20"
                  >
                    <Download size={14} /> Descargar SVG
                  </button>
                  <button
                    onClick={copyBrandSpecs}
                    className="flex-1 min-w-[120px] bg-indigo-900/30 border border-slate-800 text-indigo-300 py-2.5 px-3 rounded-xl text-xs font-bold hover:bg-indigo-900/50/70 transition flex items-center justify-center gap-1.5"
                  >
                    {copiedColor === 'specs' ? <Check size={14} /> : <Copy size={14} />} 
                    {copiedColor === 'specs' ? '¡Copiado!' : 'Copiar CSS'}
                  </button>

                  <div className="w-full pt-2 border-t border-slate-100 space-y-2">
                    <button
                      onClick={exportPDFDocument}
                      disabled={isExportingPdf}
                      className={`w-full ${isExportingPdf ? 'bg-slate-400' : 'bg-red-600 hover:bg-red-550'} text-white py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md shadow-red-950/10 cursor-pointer hover:scale-[1.01]`}
                    >
                      {isExportingPdf ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Generando Membrete PDF...
                        </>
                      ) : (
                        <>
                          <FileText size={14} /> Descargar Membrete PDF Oficial
                        </>
                      )}
                    </button>
                    <button
                      onClick={printDocument}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Printer size={14} /> Imprimir / Guardar como PDF (Alternativa)
                    </button>
                  </div>
                </div>
              </div>

              {/* Informational Guidelines Card */}
              <div className="bg-slate-900/50/60 border border-slate-800/80 rounded-3xl p-5 text-xs text-slate-300 space-y-3 shadow-sm shadow-violet-100/20">
                <h5 className="font-bold text-slate-100 flex items-center gap-1.5"><HelpCircle size={14} /> Guía Práctica</h5>
                <p className="leading-relaxed">
                  Para guardar el membrete en formato PDF oficial, presione <strong>Imprimir / PDF</strong>, y en la ventana del navegador seleccione <strong>"Guardar como PDF"</strong> en la sección de destino.
                </p>
                <div className="bg-indigo-900/30/50 p-3 rounded-xl border border-slate-800/80">
                  <span className="font-bold text-slate-100 block mb-1">Consejo Pro:</span>
                  Asegúrese de activar la opción <strong>"Gráficos de fondo"</strong> en los ajustes de impresión para visualizar el fondo completo del flyer o banner de encabezado.
                </div>
              </div>
            </div>

            {/* COLUMN 2: Workspace & Interactive Canvas Preview (Right, 7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Workspace Navigation Header */}
              <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1 flex-wrap md:flex-nowrap">
                <button
                  onClick={() => setActiveTab('visual')}
                  className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'visual' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-300 hover:bg-indigo-900/30/50'}`}
                >
                  <Eye size={13} /> {lang === 'es' ? 'Manual de Identidad' : 'Brand Identity Manual'}
                </button>
                <button
                  onClick={() => setActiveTab('pdf')}
                  className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'pdf' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-300 hover:bg-indigo-900/30/50'}`}
                >
                  <FileText size={13} /> {lang === 'es' ? 'Membrete PDF' : 'Letterhead PDF'}
                </button>
                <button
                  onClick={() => setActiveTab('variants')}
                  className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'variants' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-300 hover:bg-indigo-900/30/50'}`}
                >
                  <Layers size={13} /> {lang === 'es' ? 'Variantes' : 'Variants'}
                </button>
                <button
                  onClick={() => setActiveTab('mockups')}
                  className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'mockups' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-300 hover:bg-indigo-900/30/50'}`}
                >
                  <Tv size={13} /> {lang === 'es' ? 'Maquetas' : 'Mockups'}
                </button>
                <button
                  onClick={() => setActiveTab('guidelines')}
                  className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'guidelines' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-300 hover:bg-indigo-900/30/50'}`}
                >
                  <ShieldCheck size={13} /> {lang === 'es' ? 'Guías Oficiales' : 'Official Guidelines'}
                </button>
                <button
                  onClick={() => setActiveTab('database')}
                  className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'database' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-300 hover:bg-indigo-900/30/50'}`}
                >
                  <Database size={13} /> {lang === 'es' ? 'Base de Datos' : 'Saved Library'}
                </button>
              </div>

              {/* Dynamic Workspace Rendering */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 min-h-[500px] shadow-xl shadow-violet-100/10">
                
                {/* TAB 1: BRAND BOOK & LOGOS PREVIEW */}
                {activeTab === 'visual' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    
                    {/* Primary Logo Showcase Card */}
                    <div className="bg-slate-950/55 border border-slate-800/50 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-2 left-2 text-[10px] font-bold text-indigo-400 bg-indigo-900/50 px-2 py-1 rounded">LOGOTIPO OFICIAL</div>
                      
                      {/* Flex/Grid Logo layout depending on user selection */}
                      <div className="py-12 flex flex-col items-center justify-center">
                        <div className={`flex ${brandLayout === 'vertical' ? 'flex-col' : brandLayout === 'badge' ? 'flex-col border-4 border-dashed border-indigo-400/20 rounded-full p-10 aspect-square justify-center' : 'flex-row'} items-center gap-5 justify-center text-center`}>
                          
                          {/* SVG Wrapper for download reference */}
                          <div id="logo-svg-container" className="flex items-center justify-center">
                            <LogoSymbol
                                id="studio-svg-logo"
                                symbol={brandSymbol}
                                primary={brandColors[0]}
                                secondary={brandColors[2]}
                                size={brandLayout === 'badge' ? 70 : 85}
                                style={brandStyle}
                            />
                          </div>

                          {brandLayout !== 'icon' && (
                            <div className={`${brandLayout === 'vertical' || brandLayout === 'badge' ? 'text-center' : 'text-left'}`}>
                              <h3 className={`text-3xl font-extrabold tracking-tight text-slate-850 ${getFontFamilyClass(brandFont)} leading-none`}>
                                {brandName || 'Institución'}
                              </h3>
                              {brandSlogan && (
                                <p className="text-sm font-bold text-slate-400 mt-1.5 uppercase tracking-widest text-[10px]">
                                  {brandSlogan}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Branding Variations / Applications */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Monochrome and Negative Version */}
                      <div className="bg-slate-950 border border-slate-800/60 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Aplicaciones Monocromáticas</span>
                        <div className="grid grid-cols-2 gap-3">
                          {/* Positive */}
                          <div className="bg-slate-900/50 p-4 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                            <LogoSymbol symbol={brandSymbol} primary="#000000" secondary="#555555" size={40} />
                          </div>
                          {/* Negative */}
                          <div className="bg-slate-900 p-4 rounded-xl flex items-center justify-center border border-slate-950 shadow-sm">
                            <LogoSymbol symbol={brandSymbol} primary="#FFFFFF" secondary="#CCCCCC" size={40} />
                          </div>
                        </div>
                      </div>

                      {/* Color Palette Display */}
                      <div className="bg-slate-950 border border-slate-800/60 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Colores y Códigos Hex</span>
                        <div className="grid grid-cols-4 gap-2">
                          {brandColors.map((color, i) => (
                            <button
                              key={color + i}
                              onClick={() => {
                                navigator.clipboard.writeText(color);
                                setCopiedColor(color);
                                setTimeout(() => setCopiedColor(null), 1500);
                              }}
                              className="group flex flex-col items-center gap-1.5 focus:outline-none"
                            >
                              <div className="w-full h-11 rounded-xl shadow-inner border border-slate-800 relative overflow-hidden transition group-hover:scale-105" style={{ backgroundColor: color }}>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                  <Copy size={12} className="text-white" />
                                </div>
                              </div>
                              <span className="text-[9px] font-mono font-bold text-slate-300">{copiedColor === color ? '¡Ok!' : color}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Brand details metadata */}
                    <div className="bg-indigo-900/30/50 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2"><FileText size={16} className="text-indigo-400" /> Manual y Concepto del Diseño</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {pdfHeaderDescription}
                      </p>
                    </div>

                  </motion.div>
                )}

                {/* TAB 2: PDF LETTERHEAD & FLYER SHEET PREVIEW */}
                {activeTab === 'pdf' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    
                    {/* Simulated A4/Letter Paper Container */}
                    <div
                      id="printable-area"
                      ref={printAreaRef}
                      className="bg-slate-900/50 text-slate-900 rounded-2xl shadow-2xl p-8 md:p-12 relative overflow-hidden mx-auto max-w-[620px] min-h-[750px] border border-slate-200"
                    >
                      {/* Layout A: Banner Flyer Header Style */}
                      {pdfHeaderStyle === 'banner' && (
                        <div className="relative -mx-8 -mt-8 md:-mx-12 md:-mt-12 h-36 flex items-center px-8 md:px-12 relative mb-10 overflow-hidden" style={{ background: `linear-gradient(135deg, ${brandColors[0]}, ${brandColors[1]})` }}>
                          {/* Decorative overlay designs for a real flyer look */}
                          <div className="absolute top-0 right-0 w-32 h-full opacity-15" style={{ background: `radial-gradient(circle, ${brandColors[2]} 10%, transparent 11%)`, backgroundSize: '10px 10px' }}></div>
                          <div className="absolute bottom-0 right-0 w-full h-1.5" style={{ backgroundColor: brandColors[2] }}></div>
                          
                          <div className="flex items-center gap-4 relative z-10 text-white">
                            <LogoSymbol symbol={brandSymbol} primary="#FFFFFF" secondary={brandColors[2]} size={50} />
                            <div>
                              <h2 className={`text-2xl font-bold tracking-tight ${getFontFamilyClass(brandFont)} text-white leading-none`}>
                                {brandName || 'Institución'}
                              </h2>
                              {brandSlogan && (
                                <p className="text-[9px] uppercase tracking-widest text-slate-200 mt-1 font-semibold">
                                  {brandSlogan}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Top-right meta for flyers */}
                          <div className="ml-auto text-right text-[8px] text-white/80 font-mono relative z-10 self-center">
                            <div>FOLIO: #A92-026</div>
                            <div>FECHA: {new Date().toLocaleDateString('es-ES')}</div>
                            <div>WEB: {formData.domain}</div>
                          </div>
                        </div>
                      )}

                      {/* Layout B: Clean Minimalist Style */}
                      {pdfHeaderStyle === 'clean' && (
                        <div className="border-b-2 pb-6 mb-10 flex items-start justify-between gap-4" style={{ borderColor: brandColors[0] }}>
                          <div className="flex items-center gap-3">
                            <LogoSymbol symbol={brandSymbol} primary={brandColors[0]} secondary={brandColors[2]} size={48} style={brandStyle} />
                            <div>
                              <h2 className={`text-xl font-extrabold tracking-tight ${getFontFamilyClass(brandFont)}`} style={{ color: brandColors[0] }}>
                                {brandName || 'Institución'}
                              </h2>
                              {brandSlogan && <p className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">{brandSlogan}</p>}
                            </div>
                          </div>

                          <div className="text-right text-[9px] text-slate-400 leading-relaxed font-mono">
                            <div className="font-bold uppercase" style={{ color: brandColors[1] }}>{formData.type}</div>
                            <div>{formData.location}</div>
                            <div>{formData.phone}</div>
                            <div>{formData.email}</div>
                          </div>
                        </div>
                      )}

                      {/* Layout C: Traditional Solemn Centered Emblem Style */}
                      {pdfHeaderStyle === 'traditional' && (
                        <div className="flex flex-col items-center text-center pb-6 mb-10 border-b border-double border-slate-300">
                          <LogoSymbol symbol={brandSymbol} primary={brandColors[0]} secondary={brandColors[2]} size={58} className="mb-3" style={brandStyle} />
                          <h2 className={`text-2xl font-bold tracking-tight text-slate-900 ${getFontFamilyClass(brandFont)} uppercase`}>
                            {brandName || 'Institución'}
                          </h2>
                          {brandSlogan && (
                            <p className="text-[10px] italic text-slate-400 font-medium font-serif mt-1">
                              « {brandSlogan} »
                            </p>
                          )}
                          <div className="w-full flex items-center justify-between text-[8px] text-slate-400 font-serif border-t border-slate-200 mt-4 pt-2">
                            <span>REG. ACAD. N° 9811-A</span>
                            <span>{formData.location}</span>
                            <span>{new Date().toLocaleDateString('es-ES')}</span>
                          </div>
                        </div>
                      )}

                      {/* Document Sheet Body Area */}
                      <div className="space-y-6 text-justify">
                        
                        {/* Meta lines */}
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                          <span>Ref: EXP-2026/08</span>
                          <span>Buenos Aires, {new Date().toLocaleDateString('es-ES')}</span>
                        </div>

                        {/* Title of document */}
                        <h3 className={`text-sm font-bold tracking-wider text-center uppercase pb-2 ${getFontFamilyClass(brandFont)}`} style={{ color: brandColors[0] }}>
                          {pdfTitle}
                        </h3>

                        {/* Letter Content Body */}
                        <p className={`text-xs leading-relaxed text-slate-700 ${getFontBodyClass(brandFont)}`}>
                          {pdfBody}
                        </p>

                        <p className={`text-xs leading-relaxed text-slate-700 ${getFontBodyClass(brandFont)}`}>
                          Agradecemos de antemano el compromiso continuo de toda la comunidad en la adopción del nuevo estandarte corporativo oficial, que servirá de pilar de comunicación formal y representación visual en todos nuestros medios de difusión.
                        </p>

                        {/* Traditional Stamp and Sign area */}
                        <div className="pt-16 flex justify-around items-center">
                          <div className="text-center">
                            <div className="w-32 border-b border-slate-300 mx-auto mb-2"></div>
                            <span className="text-[9px] font-mono block text-slate-400">FIRMA AUTORIZADA</span>
                            <span className="text-[10px] font-bold block" style={{ color: brandColors[0] }}>Oficina de Dirección</span>
                          </div>

                          <div className="border-2 rounded-full p-4 w-20 h-20 flex items-center justify-center border-dashed opacity-40 text-center select-none" style={{ borderColor: brandColors[1], color: brandColors[1] }}>
                            <span className="text-[8px] font-bold block leading-tight">SELLO OFICIAL</span>
                          </div>
                        </div>
                      </div>

                      {/* Letterhead Footer */}
                      <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between pt-4 border-t border-slate-100 text-[8px] text-slate-400 font-mono">
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1"><MapPin size={8} /> {formData.location}</span>
                          <span className="flex items-center gap-1"><Phone size={8} /> {formData.phone}</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1"><Mail size={8} /> {formData.email}</span>
                          <span className="flex items-center gap-1"><GlobeIcon size={8} /> {formData.domain}</span>
                        </div>
                      </div>

                      {/* Visual Watermark in Page Center */}
                      <div className="absolute inset-0 m-auto flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                        <LogoSymbol symbol={brandSymbol} primary={brandColors[0]} secondary={brandColors[2]} size={350} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 3: PROPOSAL PROTOTYPE VARIANTS */}
                {activeTab === 'variants' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-1">Explorar Alternativas de Estilo</h4>
                      <p className="text-xs text-slate-400">
                        Haz clic en cualquiera de estas variantes profesionales para cargar instantáneamente su paleta cromática, tipografía y estilo de diseño predefinido.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => applyPresetVariant(preset)}
                          className="text-left bg-slate-950 border border-slate-800/80 hover:border-violet-350 hover:bg-indigo-900/30/20 p-5 rounded-2xl flex flex-col gap-3 transition group shadow-sm"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition">{preset.name}</span>
                            <span className="text-[9px] uppercase tracking-wider bg-indigo-900/50/80 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold">
                              {preset.vibe}
                            </span>
                          </div>

                          <div className="flex gap-2.5 my-1">
                            {preset.colors.map((color) => (
                              <div key={color} className="w-7 h-7 rounded-lg border border-slate-800" style={{ backgroundColor: color }} />
                            ))}
                          </div>

                          <span className="text-[10px] text-slate-400 leading-relaxed">
                            Cargar tipografía <strong className="text-slate-100 capitalize">{preset.font}</strong> y paleta de tonos corporativos.
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* TAB 3.5: INTERACTIVE MOCKUPS SIMULATOR */}
                {activeTab === 'mockups' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-1">{lang === 'es' ? 'Simulador de Maquetas Físicas' : 'Physical Mockups Simulator'}</h4>
                      <p className="text-xs text-slate-400">{lang === 'es' ? 'Visualiza cómo lucirá la identidad institucional aplicada sobre soportes táctiles de alto valor y señalética premium.' : 'Visualize how the institutional identity will look applied to high-value tactile supports and premium signage.'}</p>
                    </div>

                    {/* Model selector buttons */}
                    <div className="flex bg-[#F1EFEA] p-1 rounded-xl border border-stone-200 gap-1">
                      {[
                        { id: 'plaque', label: lang === 'es' ? 'Placa de Vidrio' : 'Glass Plaque' },
                        { id: 'badge', label: lang === 'es' ? 'Credencial ID' : 'ID Badge' }
                      ].map((model) => (
                        <button
                          key={model.id}
                          onClick={() => setMockupModel(model.id as any)}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${mockupModel === model.id ? 'bg-stone-900 text-white shadow' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/40'}`}
                        >
                          {model.label}
                        </button>
                      ))}
                    </div>

                    {/* Preview canvas */}
                    <div className="relative bg-slate-800 border border-slate-200 rounded-2xl p-8 min-h-[420px] flex items-center justify-center overflow-hidden shadow-inner">
                      
                      {/* Background texture depending on selection */}
                      {mockupModel === 'plaque' && (
                        <div className="absolute inset-0 bg-[radial-gradient(#ddd_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
                      )}

                      {/* GLASS COMMEMORATIVE PLAQUE */}
                      {mockupModel === 'plaque' && (
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="relative w-full max-w-[460px] bg-slate-900/50/80 border border-slate-800/60 rounded-2xl shadow-xl p-8 backdrop-blur-md flex flex-col items-center justify-between text-center min-h-[280px]"
                        >
                          {/* Corner studs / Separadores de acero */}
                          <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-gradient-to-br from-stone-300 to-stone-500 border border-white/20 shadow-inner" />
                          <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-gradient-to-br from-stone-300 to-stone-500 border border-white/20 shadow-inner" />
                          <div className="absolute bottom-3 left-3 w-4 h-4 rounded-full bg-gradient-to-br from-stone-300 to-stone-500 border border-white/20 shadow-inner" />
                          <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-gradient-to-br from-stone-300 to-stone-500 border border-white/20 shadow-inner" />

                          {/* Outer thin metallic border */}
                          <div className="absolute inset-4 border border-amber-500/30 rounded-xl pointer-events-none" />

                          {/* Content */}
                          <div className="my-auto space-y-4 relative z-10">
                            <div className="flex justify-center">
                              <div className="bg-slate-950 p-4 rounded-full border border-slate-800/50 shadow-sm">
                                <LogoSymbol symbol={brandSymbol} primary={brandColors[0]} secondary={brandColors[2]} size={64} style={brandStyle} />
                              </div>
                            </div>
                            <div>
                              <h3 className={`text-xl font-bold tracking-tight text-slate-100 ${getFontFamilyClass(brandFont)} uppercase`}>
                                {brandName || 'Nombre de la Institución'}
                              </h3>
                              {brandSlogan && (
                                <p className="text-[9px] uppercase tracking-widest text-amber-600 mt-1.5 font-bold">
                                  {brandSlogan}
                                </p>
                              )}
                            </div>
                            <div className="w-16 h-0.5 bg-amber-500/40 mx-auto" />
                            <p className="text-[10px] text-stone-600 tracking-wider font-semibold">{lang === 'es' ? 'SEDE CORPORATIVA PRINCIPAL' : 'MAIN CORPORATE HEADQUARTERS'}</p>
                          </div>
                        </motion.div>
                      )}

                      {/* SECURITY ID BADGE */}
                      {mockupModel === 'badge' && (
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="relative w-[240px] bg-slate-900/50 border border-slate-800 rounded-2xl shadow-xl p-5 text-slate-100 flex flex-col justify-between min-h-[360px] overflow-hidden"
                        >
                          {/* Lanyard Strap Slot */}
                          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-3.5 bg-slate-800 border border-slate-200 rounded-full flex items-center justify-center">
                            <div className="w-6 h-1 bg-stone-400 rounded-full" />
                          </div>

                          {/* Banner background matching brand primary color */}
                          <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none" style={{ backgroundColor: brandColors[0] }} />

                          {/* Content */}
                          <div className="pt-10 flex flex-col items-center text-center space-y-4 relative z-10">
                            <div className="bg-slate-950 p-2 rounded-full border border-slate-800 shadow-sm">
                              <LogoSymbol symbol={brandSymbol} primary={brandColors[0]} secondary={brandColors[2]} size={36} style={brandStyle} />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold tracking-tight text-white leading-tight truncate max-w-[200px]">
                                {brandName || 'Nombre Institucional'}
                              </h4>
                              <p className="text-[7px] text-violet-100 tracking-widest uppercase mt-0.5">{brandSlogan ? brandSlogan.substring(0, 30) : 'CREDENTIAL'}</p>
                            </div>

                            {/* Simulated User Photo */}
                            <div className="w-20 h-24 bg-gradient-to-b from-slate-100 to-slate-200 border-2 border-slate-300 rounded-lg shadow-inner flex flex-col items-center justify-center overflow-hidden relative">
                              <div className="w-10 h-10 rounded-full bg-slate-450 mt-4 border border-slate-300" />
                              <div className="w-14 h-8 bg-slate-450/50 rounded-t-xl mt-1.5" />
                              <div className="absolute top-1 right-1 bg-amber-500 text-[6px] font-bold px-1 rounded-full uppercase text-white">VIP</div>
                            </div>

                            <div>
                              <p className="text-[9px] font-bold tracking-wider text-indigo-300">{lang === 'es' ? 'DIRECCIÓN GENERAL' : 'GENERAL MANAGEMENT'}</p>
                              <p className="text-[7px] text-stone-500 font-mono mt-0.5">ID: #8809-A2</p>
                            </div>
                          </div>

                          {/* Secure smart-chip hologram and barcode */}
                          <div className="flex items-center justify-between border-t border-slate-200 pt-3 mt-1.5">
                            {/* Hologram chip */}
                            <div className="w-7 h-5 rounded bg-gradient-to-tr from-cyan-400 via-pink-400 to-yellow-300 opacity-80 border border-white/20" />
                            {/* Barcode lines */}
                            <div className="flex flex-col items-end gap-0.5">
                              <div className="flex gap-[1px] h-4">
                                {[1,2,1,3,1,2,4,1,2,1].map((w, idx) => (
                                  <div key={idx} className="bg-slate-850" style={{ width: `${w}px` }} />
                                ))}
                              </div>
                              <span className="text-[5px] font-mono text-stone-500">AUTH SECURE</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                    </div>
                  </motion.div>
                )}

                {/* TAB 3.6: CONTRAST CHECKER & ANTIFORGERY PATTERNS */}
                {activeTab === 'guidelines' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    
                    {/* Section 1: WCAG Accessibility Contrast Calculator */}
                    <div className="space-y-4 text-slate-100">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-800 pb-2">
                          {lang === 'es' ? 'Calculadora de Accesibilidad WCAG (Contraste de Color)' : 'WCAG Accessibility Calculator (Color Contrast)'}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1">
                          {lang === 'es' ? 'El estándar internacional WCAG 2.1 exige un contraste mínimo para asegurar que estudiantes, pacientes o ciudadanos con dificultades visuales lean correctamente tus comunicados institucionales.' : 'The international WCAG 2.1 standard requires a minimum contrast ratio to ensure students, patients, or citizens with visual impairments can easily read your institutional announcements.'}
                        </p>
                      </div>

                      {/* Live calculator widget */}
                      <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center shadow-sm">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">{lang === 'es' ? 'Fórmula de Luminancia' : 'Luminance Formula'}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-slate-100">
                              {(() => {
                                const ratio = getContrastRatio(brandColors[0] || '#1E3A8A', '#FFFFFF');
                                return ratio.toFixed(2);
                              })()}:1
                            </span>
                            <span className="text-xs text-slate-400">vs Fondo Blanco</span>
                          </div>
                        </div>

                        {/* Scores badge list */}
                        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-[10px] font-bold">
                          {(() => {
                            const ratio = getContrastRatio(brandColors[0] || '#1E3A8A', '#FFFFFF');
                            const passesNormalAA = ratio >= 4.5;
                            const passesLargeAA = ratio >= 3.0;
                            const passesNormalAAA = ratio >= 7.0;
                            return (
                              <>
                                <div className={`p-2 rounded-xl border ${passesNormalAA ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                                  <p className="font-medium text-slate-300 block uppercase text-[8px] mb-0.5">Texto Normal AA</p>
                                  {passesNormalAA ? 'PASA (>= 4.5)' : 'NO PASA'}
                                </div>
                                <div className={`p-2 rounded-xl border ${passesLargeAA ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                                  <p className="font-medium text-slate-300 block uppercase text-[8px] mb-0.5">Texto Grande AA</p>
                                  {passesLargeAA ? 'PASA (>= 3.0)' : 'NO PASA'}
                                </div>
                                <div className={`p-2 rounded-xl border ${passesNormalAAA ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                                  <p className="font-medium text-slate-300 block uppercase text-[8px] mb-0.5">Texto Normal AAA</p>
                                  {passesNormalAAA ? 'ALTO PASS (>= 7.0)' : 'BAJO PASS'}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Anti-Forgery Security Filigree (Guilloché Generator) */}
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-800 pb-2">
                          Generador de Fondo de Seguridad Guilloché (Anti-Falsificación)
                        </h5>
                        <p className="text-xs text-slate-300 mt-1">
                          Genera un fondo de filigrana matemática (Guilloché) para diplomas oficiales o actas de seguridad. Ajusta los controles para exportar retículas complejas de protección.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        {/* Adjust sliders (Left column, 5 columns) */}
                        <div className="md:col-span-5 bg-slate-950 border border-slate-800/80 p-5 rounded-2xl space-y-4 shadow-sm">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-550 flex justify-between">
                              <span>Densidad de Ondas</span>
                              <span className="font-mono text-slate-100">{guillocheDensity}</span>
                            </label>
                            <input
                              type="range"
                              min="10"
                              max="80"
                              value={guillocheDensity}
                              onChange={(e) => setGuillocheDensity(Number(e.target.value))}
                              className="w-full accent-violet-650"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-550 flex justify-between">
                              <span>Grosor de Línea</span>
                              <span className="font-mono text-slate-100">{guillocheStroke}px</span>
                            </label>
                            <input
                              type="range"
                              min="0.1"
                              max="2"
                              step="0.1"
                              value={guillocheStroke}
                              onChange={(e) => setGuillocheStroke(Number(e.target.value))}
                              className="w-full accent-violet-650"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-550 flex justify-between">
                              <span>Opacidad Filigrana</span>
                              <span className="font-mono text-slate-100">{(guillocheOpacity * 100).toFixed(0)}%</span>
                            </label>
                            <input
                              type="range"
                              min="0.05"
                              max="0.5"
                              step="0.05"
                              value={guillocheOpacity}
                              onChange={(e) => setGuillocheOpacity(Number(e.target.value))}
                              className="w-full accent-violet-650"
                            />
                          </div>
                        </div>

                        {/* Interactive Canvas pattern (Right column, 7 columns) */}
                        <div className="md:col-span-7 bg-slate-900/50 border border-slate-800 rounded-2xl h-52 relative flex items-center justify-center overflow-hidden shadow-sm">
                          <span className="absolute top-2 left-2 text-[8px] font-mono bg-slate-950 border border-slate-100 text-slate-400 px-1.5 py-0.5 rounded uppercase">SIMULACIÓN PREVENTIVA</span>
                          
                          {/* Real-time math SVG drawing representing Guilloché pattern */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {Array.from({ length: Math.max(2, Math.floor(guillocheDensity / 3)) }).map((_, i) => {
                              const amplitude = 15 + i * 3;
                              const frequency = 0.04;
                              const points = Array.from({ length: 40 }).map((_, xIdx) => {
                                const x = xIdx * 10;
                                const y = 100 + Math.sin(x * frequency + i * 0.4) * amplitude;
                                return `${x},${y}`;
                              }).join(' ');

                              return (
                                <polyline
                                  key={i}
                                  points={points}
                                  stroke={brandColors[0]}
                                  strokeWidth={guillocheStroke}
                                  opacity={guillocheOpacity}
                                />
                              );
                            })}
                            
                            {/* Intersecting secondary curve */}
                            {Array.from({ length: Math.max(2, Math.floor(guillocheDensity / 3)) }).map((_, i) => {
                              const amplitude = 12 + i * 4;
                              const frequency = 0.03;
                              const points = Array.from({ length: 40 }).map((_, xIdx) => {
                                const x = xIdx * 10;
                                const y = 100 + Math.cos(x * frequency - i * 0.5) * amplitude;
                                return `${x},${y}`;
                              }).join(' ');

                              return (
                                <polyline
                                  key={'sec-' + i}
                                  points={points}
                                  stroke={brandColors[2] || brandColors[1]}
                                  strokeWidth={guillocheStroke}
                                  opacity={guillocheOpacity}
                                />
                              );
                            })}
                          </svg>

                          <div className="relative z-10 text-center space-y-1 select-none pointer-events-none">
                            <LogoSymbol symbol={brandSymbol} primary={brandColors[0]} secondary={brandColors[2]} size={48} className="mx-auto opacity-40" />
                            <p className="text-[9px] font-mono text-slate-400">CÓDIGO DE INTEGRIDAD REFORZADA</p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                )}

                {/* TAB 4: DATABASE OF PRESETS & CUSTOM DESIGNS */}
                {activeTab === 'database' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-1 flex items-center gap-2">
                        <Database className="text-indigo-400 animate-pulse" size={16} /> {lang === 'es' ? 'Biblioteca y Base de Datos de Identidades Institucionales' : 'Institutional Identities Database & Library'}
                      </h4>
                      <p className="text-xs text-slate-300">
                        {lang === 'es' ? 'Carga al instante combinaciones premium de la base de datos de presets pre-diseñados offline (diseñados para no depender de IA), o gestiona tus marcas personalizadas guardadas.' : 'Instantly load premium combinations from the offline pre-designed presets database (designed not to depend on AI), or manage your saved custom brands.'}
                      </p>
                    </div>

                    {/* Section A: Saved Custom Brands */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center justify-between">
                        <span>{lang === 'es' ? 'Tus Diseños Personalizados Guardados' : 'Your Saved Custom Designs'} ({savedBrands.length})</span>
                        {savedBrands.length > 0 && (
                          <span className="text-[9px] text-slate-400 font-mono">{lang === 'es' ? 'Buzón de Almacenamiento Local' : 'Local Storage Box'}</span>
                        )}
                      </h5>

                      {savedBrands.length === 0 ? (
                        <div className="bg-slate-950 border border-dashed border-violet-150 rounded-2xl p-8 text-center text-slate-300 text-xs">
                          <p className="mb-2">{lang === 'es' ? 'Aún no has guardado ningún diseño personalizado.' : 'You have not saved any custom designs yet.'}</p>
                          <p className="text-[11px] text-slate-400">{lang === 'es' ? 'Modifica la marca en el panel izquierdo y haz clic en "Guardar Marca" para almacenarla permanentemente aquí.' : 'Modify the brand in the left panel and click "Save Brand" to store it permanently here.'}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {savedBrands.map((brand) => (
                            <div
                              key={brand.id}
                              onClick={() => loadBrandFromDb(brand)}
                              className="text-left bg-slate-950 border border-violet-150/60 hover:border-indigo-500 hover:bg-indigo-900/30/20 p-5 rounded-2xl flex flex-col gap-3 transition group cursor-pointer relative shadow-sm"
                            >
                              <button
                                onClick={(e) => deleteBrandFromDb(brand.id, e)}
                                className="absolute top-4 right-4 p-1.5 text-slate-550 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                                title={lang === 'es' ? 'Eliminar diseño' : 'Delete design'}
                              >
                                <Trash2 size={14} />
                              </button>

                              <div className="flex items-center gap-2">
                                <LogoSymbol symbol={brand.brandSymbol} primary={brand.brandColors[0]} secondary={brand.brandColors[2]} size={32} />
                                <div className="max-w-[70%]">
                                  <h6 className="text-xs font-extrabold text-slate-100 truncate">{brand.brandName}</h6>
                                  {brand.brandSlogan && <p className="text-[8px] text-slate-300 truncate uppercase">{brand.brandSlogan}</p>}
                                </div>
                              </div>

                              <div className="flex gap-1.5 my-1">
                                {brand.brandColors.map((color) => (
                                  <div key={color} className="w-5 h-5 rounded border border-slate-800" style={{ backgroundColor: color }} />
                                ))}
                              </div>

                              <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-800 text-[9px] text-slate-400 font-mono">
                                <span>{lang === 'es' ? 'Tipografía: ' : 'Typography: '}{brand.brandFont}</span>
                                <span>{lang === 'es' ? 'Guardado: ' : 'Saved: '}{brand.savedAt}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Section B: Handcrafted System Templates */}
                    <div className="space-y-4 pt-4">
                      <h5 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-800 pb-2">
                        {lang === 'es' ? 'Presets del Sistema Pre-Diseñados Offline' : 'Offline Pre-Designed System Presets'} ({SYSTEM_TEMPLATES.length})
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SYSTEM_TEMPLATES.map((brand, idx) => (
                          <div
                            key={'sys-' + idx}
                            onClick={() => loadSystemTemplate(brand)}
                            className="text-left bg-slate-950 border border-slate-800/80 hover:border-indigo-500 hover:bg-indigo-900/30/20 p-5 rounded-2xl flex flex-col gap-3 transition group cursor-pointer shadow-sm"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <LogoSymbol symbol={brand.symbol} primary={brand.colors[0]} secondary={brand.colors[2] || brand.colors[1]} size={32} />
                                <div className="max-w-[70%]">
                                  <h6 className="text-xs font-extrabold text-slate-100 group-hover:text-indigo-300 transition truncate">{brand.institutionName}</h6>
                                  {brand.slogan && <p className="text-[8px] text-slate-400 truncate uppercase">{brand.slogan}</p>}
                                </div>
                              </div>
                              <span className="text-[8px] uppercase tracking-wider bg-indigo-900/50/80 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold">
                                {brand.pdfHeaderStyle}
                              </span>
                            </div>

                            <div className="flex gap-1.5 my-1">
                              {brand.colors.map((color) => (
                                  <div key={color} className="w-5 h-5 rounded border border-slate-800" style={{ backgroundColor: color }} />
                              ))}
                            </div>

                            <p className="text-[10px] text-slate-300 leading-relaxed truncate">
                              {brand.description || "{lang === 'es' ? 'Estilo premium listo para cargar.' : 'Premium style ready to load.'}"}
                            </p>

                            <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-800 text-[9px] text-slate-400 font-mono">
                              <span>{lang === 'es' ? 'Tipografía: ' : 'Typography: '}{brand.font}</span>
                              <span className="text-violet-650 font-semibold uppercase text-[8px]">{lang === 'es' ? 'Cargar Preset' : 'Load Preset'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

              </div>
            </div>

          </div>
        )}
      </main>
      
      {/* Footer Area */}
      <footer className="max-w-7xl mx-auto px-6 mt-16 text-center text-xs text-slate-550 relative z-10 space-y-2">
        <p className="font-semibold uppercase tracking-wider text-slate-300">{lang === 'es' ? 'RAICEP — Generador de Marca Institucional' : 'DOCENT NEXUS — Brand Generator'}</p>
        <p>© {new Date().getFullYear()} {lang === 'es' ? 'Todos los derechos reservados a RAICEP registro argentino de instituciones y homologacion de estudios profesionales.' : 'All rights reserved.'}</p>
      </footer>
    </div>
  );
}
