import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../core/theme';
import { AppScreen } from './app-screen';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface PlaceholderScreenProps {
  title: string;
  description: string;
  icon: IconName;
  badge?: string;
}

/** Écran d'attente d'un module métier : aucun faux contenu, une promesse claire. */
export function PlaceholderScreen({
  title,
  description,
  icon,
  badge = 'À venir',
}: PlaceholderScreenProps): React.JSX.Element {
  return (
    <AppScreen title={title}>
      <View style={styles.carte}>
        <View style={styles.icone}>
          <Ionicons name={icon} size={26} color={colors.brand} />
        </View>
        <Text style={styles.titre}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeTexte}>{badge}</Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  carte: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  icone: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titre: { ...typography.heading, color: colors.ink, marginTop: spacing.xs },
  description: { ...typography.body, color: colors.muted, textAlign: 'center' },
  badge: {
    marginTop: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.warningBackground,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  badgeTexte: { ...typography.caption, color: colors.warningText, fontWeight: '600' },
});
