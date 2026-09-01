/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1f1f1d',
    textSecondary: '#6b6a64',
    textMuted: '#9a9890',
    background: '#f7f7f5',
    surface: '#ffffff',
    backgroundElement: '#f4f3ef',
    backgroundSelected: '#e2e0da',
    border: '#e2e0da',
    borderStrong: '#c9c6bd',
  },
  dark: {
    text: '#ffffff',
    textSecondary: '#B0B4BA',
    textMuted: '#7A7E85',
    background: '#000000',
    surface: '#161616',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    border: '#2E3135',
    borderStrong: '#3A3D42',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Status color palette: 16 slots, indexed by `colorIdx` on a StatusDef.
 * Slots 0-5 reuse the app's original 5 status colors (0, 1, 3, 4, 5) plus a new
 * purple (2) for backward compatibility with lists seeded before custom statuses.
 * Order: 0 neutral, 1 blue, 2 purple, 3 red, 4 green, 5 muted gray, 6 amber, 7 teal,
 * 8 charcoal, 9 hot pink, 10 navy, 11 orange, 12 forest, 13 rust, 14 steel blue, 15 wine.
 */
export const ColorPalette = {
  light: [
    { bg: '#ffffff', border: '#c9c6bd', accent: '#c9c6bd', text: '#6b6a64' },
    { bg: '#e6f1fb', border: '#378add', accent: '#378add', text: '#185fa5' },
    { bg: '#f1ecfb', border: '#a87fe0', accent: '#a87fe0', text: '#6b3fa0' },
    { bg: '#fcebeb', border: '#d85a5a', accent: '#d85a5a', text: '#a32d2d' },
    { bg: '#eaf3de', border: '#8bc34a', accent: '#8bc34a', text: '#3b6d11' },
    { bg: '#f4f3ef', border: '#c9c6bd', accent: '#c9c6bd', text: '#9a9890' },
    { bg: '#fdf1df', border: '#d99a3d', accent: '#d99a3d', text: '#8a5a13' },
    { bg: '#e3f3f1', border: '#4fa89c', accent: '#4fa89c', text: '#276b62' },
    { bg: '#dedcd7', border: '#2b2a27', accent: '#2b2a27', text: '#141412' },
    { bg: '#fce4f0', border: '#e0388f', accent: '#e0388f', text: '#8a1a56' },
    { bg: '#dde3f5', border: '#24408f', accent: '#24408f', text: '#16265c' },
    { bg: '#fde4d0', border: '#e0631a', accent: '#e0631a', text: '#8a3c0f' },
    { bg: '#dcead9', border: '#2f7a3f', accent: '#2f7a3f', text: '#1a4a24' },
    { bg: '#f3e0d5', border: '#a24a26', accent: '#a24a26', text: '#6b2f16' },
    { bg: '#dbe4ea', border: '#3d6b85', accent: '#3d6b85', text: '#1f4356' },
    { bg: '#ecdde2', border: '#7a2340', accent: '#7a2340', text: '#4a1526' },
  ],
  // Dark mode reuses the exact same approved hex values as light — there is only
  // one approved status palette, not a separate dark-tuned variant.
  dark: [
    { bg: '#ffffff', border: '#c9c6bd', accent: '#c9c6bd', text: '#6b6a64' },
    { bg: '#e6f1fb', border: '#378add', accent: '#378add', text: '#185fa5' },
    { bg: '#f1ecfb', border: '#a87fe0', accent: '#a87fe0', text: '#6b3fa0' },
    { bg: '#fcebeb', border: '#d85a5a', accent: '#d85a5a', text: '#a32d2d' },
    { bg: '#eaf3de', border: '#8bc34a', accent: '#8bc34a', text: '#3b6d11' },
    { bg: '#f4f3ef', border: '#c9c6bd', accent: '#c9c6bd', text: '#9a9890' },
    { bg: '#fdf1df', border: '#d99a3d', accent: '#d99a3d', text: '#8a5a13' },
    { bg: '#e3f3f1', border: '#4fa89c', accent: '#4fa89c', text: '#276b62' },
    { bg: '#dedcd7', border: '#2b2a27', accent: '#2b2a27', text: '#141412' },
    { bg: '#fce4f0', border: '#e0388f', accent: '#e0388f', text: '#8a1a56' },
    { bg: '#dde3f5', border: '#24408f', accent: '#24408f', text: '#16265c' },
    { bg: '#fde4d0', border: '#e0631a', accent: '#e0631a', text: '#8a3c0f' },
    { bg: '#dcead9', border: '#2f7a3f', accent: '#2f7a3f', text: '#1a4a24' },
    { bg: '#f3e0d5', border: '#a24a26', accent: '#a24a26', text: '#6b2f16' },
    { bg: '#dbe4ea', border: '#3d6b85', accent: '#3d6b85', text: '#1f4356' },
    { bg: '#ecdde2', border: '#7a2340', accent: '#7a2340', text: '#4a1526' },
  ],
} as const;

export const COLOR_PALETTE_NAMES = [
  'Neutral',
  'Blue',
  'Purple',
  'Red',
  'Green',
  'Gray',
  'Amber',
  'Teal',
  'Charcoal',
  'Hot pink',
  'Navy',
  'Orange',
  'Forest',
  'Rust',
  'Steel blue',
  'Wine',
];

export const ICON_PALETTE_NAMES = [
  'Outline circle',
  'Half-filled circle',
  'Dashed ring',
  'Dot in circle',
  'Checkmark circle',
  'X circle',
  'Solid dot',
  'Square outline',
  'Diamond outline',
  'Triangle outline',
];

/** Derives the same {bg, border, accent, text} status triad into pill-tint shape. */
function paletteTint(c: { bg: string; border: string; accent: string; text: string }) {
  return { subtleBg: c.bg, border: c.border, solidBg: c.accent, subtleText: c.text, solidText: '#ffffff' };
}

/**
 * Filter pills reuse the same palette entries as status cards: Blue for status, Green for due,
 * Red for priority, Amber/Teal alternating for custom filter groups.
 */
export const FilterTint = {
  light: {
    blue: paletteTint(ColorPalette.light[1]),
    green: paletteTint(ColorPalette.light[4]),
    red: paletteTint(ColorPalette.light[3]),
    amber: paletteTint(ColorPalette.light[6]),
    teal: paletteTint(ColorPalette.light[7]),
  },
  dark: {
    blue: paletteTint(ColorPalette.dark[1]),
    green: paletteTint(ColorPalette.dark[4]),
    red: paletteTint(ColorPalette.dark[3]),
    amber: paletteTint(ColorPalette.dark[6]),
    teal: paletteTint(ColorPalette.dark[7]),
  },
} as const;

/** Font weights only — no custom fontFamily is set, so text falls back to the platform default (San Francisco / Roboto). */
export const Fonts = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  mono: Platform.select({ ios: 'ui-monospace', default: 'monospace' }),
} as const;

/** Shared height for the status badge and the filter pills, so they line up visually. */
export const PillHeight = 24;

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

/** Roughly tablet width and up — task cards switch to a single flowing meta line. */
export const WideBreakpoint = 700;
export const MaxContentWidthWide = 1100;
