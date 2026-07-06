import { Course, TallerVivo, CommunityPost, UserState } from './campusTypes';

export const INITIAL_COURSES: Course[] = [];

export const INITIAL_TALLERES: TallerVivo[] = [];

export const INITIAL_FEED: CommunityPost[] = [];

export const INITIAL_USER: UserState = {
  name: '',
  level: 1,
  xp: 0,
  avatar: '',
  streak: 0,
  completedNodes: [],
  activeNodeId: '',
  registeredTalleres: [],
  submissions: []
};

export const INITIAL_STUDENTS: UserState[] = [];

