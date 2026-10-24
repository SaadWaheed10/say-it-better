import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PixelFlowProvider, configure} from 'react-native-pixelflow';
import {AppModalProvider} from './src/components/AppModal';
import {AuthProvider, useAuth} from './src/hooks/useAuth';
import {ThemeProvider, useAppTheme} from './src/hooks/useAppTheme';
import {RootNavigator} from './src/navigation/RootNavigator';
import {syncDailyTestReminder} from './src/services/notificationService';
import {getSettings} from './src/services/settingsService';
import {syncAllProgress} from './src/services/syncProgressService';

// Match the SayItBetter design frame for hybrid scaling.
configure({figma: 'iPhone 14'});

function AppShell() {
  const {isDark} = useAppTheme();
  const {user, loading} = useAuth();

  useEffect(() => {
    getSettings()
      .then(settings => syncDailyTestReminder(Boolean(settings.dailyTestReminder)))
      .catch(() => {
        // Notification setup failures should not block launch.
      });
  }, []);

  useEffect(() => {
    if (loading || !user) {
      return;
    }
    syncAllProgress().catch(() => undefined);
  }, [user, loading]);

  return (
    <AppModalProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <RootNavigator />
    </AppModalProvider>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <PixelFlowProvider followSystem>
        <ThemeProvider>
          <AuthProvider>
            <AppShell />
          </AuthProvider>
        </ThemeProvider>
      </PixelFlowProvider>
    </SafeAreaProvider>
  );
}

export default App;
