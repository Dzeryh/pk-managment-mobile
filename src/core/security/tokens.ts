import { STORAGE_KEYS } from '../config/env';
import { readSecure, removeSecure, writeSecure } from './secure-store';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Cache mémoire du seul access token, pour construire l'en-tête Authorization
 * de façon synchrone. La source de vérité reste SecureStore : rien n'est écrit
 * sur le disque en dehors de SecureStore.
 */
let accessTokenEnCache: string | null = null;

export async function saveTokenPair(paire: TokenPair): Promise<void> {
  await writeSecure(STORAGE_KEYS.accessToken, paire.accessToken);
  await writeSecure(STORAGE_KEYS.refreshToken, paire.refreshToken);
  accessTokenEnCache = paire.accessToken;
}

export async function readTokenPair(): Promise<TokenPair | null> {
  const [accessToken, refreshToken] = await Promise.all([
    readSecure(STORAGE_KEYS.accessToken),
    readSecure(STORAGE_KEYS.refreshToken),
  ]);

  if (accessToken === null || refreshToken === null) {
    return null;
  }

  return { accessToken, refreshToken };
}

export async function getAccessToken(): Promise<string | null> {
  if (accessTokenEnCache !== null) {
    return accessTokenEnCache;
  }

  accessTokenEnCache = await readSecure(STORAGE_KEYS.accessToken);
  return accessTokenEnCache;
}

export async function hasStoredSession(): Promise<boolean> {
  return (await readTokenPair()) !== null;
}

export async function clearTokenPair(): Promise<void> {
  accessTokenEnCache = null;
  await Promise.all([
    removeSecure(STORAGE_KEYS.accessToken),
    removeSecure(STORAGE_KEYS.refreshToken),
  ]);
}
