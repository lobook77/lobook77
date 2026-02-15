
export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface ThemeStats {
  name: string;
  value: number;
  color: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  sources?: any[];
}

export interface DiaryNote {
  id: string;
  title: string;
  content: string;
  verseRef?: string;
  timestamp: Date;
}

export enum AppTab {
  Reader = 'reader',
  Mentor = 'mentor',
  Visualizer = 'visualizer',
  Gallery = 'gallery',
  Maps = 'maps',
  Diary = 'diary',
  Study = 'study'
}
