import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#006d77',
    onPrimary: '#ffffff',
    primaryContainer: '#97f0ff',
    onPrimaryContainer: '#001f24',
    secondary: '#4a6367',
    onSecondary: '#ffffff',
    secondaryContainer: '#cce7ec',
    onSecondaryContainer: '#051f23',
    tertiary: '#4b5f7c',
    onTertiary: '#ffffff',
    tertiaryContainer: '#d2e4ff',
    onTertiaryContainer: '#041b35',
    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#410002',
    background: '#fafdfd',
    onBackground: '#161d1e',
    surface: '#fafdfd',
    onSurface: '#161d1e',
    surfaceVariant: '#dbe4e6',
    onSurfaceVariant: '#3f484a',
    outline: '#6f797a',
    outlineVariant: '#bfc9ca',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#2b3132',
    inverseOnSurface: '#f0f1f1',
    inversePrimary: '#4dd8eb',
    elevation: {
      level0: 'transparent',
      level1: '#f2f5f6',
      level2: '#e8ecee',
      level3: '#dee3e5',
      level4: '#d9dee0',
      level5: '#d5dadd',
    },
    surfaceDisabled: '#161d1e',
    onSurfaceDisabled: '#3f484a',
    backdrop: 'rgba(22, 29, 30, 0.4)',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4dd8eb',
    onPrimary: '#00363d',
    primaryContainer: '#004f58',
    onPrimaryContainer: '#97f0ff',
    secondary: '#b0cbcf',
    onSecondary: '#1b3539',
    secondaryContainer: '#324b4f',
    onSecondaryContainer: '#cce7ec',
    tertiary: '#aac8ff',
    onTertiary: '#1d3149',
    tertiaryContainer: '#334661',
    onTertiaryContainer: '#d2e4ff',
    error: '#ffb4ab',
    onError: '#690005',
    errorContainer: '#93000a',
    onErrorContainer: '#ffdad6',
    background: '#0e1516',
    onBackground: '#e1e3e3',
    surface: '#0e1516',
    onSurface: '#e1e3e3',
    surfaceVariant: '#3f484a',
    onSurfaceVariant: '#bfc9ca',
    outline: '#899294',
    outlineVariant: '#3f484a',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#e1e3e3',
    inverseOnSurface: '#2b3132',
    inversePrimary: '#006d77',
    elevation: {
      level0: 'transparent',
      level1: '#1a2122',
      level2: '#1f2627',
      level3: '#242b2c',
      level4: '#262d2e',
      level5: '#2a3132',
    },
    surfaceDisabled: '#e1e3e3',
    onSurfaceDisabled: '#3f484a',
    backdrop: 'rgba(22, 29, 30, 0.4)',
  },
};

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  isDark: false,
  setThemeMode: () => {},
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

const THEME_STORAGE_KEY = '@theme_mode';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(false);

  // Load saved theme mode on app start
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setThemeModeState(savedMode as ThemeMode);
        }
      } catch (error) {
        console.error('Error loading theme mode:', error);
      }
    };
    loadThemeMode();
  }, []);

  // Update isDark based on theme mode and system color scheme
  useEffect(() => {
    if (themeMode === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(themeMode === 'dark');
    }
  }, [themeMode, systemColorScheme]);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  const toggleTheme = () => {
    if (themeMode === 'system') {
      setThemeMode(systemColorScheme === 'dark' ? 'light' : 'dark');
    } else {
      setThemeMode(themeMode === 'light' ? 'dark' : 'light');
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, setThemeMode, toggleTheme }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};