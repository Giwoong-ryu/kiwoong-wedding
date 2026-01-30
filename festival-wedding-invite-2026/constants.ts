
import { ThemeOption, DesignTheme } from './types';

export const THEMES: Record<ThemeOption, DesignTheme> = {
  [ThemeOption.SOFT_SAGE]: {
    primary: '#6B8E23', // Olive/Sage - Natural, calm
    secondary: '#F5F5DC', // Beige - Warmth
    accent: '#8FBC8F', // Dark Sea Green - Highlights
    bgMain: '#FAF9F6', // Off-white
    bgSection: '#F0F4EF', // Pale green
    textMain: '#2D3436',
    textMuted: '#636E72',
  },
  [ThemeOption.WARM_SUNSET]: {
    primary: '#E67E22', // Terracotta - Vibrant
    secondary: '#FAD7A0', // Peach - Friendly
    accent: '#D35400', // Deep Orange - Call to action
    bgMain: '#FFFBF5', // Warm cream
    bgSection: '#FEF5E7', // Light peach
    textMain: '#2C3E50',
    textMuted: '#7F8C8D',
  },
  [ThemeOption.WILDFLOWER]: {
    primary: '#9B59B6', // Amethyst - Creative
    secondary: '#D2B4DE', // Light purple - Elegant
    accent: '#F1C40F', // Sunflower Yellow - Festive
    bgMain: '#FBFCFC', // Clean white
    bgSection: '#F4ECF7', // Light lavender
    textMain: '#1B2631',
    textMuted: '#5D6D7E',
  },
};

export const TYPOGRAPHY = {
  h1: 'text-3xl md:text-4xl font-extrabold tracking-tight',
  h2: 'text-2xl md:text-3xl font-bold tracking-tight',
  body: 'text-base md:text-lg leading-relaxed',
  senior_h1: 'text-5xl font-black leading-tight',
  senior_h2: 'text-4xl font-extrabold leading-snug',
  senior_body: 'text-2xl font-semibold leading-relaxed tracking-wide',
};

export const SECTIONS = [
  { id: 'hero', name: 'Main', height: '100vh', priority: 1 },
  { id: 'invite', name: 'Invitation', height: 'auto', priority: 2 },
  { id: 'gallery', name: 'Gallery', height: 'auto', priority: 3 },
  { id: 'info', name: 'When & Where', height: 'auto', priority: 4 },
  { id: 'map', name: 'Map', height: 'auto', priority: 5 },
  { id: 'gift', name: 'Special Notice', height: 'auto', priority: 6 },
  { id: 'rsvp', name: 'RSVP', height: 'auto', priority: 7 },
];
