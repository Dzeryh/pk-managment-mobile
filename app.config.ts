import type { ExpoConfig } from 'expo/config';

/**
 * URL de l'API lue à la compilation.
 *
 * - Émulateur Android : http://10.0.2.2:3000/api (alias de la machine hôte)
 * - Téléphone physique : http://<IP-DU-POSTE>:3000/api
 * - Appareil réel sur un autre réseau : renseigner EXPO_PUBLIC_API_URL
 *
 * La valeur finit dans `expo.extra.apiUrl`, seul point de lecture de l'app
 * (voir `src/core/config/env.ts`). Ce n'est pas un secret.
 */
const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://10.0.2.2:3000/api';

const config: ExpoConfig = {
  name: 'P&K Business Manager',
  slug: 'pk-managment-mobile',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  scheme: 'pkmanager',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'mg.pk.businessmanager',
  },
  android: {
    package: 'mg.pk.businessmanager',
    adaptiveIcon: {
      backgroundColor: '#101828',
    },
  },
  plugins: ['expo-secure-store', 'expo-asset'],
  extra: {
    apiUrl: API_URL,
  },
};

export default config;
