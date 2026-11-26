import type { User } from '../../../../shared/types/auth';
import { ApiError } from '../../../../core/api/errors';
import * as authApi from '../../api/auth-api';
import { useAuthStore } from '../auth-store';

jest.mock('../../api/auth-api', () => ({
  login: jest.fn(),
  restoreSession: jest.fn(),
  fetchCurrentUser: jest.fn(),
  logout: jest.fn(),
}));

const apiSimulee = authApi as jest.Mocked<typeof authApi>;

const UTILISATEUR: User = {
  id: '6f1c1c4e-1111-4111-8111-111111111111',
  email: 'admin@pk.local',
  fullName: 'Administrateur P&K',
  role: 'ADMIN',
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ status: 'signedOut', user: null, error: null });
});

describe('store d’authentification', () => {
  it('passe en « connecté » après un login réussi', async () => {
    apiSimulee.login.mockResolvedValue(UTILISATEUR);

    await expect(useAuthStore.getState().signIn('admin@pk.local', 'Admin1234')).resolves.toBe(true);

    const etat = useAuthStore.getState();
    expect(etat.status).toBe('signedIn');
    expect(etat.user).toEqual(UTILISATEUR);
    expect(etat.error).toBeNull();
  });

  it('expose le message français et reste déconnecté si le login échoue', async () => {
    apiSimulee.login.mockRejectedValue(
      new ApiError('Identifiants invalides.', { statusCode: 401, kind: 'unauthorized' }),
    );

    await expect(useAuthStore.getState().signIn('admin@pk.local', 'faux')).resolves.toBe(false);

    const etat = useAuthStore.getState();
    expect(etat.status).toBe('signedOut');
    expect(etat.user).toBeNull();
    expect(etat.error).toBe('Identifiants invalides.');
  });

  it('restaure une session existante', async () => {
    apiSimulee.restoreSession.mockResolvedValue(UTILISATEUR);

    await useAuthStore.getState().restore();

    const etat = useAuthStore.getState();
    expect(etat.status).toBe('signedIn');
    expect(etat.user).toEqual(UTILISATEUR);
  });

  it('reste anonyme quand aucune session n’est restaurable', async () => {
    apiSimulee.restoreSession.mockResolvedValue(null);

    await useAuthStore.getState().restore();

    expect(useAuthStore.getState().status).toBe('signedOut');
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('déconnecte localement même si l’appel serveur échoue', async () => {
    useAuthStore.setState({ status: 'signedIn', user: UTILISATEUR });
    apiSimulee.logout.mockRejectedValue(new ApiError('Impossible de contacter le serveur.'));

    await useAuthStore.getState().signOut();

    expect(apiSimulee.logout).toHaveBeenCalledTimes(1);
    const etat = useAuthStore.getState();
    expect(etat.status).toBe('signedOut');
    expect(etat.user).toBeNull();
  });

  it('revient au login quand la session expire', () => {
    useAuthStore.setState({ status: 'signedIn', user: UTILISATEUR });

    useAuthStore.getState().handleSessionExpired();

    expect(useAuthStore.getState().status).toBe('signedOut');
    expect(useAuthStore.getState().user).toBeNull();
  });
});
