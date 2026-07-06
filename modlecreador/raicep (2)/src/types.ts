export interface Module {
  id: string;
  title: string;
  shortDesc: string;
  duration: string;
  content: string;
  challenge: string;
  order: number;
  status: 'locked' | 'unlocked' | 'completed' | 'active';
  xpReward: number;
  videoUrl?: string;
  imageUrl?: string;
  moduleType?: 'lesson' | 'assignment' | 'quiz' | 'ai-eval';
  quizQuestions?: {
    id: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
  }[];
  resources: { name: string; url: string }[];
}

export interface RecordedClass {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  transcription: string; // The transcript text
  moduleId: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  modules: Module[];
  recordedClasses: RecordedClass[];
}

export interface TallerVivo {
  id: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  spotsLeft: number;
  isRegistered: boolean;
  type: 'Workshop' | 'Feedback' | 'Masterclass';
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  role: 'teacher' | 'student';
  text: string;
  timestamp: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  role: 'teacher' | 'student';
  text: string;
  timestamp: string;
  image?: string;
  category: 'avance' | 'pregunta' | 'recurso' | 'inspiracion';
  reactions: {
    like: number;
    fire: number;
    brain: number;
  };
  comments: Comment[];
}

export interface Submission {
  id: string;
  moduleId: string;
  moduleTitle: string;
  textContent: string;
  workUrl?: string; // e.g. Figma link, GitHub, photo URL
  submittedAt: string;
  status: 'pending' | 'reviewed';
  feedback?: string;
  gradeBadge?: 'Bronce' | 'Plata' | 'Oro';
  xpAwarded?: number;
}

export interface UserState {
  name: string;
  level: number;
  xp: number;
  avatar: string;
  streak: number;
  completedNodes: string[]; // List of moduleIds
  activeNodeId: string;
  registeredTalleres: string[]; // List of tallerIds
  submissions: Submission[];
}

export interface ThemePreset {
  id: string;
  name: string;
  primaryColor: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate' | 'violet' | 'teal';
  bgGradient: string; // e.g. "from-indigo-900 to-purple-950"
  secondaryBg: string; // e.g. "bg-indigo-50/50"
  accentBorder: string; // e.g. "border-indigo-150"
  accentText: string; // e.g. "text-indigo-700"
  accentTextHover: string; // e.g. "hover:text-indigo-850"
  accentBg: string; // e.g. "bg-indigo-50"
  primaryButton: string; // e.g. "bg-indigo-600 hover:bg-indigo-500 text-white"
  accentRing: string; // e.g. "focus:ring-indigo-500"
  bannerColor: string; // e.g. "from-indigo-950 to-slate-900"
}

export interface Academy {
  id: string;
  subdomain: string; // e.g. "diseno" (renders as https://diseno.raicep.app)
  name: string;
  description: string;
  themeId: string;
  courses: Course[];
  talleres: TallerVivo[];
  feed: CommunityPost[];
  user: UserState;
  students?: UserState[];
  logoUrl?: string; // custom avatar or emoji icon chosen by the builder
  bannerUrl?: string; // custom cover banner URL
}

