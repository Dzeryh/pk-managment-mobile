import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../core/theme';
import { useConnectivity } from '../../core/connectivity/use-connectivity';
import { t } from '../../core/i18n';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

/** En-tête commun : marque, titre d'écran et indicateur de connectivité. */
export function AppHeader({ title, subtitle }: AppHeaderProps): React.JSX.Element {
  const { isOnline } = useConnectivity();

  return (
    <View style={styles.conteneur} accessibilityRole="header">
      <View style={styles.gauche}>
        <View style={styles.marque}>
          <Text style={styles.marqueTexte}>P&amp;K</Text>
        </View>
        <View style={styles.textes}>
          <Text style={styles.titre} numberOfLines={1}>
            {title}
          </Text>
          {subtitle !== undefined ? (
            <Text style={styles.sousTitre} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <ConnectivityBadge isOnline={isOnline} />
    </View>
  );
}

interface ConnectivityBadgeProps {
  isOnline: boolean;
}

/** Pastille « En ligne / Hors ligne » basée sur NetInfo. */
export function ConnectivityBadge({ isOnline }: ConnectivityBadgeProps): React.JSX.Element {
  return (
    <View
      style={[styles.pastille, isOnline ? styles.pastilleEnLigne : styles.pastilleHorsLigne]}
      accessibilityRole="text"
      accessibilityLabel={isOnline ? t('connectivity.online') : t('connectivity.offline')}
    >
      <Ionicons
        name={isOnline ? 'wifi' : 'cloud-offline-outline'}
        size={14}
        color={isOnline ? colors.online : colors.offline}
      />
      <Text style={[styles.pastilleTexte, isOnline ? styles.texteEnLigne : styles.texteHorsLigne]}>
        {isOnline ? t('connectivity.online') : t('connectivity.offline')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    minHeight: 60,
  },
  gauche: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  marque: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marqueTexte: { color: colors.accent, fontWeight: '800', fontSize: 12 },
  textes: { flexShrink: 1 },
  titre: { ...typography.subtitle, color: colors.ink },
  sousTitre: { ...typography.caption, color: colors.muted },
  pastille: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    minHeight: 28,
  },
  pastilleEnLigne: { backgroundColor: colors.successBackground, borderColor: colors.successBorder },
  pastilleHorsLigne: { backgroundColor: colors.warningBackground, borderColor: colors.warningBorder },
  pastilleTexte: { ...typography.caption, fontWeight: '600' },
  texteEnLigne: { color: colors.online },
  texteHorsLigne: { color: colors.offline },
});
