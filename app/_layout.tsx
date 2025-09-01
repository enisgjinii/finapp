import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { QueryProvider } from '../src/providers/QueryProvider';
import { AuthProvider } from '../src/providers/AuthProvider';
import { useAuth } from '../src/providers/AuthProvider';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#000000',
    onPrimary: '#ffffff',
    primaryContainer: '#f8f9fa',
    onPrimaryContainer: '#000000',
    secondary: '#6b7280',
    onSecondary: '#ffffff',
    secondaryContainer: '#f3f4f6',
    onSecondaryContainer: '#374151',
    tertiary: '#9ca3af',
    onTertiary: '#000000',
    tertiaryContainer: '#f9fafb',
    onTertiaryContainer: '#6b7280',
    error: '#ef4444',
    onError: '#ffffff',
    errorContainer: '#fef2f2',
    onErrorContainer: '#991b1b',
    background: '#ffffff',
    onBackground: '#111827',
    surface: '#ffffff',
    onSurface: '#111827',
    surfaceVariant: '#f9fafb',
    onSurfaceVariant: '#6b7280',
    outline: '#d1d5db',
    outlineVariant: '#e5e7eb',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#111827',
    inverseOnSurface: '#f9fafb',
    inversePrimary: '#ffffff',
    elevation: {
      level0: 'transparent',
      level1: '#ffffff',
      level2: '#ffffff',
      level3: '#ffffff',
      level4: '#ffffff',
      level5: '#ffffff',
    },
    surfaceDisabled: '#f9fafb',
    onSurfaceDisabled: '#9ca3af',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#ffffff',
    onPrimary: '#000000',
    primaryContainer: '#1f2937',
    onPrimaryContainer: '#ffffff',
    secondary: '#9ca3af',
    onSecondary: '#000000',
    secondaryContainer: '#374151',
    onSecondaryContainer: '#d1d5db',
    tertiary: '#6b7280',
    onTertiary: '#ffffff',
    tertiaryContainer: '#111827',
    onTertiaryContainer: '#9ca3af',
    error: '#ef4444',
    onError: '#ffffff',
    errorContainer: '#451a1a',
    onErrorContainer: '#fca5a5',
    background: '#111827',
    onBackground: '#f9fafb',
    surface: '#1f2937',
    onSurface: '#f9fafb',
    surfaceVariant: '#374151',
    onSurfaceVariant: '#9ca3af',
    outline: '#6b7280',
    outlineVariant: '#4b5563',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#f9fafb',
    inverseOnSurface: '#111827',
    inversePrimary: '#000000',
    elevation: {
      level0: 'transparent',
      level1: '#1f2937',
      level2: '#1f2937',
      level3: '#1f2937',
      level4: '#1f2937',
      level5: '#1f2937',
    },
    surfaceDisabled: '#374151',
    onSurfaceDisabled: '#6b7280',
    backdrop: 'rgba(0, 0, 0, 0.8)',
  },
};

function AppLayout(): JSX.Element {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  if (loading) {
    return (
      <PaperProvider theme={theme}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </PaperProvider>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <QueryProvider>
        <AppLayout />
      </QueryProvider>
    </AuthProvider>
  );
}