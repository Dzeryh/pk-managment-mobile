import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../core/theme';

interface TextFieldProps extends Pick<
  TextInputProps,
  | 'value'
  | 'onChangeText'
  | 'placeholder'
  | 'secureTextEntry'
  | 'keyboardType'
  | 'autoCapitalize'
  | 'autoCorrect'
  | 'textContentType'
  | 'editable'
  | 'onSubmitEditing'
  | 'maxLength'
  | 'testID'
  | 'accessibilityLabel'
> {
  label: string;
  error?: string | null;
}

/** Champ de formulaire libellé, hauteur >= 48 px, message d'erreur français. */
export function TextField({ label, error, ...props }: TextFieldProps): React.JSX.Element {
  return (
    <View style={styles.conteneur}>
      <Text style={styles.etiquette}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.champ, error !== null && error !== undefined ? styles.champErreur : null]}
        placeholderTextColor={colors.muted}
        accessibilityLabel={props.accessibilityLabel ?? label}
      />
      {error !== null && error !== undefined ? (
        <Text style={styles.erreur}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { gap: spacing.xs },
  etiquette: { ...typography.label, color: colors.inkSoft },
  champ: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 16,
  },
  champErreur: { borderColor: colors.dangerBorder },
  erreur: { ...typography.caption, color: colors.dangerText },
});
