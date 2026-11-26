import * as SecureStore from 'expo-secure-store';
import { onSessionExpired, request } from '../client';
import { MESSAGE_DELAI, MESSAGE_RESEAU } from '../errors';
import { clearTokenPair, readTokenPair, saveTokenPair } from '../../security/tokens';
import type { User } from '../../../shared/types/auth';

const UTILISATEUR: User = {
  id: '6f1c1c4e-1111-4111-8111-111111111111',
  email: 'admin@pk.local',
  fullName: 'Administrateur P&K',
  role: 'ADMIN',
};

function reponseJson(corps: unknown, statut = 200): Response {
  return {
    ok: statut >= 200 && statut < 300,
    status: statut,
    json: async () => corps,
  } as unknown as Response;
}

const secureStore = SecureStore as unknown as { __vider: () => void };
const fetchMock = jest.fn();

beforeEach(async () => {
  await clearTokenPair();
  secureStore.__vider();
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
});

describe('client HTTP', () => {
  it('envoie X-Client-Type: mobile sur chaque requête', async () => {
    fetchMock.mockResolvedValueOnce(reponseJson({ status: 'ok' }));

    await request('/health');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/api/health');
    expect(init.method).toBe('GET');
    expect(init.headers).toMatchObject({
      'X-Client-Type': 'mobile',
      Accept: 'application/json',
    });
  });

  it('retourne undefined sur 204', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 204, json: async () => null });

    await expect(request('/auth/logout', { method: 'POST' })).resolves.toBeUndefined();
  });

  it('conserve le message français du backend sur 429', async () => {
    const message = 'Trop de tentatives. Patientez un instant avant de réessayer.';
    fetchMock.mockResolvedValueOnce(reponseJson({ message }, 429));

    await expect(request('/auth/login', { method: 'POST', body: {} })).rejects.toMatchObject({
      statusCode: 429,
      kind: 'rateLimited',
      message,
    });
  });

  it('convertit une panne réseau en erreur française', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));

    await expect(request('/health')).rejects.toMatchObject({
      kind: 'network',
      message: MESSAGE_RESEAU,
    });
  });

  it('convertit un abandon (timeout) en message dédié', async () => {
    const abandon = new Error('Aborted');
    abandon.name = 'AbortError';
    fetchMock.mockRejectedValueOnce(abandon);

    await expect(request('/health')).rejects.toMatchObject({
      kind: 'timeout',
      message: MESSAGE_DELAI,
    });
  });
});

describe('rotation du refresh token', () => {
  it('ne déclenche qu’une rotation pour plusieurs 401 simultanés', async () => {
    await saveTokenPair({ accessToken: 'access-1', refreshToken: 'refresh-1' });

    let rotations = 0;

    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/auth/refresh')) {
        rotations += 1;
        return reponseJson({
          accessToken: 'access-2',
          refreshToken: 'refresh-2',
          expiresIn: 900,
          user: UTILISATEUR,
        });
      }

      const entetes = (init?.headers ?? {}) as Record<string, string>;

      if (entetes.Authorization === 'Bearer access-1') {
        return reponseJson({ message: 'Jeton expiré.' }, 401);
      }

      return reponseJson(UTILISATEUR);
    });

    const resultats = await Promise.all([
      request<User>('/me', { authenticated: true }),
      request<User>('/me', { authenticated: true }),
      request<User>('/me', { authenticated: true }),
    ]);

    expect(resultats).toEqual([UTILISATEUR, UTILISATEUR, UTILISATEUR]);
    expect(rotations).toBe(1);
    await expect(readTokenPair()).resolves.toEqual({
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
    });
  });

  it('efface la session et prévient l’application quand le refresh est rejeté', async () => {
    await saveTokenPair({ accessToken: 'access-1', refreshToken: 'refresh-1' });

    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith('/auth/refresh')) {
        return reponseJson({ message: 'Session révoquée.' }, 401);
      }
      return reponseJson({ message: 'Non authentifié.' }, 401);
    });

    const expiration = jest.fn();
    const desabonner = onSessionExpired(expiration);

    await expect(request('/me', { authenticated: true })).rejects.toMatchObject({
      statusCode: 401,
    });

    expect(expiration).toHaveBeenCalledTimes(1);
    await expect(readTokenPair()).resolves.toBeNull();

    desabonner();
  });

  it('conserve les jetons quand la rotation échoue pour cause de réseau', async () => {
    await saveTokenPair({ accessToken: 'access-1', refreshToken: 'refresh-1' });

    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith('/auth/refresh')) {
        throw new TypeError('Network request failed');
      }
      return reponseJson({ message: 'Non authentifié.' }, 401);
    });

    const expiration = jest.fn();
    const desabonner = onSessionExpired(expiration);

    await expect(request('/me', { authenticated: true })).rejects.toMatchObject({
      statusCode: 401,
    });

    expect(expiration).not.toHaveBeenCalled();
    await expect(readTokenPair()).resolves.toEqual({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    });

    desabonner();
  });
});
