/**
 * Types & Interfaces for RAICEP generador de marca
 */

export interface LogoProps {
  id?: string;
  symbol: string;
  primary: string;
  secondary: string;
  size?: number;
  className?: string;
  style?: string;
}

export interface BrandTemplate {
  id: string;
  category: string;
  name: string;
  institutionName: string;
  slogan: string;
  vibe: string;
  colors: string[];
  font: string;
  symbol: string;
  layout: 'horizontal' | 'vertical' | 'badge' | 'icon';
  pdfTitle: string;
  pdfBody: string;
  pdfHeaderStyle: 'banner' | 'clean' | 'traditional';
  description: string;
  brandStyle?: string;
}

export interface SavedBrand {
  id: string;
  savedAt: string;
  brandName: string;
  brandSlogan: string;
  brandColors: string[];
  brandFont: string;
  brandSymbol: string;
  brandLayout: 'horizontal' | 'vertical' | 'badge' | 'icon';
  pdfHeaderStyle: 'banner' | 'clean' | 'traditional';
  pdfTitle: string;
  pdfBody: string;
  pdfHeaderDescription: string;
  type: string;
  location: string;
  phone: string;
  email: string;
  domain: string;
  brandStyle?: string;
}
