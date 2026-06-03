import { useAppTheme } from '@/contexts/theme-context';

export function useAppColorScheme() {
  return useAppTheme().colorScheme;
}
