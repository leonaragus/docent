export interface CourseDataInput {
  title: string;
  description: string;
  duration: string;
  certification: string;
  audience: string;
  pricing: string;
  format: string; // e.g., 'Online Grabado', 'En Vivo (Zoom)', 'Presencial', 'Híbrido'
  extras: string; // bonus, resources, etc.
}

export interface AdCopyVariation {
  style: string;
  hook: string;
  body: string;
  cta: string;
  suggestedImagePrompt: string;
}

export interface MetaDemographics {
  locations: string;
  ageRange: string;
  genders: string;
}

export interface MetaInterest {
  interest: string;
  reason: string;
}

export interface MetaAdsConfig {
  objective: string;
  conversionLocation: string;
  estimatedBudget: string;
  demographics: MetaDemographics;
  interestsToTarget: MetaInterest[];
  exclusions: string;
  placements: string;
  formatRecommendation: string;
  dynamicRealTimeTips: string[];
}

export interface AdsGeneratorResult {
  variations: AdCopyVariation[];
  adsConfig: MetaAdsConfig;
}

export interface CourseTemplate {
  name: string;
  title: string;
  description: string;
  duration: string;
  certification: string;
  audience: string;
  pricing: string;
  format: string;
  extras: string;
}
