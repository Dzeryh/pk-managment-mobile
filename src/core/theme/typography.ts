import type { TextStyle } from 'react-native';

/** Échelle typographique commune aux écrans mobiles. */
export const typography: Record<
  'display' | 'title' | 'heading' | 'subtitle' | 'body' | 'label' | 'caption' | 'button',
  TextStyle
> = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '800' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  subtitle: { fontSize: 15, lineHeight: 21, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  button: { fontSize: 16, lineHeight: 20, fontWeight: '700' },
};
