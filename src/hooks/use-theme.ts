/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, FilterTint, StatusColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function useSchemeName(): 'light' | 'dark' {
  const scheme = useColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  return Colors[useSchemeName()];
}

export function useStatusColors() {
  return StatusColors[useSchemeName()];
}

export function useFilterTint() {
  return FilterTint[useSchemeName()];
}
