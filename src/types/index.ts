export type KeepsakeCategoryId = 'love_lore' | 'daily_habits' | 'adventures' | 'celebration';

export interface KeepsakeCategory {
  id: KeepsakeCategoryId;
  name: string;
  icon: string;
  badgeColor: string;
  description: string;
}

export interface Collectible {
  id: string;
  type: 'gift' | 'star' | 'photo' | 'ring' | 'card' | 'flower';
  title: string;
  description: string;
  world: number;
  icon: string;
  category: KeepsakeCategoryId;
  sourceQuizId?: string;
  sourceQuizTitle?: string;
  rewardContent?: {
    type: 'message' | 'photo' | 'quote' | 'memory';
    title: string;
    text: string;
    image?: string;
    date?: string;
  };
}

export type PuzzleCategory = 'logic' | 'observation' | 'couple' | 'wedding_trivia' | 'funny_choice' | 'memory' | KeepsakeCategoryId;

export interface Puzzle {
  id: string;
  world?: number;
  title?: string;
  category: KeepsakeCategoryId | PuzzleCategory;
  categoryLabel?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  funnyReactionWrong?: string;
  difficulty: 'easy' | 'medium';
  rewardCollectibleId?: string;
}

export interface SeasonInfo {
  id: number;
  name: string;
  season: 'winter' | 'spring' | 'summer' | 'autumn';
  icon: string;
  subtitle: string;
  description: string;
  accentColor: string;
  gateName: string;
}

export interface GameProgress {
  sessionId: string;
  currentWorld: number;
  worldsCompleted: number[];
  collectedItemIds: string[];
  puzzlesSolved: string[];
  invitationUnlocked: boolean;
  score: number;
  lastPlayedAt: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  tag?: string;
}

export interface WeddingScheduleItem {
  time: string;
  icon: string;
  title: string;
  location: string;
  description: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  category: 'memories' | 'engagement' | 'travel' | 'casual';
  aspect?: 'square' | 'portrait' | 'landscape';
}

export interface RSVPRecord {
  id: string;
  guestName: string;
  email: string;
  attendance: 'attending' | 'declined';
  guestCount: number;
  dietaryRequirements: string;
  message: string;
  createdAt: string;
}

export interface WishRecord {
  id: string;
  guestName: string;
  isPrivateName: boolean;
  message: string;
  createdAt: string;
  isApproved: boolean;
  likes: number;
}

export interface WeddingConfig {
  couple: {
    groom: string;
    bride: string;
    hashtag: string;
    tagline: string;
    weddingDate: string; // ISO string
    weddingDateDisplay: string;
    locationDisplay: string;
  };
  ceremony: {
    title: string;
    venue: string;
    time: string;
    address: string;
    mapUrl: string;
    details: string;
  };
  reception: {
    title: string;
    venue: string;
    time: string;
    address: string;
    mapUrl: string;
    details: string;
  };
  dressCode: {
    theme: string;
    description: string;
    colors: { name: string; hex: string; desc: string }[];
    notes: string;
  };
}
