import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type View = 'explore' | 'map' | 'lesson' | 'quiz' | 'feynman' | 'review' | 'profile';

export interface ArticleData {
  part1: string;
  prediction1: {
    question: string;
    options: string[];
    correctIndex: number;
  };
  part2: string;
  prediction2: {
    question: string;
    options: string[];
    correctIndex: number;
  };
  part3: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}

export interface Topic {
  id: string;
  title: string;
  category: string;
  icon: string;
  color: string;
  xp: number;
  readTime: string;
}

export const TOPICS: Topic[] = [
  { id: 'relativity', title: '相对论', category: '科学', icon: 'Atom', color: 'bg-surface-container-lowest', xp: 450, readTime: '8 分钟' },
  { id: 'renaissance', title: '文艺复兴艺术', category: '艺术', icon: 'Palette', color: 'bg-tertiary-container', xp: 300, readTime: '6 分钟' },
  { id: 'quantum', title: '量子物理', category: '科学', icon: 'Zap', color: 'bg-secondary-container', xp: 500, readTime: '10 分钟' },
  { id: 'dark-matter', title: '暗物质', category: '科学', icon: 'Moon', color: 'bg-surface-container-lowest', xp: 400, readTime: '7 分钟' },
  { id: 'evolution', title: '进化论', category: '科学', icon: 'Dna', color: 'bg-surface-container-lowest', xp: 350, readTime: '5 分钟' },
  { id: 'architecture', title: '建筑学', category: '艺术', icon: 'Building2', color: 'bg-surface-container-low', xp: 250, readTime: '4 分钟' },
];

export const CATEGORIES = ['科学', '艺术', '历史', '科技', '自然'];
