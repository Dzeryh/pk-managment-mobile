import Constants from 'expo-constants';

interface ConfigurationSupplementaire {
  apiUrl?: unknown;
}

const URL_PAR_DEFAUT = 'http://10.0.2.2:3000/api';

const extra = Constants.expoConfig?.extra as ConfigurationSupplementaire | undefined;

function resoudreUrlApi(): string {
  const depuisConfig = typeof extra?.apiUrl === 'string' ? extra.apiUrl : undefined;
  const depuisEnvironnement = process.env.EXPO_PUBLIC_API_URL;
  const valeur = (depuisConfig ?? depuisEnvironnement ?? URL_PAR_DEFAUT).trim();

  return valeur.endsWith('/') ? valeur.slice(0, -1) : valeur;
}

/**
 * Base de l'API, sans slash final (les chemins commencent par `/`).
 * Renseignée par `app.config.ts` depuis `EXPO_PUBLIC_API_URL`.
 */
export const API_URL = resoudreUrlApi();

/** Délai maximal d'une requête HTTP avant abandon. */
export const REQUEST_TIMEOUT_MS = 15_000;

/** Clés SecureStore : préfixées pour ne pas heurter d'autres applications. */
export const STORAGE_KEYS = {
  accessToken: 'pk.access-token',
  refreshToken: 'pk.refresh-token',
  deviceId: 'pk.device-id',
} as const;
