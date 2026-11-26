import { fr } from './fr';
import type { TranslationKey } from './fr';

export type Locale = 'fr' | 'mg';

/** Le malgache est préparé mais vide : il retombe sur le français. */
const mg: Partial<Record<TranslationKey, string>> = {};

const dictionnaires: Record<Locale, Partial<Record<TranslationKey, string>>> = { fr, mg };

let localeCourante: Locale = 'fr';

export function setLocale(locale: Locale): void {
  localeCourante = locale;
}

export function getLocale(): Locale {
  return localeCourante;
}

/**
 * Traduit une clé dans la langue courante.
 * Une clé absente de la langue courante retombe sur le français.
 */
export function t(cle: TranslationKey): string {
  return dictionnaires[localeCourante][cle] ?? fr[cle];
}

export type { TranslationKey };
