import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { ApiError } from '../../../../core/api/errors';
import type { User } from '../../../../shared/types/auth';
import * as authApi from '../../api/auth-api';
import { useAuthStore } from '../../store/auth-store';
import { LoginScreen } from '../login-screen';

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

describe('écran de connexion', () => {
  it('valide les champs vides sans appeler l’API', async () => {
    const ecran = await render(<LoginScreen />);

    await fireEvent.press(ecran.getByTestId('login-submit'));

    await waitFor(() => {
      expect(ecran.getByText('Saisissez votre adresse e-mail.')).toBeTruthy();
      expect(ecran.getByText('Saisissez votre mot de passe.')).toBeTruthy();
    });
    expect(apiSimulee.login).not.toHaveBeenCalled();
  });

  it('refuse une adresse e-mail mal formée', async () => {
    const ecran = await render(<LoginScreen />);

    await fireEvent.changeText(ecran.getByTestId('login-email'), 'pas-un-email');
    await fireEvent.changeText(ecran.getByTestId('login-password'), 'Admin1234');
    await fireEvent.press(ecran.getByTestId('login-submit'));

    await waitFor(() => {
      expect(ecran.getByText('Saisissez une adresse e-mail valide.')).toBeTruthy();
    });
    expect(apiSimulee.login).not.toHaveBeenCalled();
  });

  it('connecte l’utilisateur et bascule le store en « connecté »', async () => {
    apiSimulee.login.mockResolvedValue(UTILISATEUR);

    const ecran = await render(<LoginScreen />);
    await fireEvent.changeText(ecran.getByTestId('login-email'), 'admin@pk.local');
    await fireEvent.changeText(ecran.getByTestId('login-password'), 'Admin1234');
    await fireEvent.press(ecran.getByTestId('login-submit'));

    await waitFor(() => {
      expect(useAuthStore.getState().status).toBe('signedIn');
    });

    expect(apiSimulee.login).toHaveBeenCalledWith({
      email: 'admin@pk.local',
      password: 'Admin1234',
    });
    expect(ecran.queryByTestId('login-error')).toBeNull();
  });

  it('affiche le message d’identifiants invalides', async () => {
    apiSimulee.login.mockRejectedValue(
      new ApiError('Identifiants invalides.', { statusCode: 401, kind: 'unauthorized' }),
    );

    const ecran = await render(<LoginScreen />);
    await fireEvent.changeText(ecran.getByTestId('login-email'), 'admin@pk.local');
    await fireEvent.changeText(ecran.getByTestId('login-password'), 'faux');
    await fireEvent.press(ecran.getByTestId('login-submit'));

    expect(await ecran.findByText('Identifiants invalides.')).toBeTruthy();
    expect(useAuthStore.getState().status).toBe('signedOut');
  });

  it('affiche le message de trop de tentatives (429)', async () => {
    const message = 'Trop de tentatives. Patientez un instant avant de réessayer.';
    apiSimulee.login.mockRejectedValue(
      new ApiError(message, { statusCode: 429, kind: 'rateLimited' }),
    );

    const ecran = await render(<LoginScreen />);
    await fireEvent.changeText(ecran.getByTestId('login-email'), 'admin@pk.local');
    await fireEvent.changeText(ecran.getByTestId('login-password'), 'Admin1234');
    await fireEvent.press(ecran.getByTestId('login-submit'));

    expect(await ecran.findByText(message)).toBeTruthy();
  });
});
