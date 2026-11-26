import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing, theme, typography } from '../../core/theme';

interface ButtonProps extends Pick<PressableProps, 'onPress' | 'disabled' | 'testID'> {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
}

/** Bouton accessible, hauteur >= 48 px (cible tactile du projet). */
export function Button({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  testID,
  style,
}: ButtonProps): React.JSX.Element {
  const inactif = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactif, busy: loading }}
      disabled={inactif}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primaire,
        variant === 'secondary' && styles.secondaire,
        variant === 'ghost' && styles.discret,
        pressed && !inactif && styles.presse,
        inactif && styles.inactif,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.surface : colors.brand} />
      ) : (
        <Text
          style={[
            styles.texte,
            variant === 'primary' && styles.textePrimaire,
            variant !== 'primary' && styles.texteSecondaire,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: theme.touchTarget,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaire: { backgroundColor: colors.brand },
  secondaire: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  discret: { backgroundColor: 'transparent' },
  presse: { opacity: 0.75 },
  inactif: { opacity: 0.5 },
  texte: { ...typography.button },
  textePrimaire: { color: colors.surface },
  texteSecondaire: { color: colors.brand },
});
