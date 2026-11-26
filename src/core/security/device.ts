import { randomUUID } from 'expo-crypto';
import * as Device from 'expo-device';
import { STORAGE_KEYS } from '../config/env';
import { readSecure, writeSecure } from './secure-store';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Identifiant d'appareil stable : UUID v4 généré au premier lancement puis
 * conservé dans SecureStore. Ce n'est pas un secret, mais il ne doit jamais
 * changer sans réinstallation (le backend y rattache la session).
 */
export async function getDeviceId(): Promise<string> {
  const existant = await readSecure(STORAGE_KEYS.deviceId);

  if (existant !== null && UUID_V4.test(existant)) {
    return existant;
  }

  const identifiant = randomUUID();
  await writeSecure(STORAGE_KEYS.deviceId, identifiant);
  return identifiant;
}

/**
 * Nom lisible de l'appareil (modèle matériel quand il est disponible).
 * Ex. « Pixel 7 », « SM-G991B ». Utilisé pour lister les sessions côté backend.
 */
export function getDeviceName(): string {
  const nom = Device.modelName ?? Device.deviceName;

  if (typeof nom === 'string' && nom.trim().length > 0) {
    return nom.trim().slice(0, 120);
  }

  return 'Appareil Android';
}
