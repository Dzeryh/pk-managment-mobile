import { colors } from './colors';
import { radius, spacing, TOUCH_TARGET } from './spacing';
import { typography } from './typography';

export { colors } from './colors';
export type { ColorName } from './colors';
export { typography } from './typography';
export { spacing, radius, MIN_TOUCH_TARGET, TOUCH_TARGET } from './spacing';

/** Thème unique consommé par les écrans et composants partagés. */
export const theme = {
  colors,
  typography,
  spacing,
  radius,
  touchTarget: TOUCH_TARGET,
} as const;
