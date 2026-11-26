import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from './src/core/query/query-client';
import {
  subscribeToSessionExpiry,
  useAuthStore,
} from './src/features/auth/store/auth-store';
import { RootNavigator } from './src/navigation/root-navigator';

/**
 * Démarrage : branche l'expiration de session sur le store puis restaure la
 * session persistée. Le splash est affiché tant que `status === 'restoring'`.
 */
function AuthBootstrap(): React.JSX.Element {
  const restore = useAuthStore((etat) => etat.restore);

  useEffect(() => {
    const desabonner = subscribeToSessionExpiry();
    void restore();

    return desabonner;
  }, [restore]);

  return <RootNavigator />;
}

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <AuthBootstrap />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
