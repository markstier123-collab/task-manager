import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { TaskManagerProvider } from '@/context/task-manager-context';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <TaskManagerProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </TaskManagerProvider>
    </ThemeProvider>
  );
}
