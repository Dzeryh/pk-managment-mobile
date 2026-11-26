import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../core/theme';
import { t } from '../../core/i18n';

/**
 * Écran de démarrage : affiché pendant la restauration de session
 * (lecture de SecureStore + rotation du refresh token + `/api/me`).
 */
export function SplashScreen(): React.JSX.Element {
  return (
    <View style={styles.conteneur} accessibilityLabel={t('splash.loading')}>
      <View style={styles.marque}>
        <Text style={styles.marqueTexte}>P&amp;K</Text>
      </View>
      <Text style={styles.titre}>{t('app.name')}</Text>
      <Text style={styles.sousTitre}>{t('splash.loading')}</Text>
      <ActivityIndicator color={colors.brand} style={styles.chargement} />
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  marque: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  marqueTexte: { color: colors.accent, fontWeight: '800', fontSize: 20 },
  titre: { ...typography.title, color: colors.ink },
  sousTitre: { ...typography.body, color: colors.muted },
  chargement: { marginTop: spacing.lg },
});
