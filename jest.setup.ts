/**
 * Mocks des modules natifs : SecureStore, appareil, réseau, configuration.
 *
 * Ils sont déterministes et sans état partagé entre fichiers de test : chaque
 * test repart d'un SecureStore vide via `resetSecureStore()`.
 */

jest.mock('expo-secure-store', () => {
  const memoire = new Map<string, string>();

  return {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
    getItemAsync: jest.fn(async (cle: string) => memoire.get(cle) ?? null),
    setItemAsync: jest.fn(async (cle: string, valeur: string) => {
      memoire.set(cle, valeur);
    }),
    deleteItemAsync: jest.fn(async (cle: string) => {
      memoire.delete(cle);
    }),
    __vider: () => memoire.clear(),
  };
});

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => '11111111-1111-4111-8111-111111111111'),
}));

jest.mock('expo-device', () => ({
  modelName: 'Pixel Test',
  deviceName: 'Pixel Test',
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      apiUrl: 'http://api.test/api',
    },
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: () => ({ isConnected: true, isInternetReachable: true }),
  addEventListener: jest.fn(() => () => undefined),
  fetch: jest.fn(async () => ({ isConnected: true, isInternetReachable: true })),
}));

/** Vide le SecureStore simulé (à appeler dans `beforeEach`). */
export function resetSecureStore(): void {
  const store = jest.requireMock('expo-secure-store') as { __vider: () => void };
  store.__vider();
}
