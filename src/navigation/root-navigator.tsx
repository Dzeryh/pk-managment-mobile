import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { colors } from '../core/theme';
import { useAuthStore } from '../features/auth/store/auth-store';
import { SplashScreen } from '../shared/components';
import { AuthNavigator } from './auth-navigator';
import { MainTabs } from './main-tabs';

const themeNavigation = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.brand,
    background: colors.background,
    card: colors.surface,
    text: colors.ink,
    border: colors.line,
    notification: colors.accent,
  },
};

/**
 * Aiguillage racine : splash pendant la restauration, pile de connexion si
 * anonyme, onglets principaux si authentifié. Aucun écran protégé ne peut donc
 * être atteint sans session.
 */
export function RootNavigator(): React.JSX.Element {
  const statut = useAuthStore((etat) => etat.status);

  if (statut === 'restoring') {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={themeNavigation}>
      {statut === 'signedIn' ? <MainTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
