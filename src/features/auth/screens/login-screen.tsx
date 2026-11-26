import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from '../../../core/i18n';
import { colors, radius, spacing, typography } from '../../../core/theme';
import { AlertBanner, AppHeader, Button, TextField } from '../../../shared/components';
import { useAuthStore } from '../store/auth-store';

const FORMAT_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ErreursChamps {
  email?: string;
  password?: string;
}

/**
 * Écran de connexion.
 * Le nom et l'identifiant de l'appareil sont gérés par le service d'auth :
 * l'utilisateur ne saisit que son e-mail et son mot de passe.
 */
export function LoginScreen(): React.JSX.Element {
  const signIn = useAuthStore((etat) => etat.signIn);
  const erreur = useAuthStore((etat) => etat.error);
  const clearError = useAuthStore((etat) => etat.clearError);

  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreurs, setErreurs] = useState<ErreursChamps>({});
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(): Promise<void> {
    if (envoi) {
      return;
    }

    const emailNettoye = email.trim();
    const prochainesErreurs: ErreursChamps = {};

    if (emailNettoye.length === 0) {
      prochainesErreurs.email = t('auth.error.emailRequired');
    } else if (!FORMAT_EMAIL.test(emailNettoye)) {
      prochainesErreurs.email = t('auth.error.emailInvalid');
    }

    if (motDePasse.length === 0) {
      prochainesErreurs.password = t('auth.error.passwordRequired');
    }

    setErreurs(prochainesErreurs);

    if (Object.keys(prochainesErreurs).length > 0) {
      return;
    }

    clearError();
    setEnvoi(true);
    await signIn(emailNettoye, motDePasse);
    setEnvoi(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <AppHeader title={t('app.name')} subtitle={t('app.tagline')} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.contenu}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.carte}>
            <Text style={styles.titre}>{t('auth.login.title')}</Text>
            <Text style={styles.sousTitre}>{t('auth.login.subtitle')}</Text>

            <View style={styles.champs}>
              <TextField
                label={t('auth.login.email')}
                value={email}
                onChangeText={setEmail}
                placeholder={t('auth.login.emailPlaceholder')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                editable={!envoi}
                error={erreurs.email ?? null}
                testID="login-email"
              />

              <TextField
                label={t('auth.login.password')}
                value={motDePasse}
                onChangeText={setMotDePasse}
                placeholder={t('auth.login.passwordPlaceholder')}
                secureTextEntry
                autoCapitalize="none"
                textContentType="password"
                editable={!envoi}
                error={erreurs.password ?? null}
                onSubmitEditing={() => void soumettre()}
                testID="login-password"
              />
            </View>

            {erreur !== null ? (
              <AlertBanner message={erreur} tone="error" testID="login-error" />
            ) : null}

            <Button
              label={envoi ? t('auth.login.submitting') : t('auth.login.submit')}
              onPress={() => void soumettre()}
              loading={envoi}
              testID="login-submit"
              style={styles.bouton}
            />
          </View>

          <Text style={styles.pied}>{t('app.footer')}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  contenu: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  carte: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    gap: spacing.md,
  },
  titre: { ...typography.title, color: colors.ink },
  sousTitre: { ...typography.body, color: colors.muted, marginTop: -spacing.sm },
  champs: { gap: spacing.md },
  bouton: { marginTop: spacing.xs },
  pied: { ...typography.caption, color: colors.muted, textAlign: 'center' },
});
