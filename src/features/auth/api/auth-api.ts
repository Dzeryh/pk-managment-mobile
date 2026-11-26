import type { AuthResponse, User } from '../../../shared/types/auth';
import { ApiError } from '../../../core/api/errors';
import { refreshSession, request } from '../../../core/api/client';
import { getDeviceId, getDeviceName } from '../../../core/security/device';
import { clearTokenPair, readTokenPair, saveTokenPair } from '../../../core/security/tokens';

export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Connexion mobile.
 * Le refresh token revient dans le corps (X-Client-Type: mobile) et part
 * immédiatement dans SecureStore avec l'access token.
 */
export async function login(input: LoginInput): Promise<User> {
  const session = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: {
      identifier: input.email.trim().toLowerCase(),
      password: input.password,
      deviceId: await getDeviceId(),
      deviceName: getDeviceName(),
    },
  });

  if (typeof session.refreshToken !== 'string' || session.refreshToken.length === 0) {
    throw new ApiError('Le serveur n’a pas renvoyé de refresh token.', {
      kind: 'server',
      statusCode: 500,
    });
  }

  await saveTokenPair({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  });

  return session.user;
}

/**
 * Restauration au démarrage : si des jetons existent, on effectue une rotation
 * puis on vérifie la session avec `/api/me`. Retourne `null` si la session
 * n'est plus valide ou si le serveur est injoignable (les jetons valides sont
 * alors conservés pour une tentative ultérieure).
 */
export async function restoreSession(): Promise<User | null> {
  if ((await readTokenPair()) === null) {
    return null;
  }

  const resultat = await refreshSession();

  if (resultat !== 'refreshed') {
    return null;
  }

  return fetchCurrentUser();
}

export async function fetchCurrentUser(): Promise<User> {
  return request<User>('/me', { authenticated: true });
}

/**
 * Déconnexion : révoque la session côté serveur puis efface les jetons locaux.
 * Les jetons locaux sont effacés même si le serveur est injoignable.
 */
export async function logout(): Promise<void> {
  const paire = await readTokenPair();

  try {
    if (paire !== null) {
      await request<void>('/auth/logout', {
        method: 'POST',
        body: { refreshToken: paire.refreshToken },
      });
    }
  } finally {
    // TODO(S7) : la déconnexion ne devra jamais supprimer les opérations en
    // attente non synchronisées ; seul l'état de session doit être effacé.
    await clearTokenPair();
  }
}
