import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PixelFlowProvider, configure} from 'react-native-pixelflow';
import {AppModalProvider} from './src/components/AppModal';
import {ThemeProvider, useAppTheme} from './src/hooks/useAppTheme';
import {RootNavigator} from './src/navigation/RootNavigator';

// Match the SayItBetter design frame for hybrid scaling.
configure({figma: 'iPhone 14'});

function AppShell() {
  const {isDark} = useAppTheme();

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
          <AppShell />
        </ThemeProvider>
      </PixelFlowProvider>
    </SafeAreaProvider>
  );
}

export default App;
