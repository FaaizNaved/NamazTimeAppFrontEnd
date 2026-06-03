import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { storageService, ThemeMode } from '@/services/storage-service';

type ResolvedScheme = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: ResolvedScheme;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  colorScheme: 'light',
  setThemeMode: async () => {},
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    storageService.getThemeMode().then(setThemeModeState);
  }, []);

  const colorScheme: ResolvedScheme = useMemo(() => {
    if (themeMode === 'dark') return 'dark';
    if (themeMode === 'light') return 'light';
    return systemScheme === 'dark' ? 'dark' : 'light';
  }, [themeMode, systemScheme]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await storageService.saveThemeMode(mode);
  }, []);

  return (
    <ThemeContext.Provider value={{ themeMode, colorScheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
