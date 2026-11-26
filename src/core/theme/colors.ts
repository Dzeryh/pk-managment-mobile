/**
 * Palette de la marque P&K Fashion and Tech.
 * Contrastes vérifiés sur fond clair (ratio texte/fond >= 4.5:1).
 */
export const colors = {
  brand: '#101828',
  brandSoft: '#1d2939',
  accent: '#f5b942',
  ink: '#1f2937',
  inkSoft: '#344054',
  muted: '#667085',
  line: '#e4e7ec',
  background: '#f7f7f8',
  surface: '#ffffff',
  surfaceMuted: '#fcfcfd',
  dangerBackground: '#fef3f2',
  dangerBorder: '#fecdca',
  dangerText: '#b42318',
  successBackground: '#ecfdf3',
  successBorder: '#abefc6',
  successText: '#067647',
  warningBackground: '#fffaeb',
  warningBorder: '#fedf89',
  warningText: '#b54708',
  online: '#067647',
  offline: '#b54708',
  overlay: 'rgba(16, 24, 40, 0.55)',
} as const;

export type ColorName = keyof typeof colors;
