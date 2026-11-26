import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../core/theme';
import { AppHeader } from './app-header';

interface AppScreenProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
}

/**
 * Coquille d'écran : zone sûre haute, en-tête commun (connectivité) et corps.
 * Les écrans défilants utilisent `scroll` pour éviter les zones coupées.
 */
export function AppScreen({
  title,
  subtitle,
  children,
  scroll = true,
}: AppScreenProps): React.JSX.Element {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <AppHeader title={title} subtitle={subtitle} />
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.contenu}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.corps}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  contenu: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  corps: { flex: 1, padding: spacing.md },
});
