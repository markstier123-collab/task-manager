/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const StatusColors = {
  light: {
    not_started: { bg: '#F1F2F4', border: '#DBDDE2', accent: '#8A8F98', text: '#4B5563' },
    in_progress: { bg: '#E9F1FE', border: '#BFDBFE', accent: '#3B82F6', text: '#1D4ED8' },
    blocked: { bg: '#FDECEC', border: '#F6C4C4', accent: '#EF4444', text: '#B91C1C' },
    completed: { bg: '#E9F7EE', border: '#BFE5C9', accent: '#22A559', text: '#15803D' },
    cancelled: { bg: '#F1F2F4', border: '#DBDDE2', accent: '#9CA3AF', text: '#6B7280' },
  },
  dark: {
    not_started: { bg: '#232427', border: '#33353A', accent: '#9CA3AF', text: '#C4C8CF' },
    in_progress: { bg: '#152238', border: '#284373', accent: '#5B9BFA', text: '#8FBBFC' },
    blocked: { bg: '#301A1A', border: '#5C2A2A', accent: '#F87171', text: '#FCA5A5' },
    completed: { bg: '#15291D', border: '#25502F', accent: '#4ADE80', text: '#86EFAC' },
    cancelled: { bg: '#232427', border: '#33353A', accent: '#7C828C', text: '#9CA3AF' },
  },
} as const;

export const FilterTint = {
  light: {
    blue: { subtleBg: '#E9F1FE', solidBg: '#3B82F6', subtleText: '#1D4ED8', solidText: '#FFFFFF' },
    green: { subtleBg: '#E9F7EE', solidBg: '#22A559', subtleText: '#15803D', solidText: '#FFFFFF' },
  },
  dark: {
    blue: { subtleBg: '#152238', solidBg: '#3B82F6', subtleText: '#8FBBFC', solidText: '#FFFFFF' },
    green: { subtleBg: '#15291D', solidBg: '#22A559', subtleText: '#86EFAC', solidText: '#FFFFFF' },
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
