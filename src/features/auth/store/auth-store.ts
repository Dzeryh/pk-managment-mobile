import { create } from 'zustand';
import { onSessionExpired } from '../../../core/api/client';
import { errorMessage } from '../../../core/api/errors';
import type { User } from '../../../shared/types/auth';
import * as authApi from '../api/auth-api';

export type AuthStatus = 'restoring' | 'signedOut' | 'signedIn';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  error: string | null;
  /** Restaure la session persistée (appelé une fois au démarrage). */
  restore: () => Promise<void>;
  /** `true` si la connexion a réussi ; sinon `error` contient le message français. */
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
  replaceUser: (user: User) => void;
  handleSessionExpired: () => void;
}

/**
 * État d'authentification local (Zustand).
 * Les jetons ne sont PAS dans le store : ils vivent dans SecureStore et
 * `src/core/api/client.ts` les lit à chaque requête.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  status: 'restoring',
  user: null,
  error: null,

  restore: async () => {
    try {
      const user = await authApi.restoreSession();
      set({
        status: user === null ? 'signedOut' : 'signedIn',
        user,
        error: null,
      });
    } catch {
      set({ status: 'signedOut', user: null, error: null });
    }
  },

  signIn: async (email, password) => {
    set({ error: null });

    try {
      const user = await authApi.login({ email, password });
      set({ status: 'signedIn', user, error: null });
      return true;
    } catch (error) {
      set({ status: 'signedOut', user: null, error: errorMessage(error) });
      return false;
    }
  },

  signOut: async () => {
    try {
      await authApi.logout();
    } catch {
      // La session locale doit disparaître même si le serveur est injoignable.
      // TODO(S7) : ne jamais supprimer les opérations en attente non synchronisées.
    } finally {
      set({ status: 'signedOut', user: null, error: null });
    }
  },

  clearError: () => set({ error: null }),

  replaceUser: (user) => set({ user }),

  handleSessionExpired: () => set({ status: 'signedOut', user: null, error: null }),
}));

/**
 * Relie l'expiration détectée par le client HTTP (refresh rejeté) au store :
 * l'application revient alors à l'écran de connexion.
 */
export function subscribeToSessionExpiry(): () => void {
  return onSessionExpired(() => {
    useAuthStore.getState().handleSessionExpired();
  });
}
