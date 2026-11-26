import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { useConnectivity } from '../../../core/connectivity/use-connectivity';
import { t } from '../../../core/i18n';
import { colors, radius, spacing, typography } from '../../../core/theme';
import { AppScreen, Button } from '../../../shared/components';
import { useAuthStore } from '../../auth/store/auth-store';

const LIBELLES_ROLE: Record<'ADMIN' | 'SELLER', string> = {
  ADMIN: t('roles.admin'),
  SELLER: t('roles.seller'),
};

/** Onglet « Plus » : compte, connectivité, déconnexion. */
export function MoreScreen(): React.JSX.Element {
  const user = useAuthStore((etat) => etat.user);
  const signOut = useAuthStore((etat) => etat.signOut);
  const { isOnline } = useConnectivity();
  const [deconnexionEnCours, setDeconnexionEnCours] = useState(false);

  const version = Constants.expoConfig?.version ?? '0.1.0';

  async function seDeconnecter(): Promise<void> {
    setDeconnexionEnCours(true);
    await signOut();
  }

  function confirmerDeconnexion(): void {
    Alert.alert(t('auth.logout'), t('more.logoutHint'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.logout'),
        style: 'destructive',
        onPress: () => void seDeconnecter(),
      },
    ]);
  }

  return (
    <AppScreen title={t('more.title')}>
      <View style={styles.carte}>
        <Text style={styles.titreSection}>{t('more.account')}</Text>
        <Ligne etiquette={t('home.email')} valeur={user?.email ?? '—'} />
        <Ligne etiquette={t('home.role')} valeur={user !== null ? LIBELLES_ROLE[user.role] : '—'} />
      </View>

      <View style={styles.carte}>
        <Text style={styles.titreSection}>{t('more.session')}</Text>
        <Ligne
          etiquette={t('more.network')}
          valeur={isOnline ? t('connectivity.online') : t('connectivity.offline')}
        />
        <Ligne etiquette={t('more.version')} valeur={version} />
      </View>

      <Button
        label={deconnexionEnCours ? t('auth.logout.pending') : t('auth.logout')}
        variant="secondary"
        loading={deconnexionEnCours}
        onPress={confirmerDeconnexion}
        testID="more-logout"
      />
    </AppScreen>
  );
}

interface LigneProps {
  etiquette: string;
  valeur: string;
}

function Ligne({ etiquette, valeur }: LigneProps): React.JSX.Element {
  return (
    <View style={styles.ligne}>
      <Text style={styles.etiquette}>{etiquette}</Text>
      <Text style={styles.valeur}>{valeur}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
