import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../config/env';

export type SecureKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Les données ne sont lisibles qu'appareil déverrouillé et ne quittent jamais
 * cet appareil (pas de sauvegarde iCloud/Google). Sur Android, SecureStore
 * s'appuie sur le Keystore système ; sur iOS, sur le Keychain.
 */
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export async function readSecure(cle: SecureKey): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(cle);
  } catch {
    return null;
  }
}

export async function writeSecure(cle: SecureKey, valeur: string): Promise<void> {
  await SecureStore.setItemAsync(cle, valeur, OPTIONS);
}

export async function removeSecure(cle: SecureKey): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(cle);
  } catch {
    // Une clé absente n'est pas une erreur : l'objectif reste « pas de jeton ».
  }
}
