import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../core/theme';

interface AlertBannerProps {
  message: string;
  tone?: 'error' | 'success' | 'info';
  testID?: string;
}

/** Bandeau de message : erreur, succès ou information. */
export function AlertBanner({
  message,
  tone = 'error',
  testID,
}: AlertBannerProps): React.JSX.Element {
  return (
    <View
      style={[
        styles.base,
        tone === 'error' && styles.erreur,
        tone === 'success' && styles.succes,
        tone === 'info' && styles.info,
      ]}
      accessibilityRole="alert"
      testID={testID}
    >
      <Text
        style={[
          styles.texte,
          tone === 'error' && styles.texteErreur,
          tone === 'success' && styles.texteSucces,
          tone === 'info' && styles.texteInfo,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    borderWidth: 1,
    padding: spacing.md,
  },
  erreur: { backgroundColor: colors.dangerBackground, borderColor: colors.dangerBorder },
  succes: { backgroundColor: colors.successBackground, borderColor: colors.successBorder },
  info: { backgroundColor: colors.warningBackground, borderColor: colors.warningBorder },
  texte: { ...typography.body },
  texteErreur: { color: colors.dangerText },
  texteSucces: { color: colors.successText },
  texteInfo: { color: colors.warningText },
});
