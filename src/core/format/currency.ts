const FORMATEUR_MGA = new Intl.NumberFormat('fr-MG', {
  style: 'currency',
  currency: 'MGA',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Formate un montant en ariary, SANS décimales (règle du projet).
 * Implémentation identique à `pk-managment-frontend/src/utils/currency.ts` :
 * 125000 -> « 125 000 Ar ».
 */
export function formatMGA(montant: number): string {
  if (!Number.isFinite(montant)) {
    return FORMATEUR_MGA.format(0);
  }

  return FORMATEUR_MGA.format(Math.round(montant));
}
