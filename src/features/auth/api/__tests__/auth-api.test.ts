import * as SecureStore from 'expo-secure-store';
import { fetchCurrentUser, login, logout, restoreSession } from '../auth-api';
import { clearTokenPair, readTokenPair, saveTokenPair } from '../../../../core/security/tokens';
import type { AuthResponse, User } from '../../../../shared/types/auth';

const UTILISATEUR: User = {
  id: '6f1c1c4e-1111-4111-8111-111111111111',
  email: 'admin@pk.local',
  fullName: 'Administrateur P&K',
  role: 'ADMIN',
};

const SESSION: AuthResponse = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token-value-1234567890',
  expiresIn: 900,
  user: UTILISATEUR,
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

describe('login', () => {
  it('envoie l’appareil, le client mobile et stocke le couple de jetons', async () => {
    fetchMock.mockResolvedValueOnce(reponseJson(SESSION));

    const utilisateur = await login({ email: '  Admin@PK.local ', password: 'Admin1234' });

    expect(utilisateur).toEqual(UTILISATEUR);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/api/auth/login');

    const corps = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(corps).toMatchObject({
      identifier: 'admin@pk.local',
      password: 'Admin1234',
      deviceId: '11111111-1111-4111-8111-111111111111',
      deviceName: 'Pixel Test',
    });
    expect(init.headers).toMatchObject({ 'X-Client-Type': 'mobile' });

    await expect(readTokenPair()).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token-value-1234567890',
    });
  });

  it('refuse une réponse sans refresh token', async () => {
    fetchMock.mockResolvedValueOnce(
      reponseJson({ ...SESSION, refreshToken: undefined }),
    );

    await expect(login({ email: 'admin@pk.local', password: 'x' })).rejects.toMatchObject({
      kind: 'server',
    });
    await expect(readTokenPair()).resolves.toBeNull();
  });

  it('propage le message d’identifiants invalides du backend', async () => {
    fetchMock.mockResolvedValueOnce(
      reponseJson({ message: 'Identifiants invalides.' }, 401),
    );

    await expect(login({ email: 'admin@pk.local', password: 'faux' })).rejects.toMatchObject({
      statusCode: 401,
      kind: 'unauthorized',
      message: 'Identifiants invalides.',
    });
  });
});

describe('restauration de session', () => {
  it('ne fait aucun appel sans jetons stockés', async () => {
    await expect(restoreSession()).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('effectue une rotation puis vérifie la session sur /me', async () => {
    await saveTokenPair({ accessToken: 'ancien-access', refreshToken: 'ancien-refresh' });

    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith('/auth/refresh')) {
        return reponseJson({
          accessToken: 'nouvel-access',
          refreshToken: 'nouveau-refresh',
          expiresIn: 900,
          user: UTILISATEUR,
        });
      }
      return reponseJson(UTILISATEUR);
    });

    await expect(restoreSession()).resolves.toEqual(UTILISATEUR);
    await expect(readTokenPair()).resolves.toEqual({
      accessToken: 'nouvel-access',
      refreshToken: 'nouveau-refresh',
    });
  });

  it('retourne null si le refresh est rejeté et efface les jetons', async () => {
    await saveTokenPair({ accessToken: 'ancien-access', refreshToken: 'ancien-refresh' });
    fetchMock.mockResolvedValueOnce(reponseJson({ message: 'Session révoquée.' }, 401));

    await expect(restoreSession()).resolves.toBeNull();
    await expect(readTokenPair()).resolves.toBeNull();
  });
});

describe('logout', () => {
  it('révoque côté serveur puis efface les jetons', async () => {
    await saveTokenPair({ accessToken: 'access-token', refreshToken: 'refresh-token-value-1234567890' });
    fetchMock.mockResolvedValueOnce({ ok: true, status: 204, json: async () => null });

    await logout();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/api/auth/logout');
    expect(JSON.parse(String(init.body))).toEqual({
      refreshToken: 'refresh-token-value-1234567890',
    });
    await expect(readTokenPair()).resolves.toBeNull();
  });

  it('efface les jetons même si le serveur est injoignable', async () => {
    await saveTokenPair({ accessToken: 'access-token', refreshToken: 'refresh-token-value-1234567890' });
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));

    await expect(logout()).rejects.toMatchObject({ kind: 'network' });
    await expect(readTokenPair()).resolves.toBeNull();
  });
});

describe('fetchCurrentUser', () => {
  it('ajoute le Bearer de l’access token', async () => {
    await saveTokenPair({ accessToken: 'access-token', refreshToken: 'refresh-token-value-1234567890' });
    fetchMock.mockResolvedValueOnce(reponseJson(UTILISATEUR));

    await expect(fetchCurrentUser()).resolves.toEqual(UTILISATEUR);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/api/me');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer access-token' });
  });
});
