/** Espacements en points (dp), multiples de 4. */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** Rayons de bordure. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

/**
 * Cible tactile minimale imposée par le projet : 44 px.
 * Tous les éléments interactifs utilisent 48 pour garder une marge.
 */
export const MIN_TOUCH_TARGET = 44;
export const TOUCH_TARGET = 48;
