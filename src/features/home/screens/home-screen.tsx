import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useConnectivity } from '../../../core/connectivity/use-connectivity';
import { formatMGA } from '../../../core/format/currency';
import { t } from '../../../core/i18n';
import { colors, radius, spacing, typography } from '../../../core/theme';
import { AlertBanner, AppScreen } from '../../../shared/components';
import { fetchCurrentUser } from '../../auth/api/auth-api';
import { useAuthStore } from '../../auth/store/auth-store';

const LIBELLES_ROLE: Record<'ADMIN' | 'SELLER', string> = {
  ADMIN: t('roles.admin'),
  SELLER: t('roles.seller'),
};

/** Accueil : profil vérifié via TanStack Query + aperçu du tableau de bord. */
export function HomeScreen(): React.JSX.Element {
  const user = useAuthStore((etat) => etat.user);
  const replaceUser = useAuthStore((etat) => etat.replaceUser);
  const { isOnline } = useConnectivity();

  const profil = useQuery({
    queryKey: ['me'],
    queryFn: fetchCurrentUser,
    enabled: isOnline,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (profil.data !== undefined) {
      replaceUser(profil.data);
    }
  }, [profil.data, replaceUser]);

  if (user === null) {
    return (
      <AppScreen title={t('home.eyebrow')} scroll={false}>
        <View style={styles.centre}>
          <ActivityIndicator color={colors.brand} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen title={t('home.eyebrow')} subtitle={user.fullName}>
      {!isOnline ? <AlertBanner message={t('home.onlineOnly')} tone="info" /> : null}

      {profil.isError ? <AlertBanner message={t('home.loadError')} tone="error" /> : null}

      <View style={styles.carteAccueil}>
        <Text style={styles.salutation}>
          {t('home.greeting')}, {user.fullName}
        </Text>
        <Text style={styles.sousTitre}>{t('home.subtitle')}</Text>
      </View>

      <View style={styles.grille}>
        <View style={styles.stat}>
          <Text style={styles.statEtiquette}>{t('home.revenueToday')}</Text>
          <Text style={styles.statValeur}>{formatMGA(0)}</Text>
          <Text style={styles.statNote}>Sprint 4</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statEtiquette}>{t('home.pendingOperations')}</Text>
          <Text style={styles.statValeur}>0</Text>
          <Text style={styles.statNote}>Sprint 6</Text>
        </View>
      </View>

      <View style={styles.carte}>
        <Text style={styles.titreSection}>{t('home.account')}</Text>
        <View style={styles.ligne}>
          <Text style={styles.etiquette}>{t('home.email')}</Text>
          <Text style={styles.valeur}>{user.email}</Text>
        </View>
        <View style={styles.ligne}>
          <Text style={styles.etiquette}>{t('home.role')}</Text>
          <Text style={styles.valeur}>{LIBELLES_ROLE[user.role]}</Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  carteAccueil: {
    backgroundColor: colors.brand,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  salutation: { ...typography.title, color: colors.surface },
  sousTitre: { ...typography.body, color: '#d0d5dd' },
  grille: { flexDirection: 'row', gap: spacing.md },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    gap: 2,
  },
  statEtiquette: { ...typography.caption, color: colors.muted },
  statValeur: { ...typography.heading, color: colors.ink },
  statNote: { ...typography.caption, color: colors.muted },
  carte: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  titreSection: { ...typography.heading, color: colors.ink, marginBottom: spacing.xs },
  ligne: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  etiquette: {
    ...typography.caption,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '700',
    marginBottom: 2,
  },
  valeur: { ...typography.body, color: colors.ink, fontWeight: '600' },
});
