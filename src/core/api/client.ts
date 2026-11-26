import type { AuthResponse } from '../../shared/types/auth';
import { API_URL, REQUEST_TIMEOUT_MS } from '../config/env';
import { getDeviceId } from '../security/device';
import {
  clearTokenPair,
  getAccessToken,
  readTokenPair,
  saveTokenPair,
} from '../security/tokens';
import {
  ApiError,
  apiErrorFromResponse,
  apiErrorFromUnknown,
  networkError,
  timeoutError,
} from './errors';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  authenticated?: boolean;
  /** Usage interne : empêche une boucle de rejeu après rotation. */
  retried?: boolean;
}

interface SendOptions {
  method: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

export type RefreshOutcome = 'refreshed' | 'rejected' | 'unavailable';

const listenersExpiration = new Set<() => void>();
let rafraichissementEnCours: Promise<RefreshOutcome> | null = null;

/**
 * Prévient l'application que la session n'est plus valide (refresh rejeté).
 * L'écouteur typique remet le store d'authentification à « déconnecté ».
 */
export function onSessionExpired(listener: () => void): () => void {
  listenersExpiration.add(listener);
  return () => {
    listenersExpiration.delete(listener);
  };
}

function notifierExpiration(): void {
  for (const listener of listenersExpiration) {
    listener();
  }
}

/**
 * Requête HTTP unique vers l'API.
 * - `X-Client-Type: mobile` sur chaque appel (le backend renvoie alors le
 *   refresh token dans le corps).
 * - Délai maximal de 15 s, erreurs converties en `ApiError` françaises.
 */
async function send<T>(chemin: string, options: SendOptions): Promise<T> {
  const controleur = new AbortController();
  const minuterie = setTimeout(() => controleur.abort(), REQUEST_TIMEOUT_MS);

  try {
    const reponse = await fetch(`${API_URL}${chemin}`, {
      method: options.method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Client-Type': 'mobile',
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controleur.signal,
    });

    if (reponse.status === 204) {
      return undefined as T;
    }

    const corps: unknown = await reponse.json().catch(() => null);

    if (!reponse.ok) {
      throw apiErrorFromResponse(reponse.status, corps);
    }

    return corps as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw timeoutError();
    }
    throw networkError();
  } finally {
    clearTimeout(minuterie);
  }
}

/**
 * Appel authentifié : sur 401, tente UNE rotation du refresh token puis
 * rejoue la requête. Si le serveur rejette le refresh, la session est effacée
 * et l'application est prévenue. Une panne réseau conserve la session : le
 * jeton n'a pas été invalidé.
 */
export async function request<T>(chemin: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};

  if (options.authenticated === true) {
    const jeton = await getAccessToken();
    if (jeton !== null) {
      headers.Authorization = `Bearer ${jeton}`;
    }
  }

  try {
    return await send<T>(chemin, {
      method: options.method ?? 'GET',
      body: options.body,
      headers,
    });
  } catch (error) {
    const erreur = apiErrorFromUnknown(error);

    if (
      options.authenticated === true &&
      options.retried !== true &&
      erreur.statusCode === 401
    ) {
      const resultat = await refreshSession();

      if (resultat === 'refreshed') {
        return request<T>(chemin, { ...options, retried: true });
      }

      if (resultat === 'rejected') {
        notifierExpiration();
      }
    }

    throw erreur;
  }
}

/**
 * Rotation du refresh token, « single flight » : plusieurs appels simultanés
 * en 401 déclenchent UNE seule requête `/auth/refresh`. Rejouer un jeton déjà
 * consommé ferait révoquer la session par le backend.
 */
export function refreshSession(): Promise<RefreshOutcome> {
  if (rafraichissementEnCours === null) {
    rafraichissementEnCours = executerRafraichissement().finally(() => {
      rafraichissementEnCours = null;
    });
  }

  return rafraichissementEnCours;
}

async function executerRafraichissement(): Promise<RefreshOutcome> {
  const paire = await readTokenPair();

  if (paire === null) {
    return 'rejected';
  }

  try {
    const session = await send<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: {
        refreshToken: paire.refreshToken,
        deviceId: await getDeviceId(),
      },
    });

    if (typeof session.refreshToken !== 'string' || session.refreshToken.length === 0) {
      await clearTokenPair();
      return 'rejected';
    }

    await saveTokenPair({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });

    return 'refreshed';
  } catch (error) {
    const erreur = apiErrorFromUnknown(error);

    // 4xx (hors 429) = le serveur refuse le jeton : la session est morte.
    if (
      erreur.statusCode !== null &&
      erreur.statusCode >= 400 &&
      erreur.statusCode < 500 &&
      erreur.statusCode !== 429
    ) {
      await clearTokenPair();
      return 'rejected';
    }

    // Réseau, délai, 5xx, 429 : le jeton peut encore être valide.
    return 'unavailable';
  }
}
