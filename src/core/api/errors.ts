import type { ApiErrorBody } from '../../shared/types/auth';

export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'rateLimited'
  | 'server'
  | 'unknown';

interface ApiErrorOptions {
  statusCode?: number | null;
  kind?: ApiErrorKind;
  details?: string[];
}

/**
 * Erreur applicative : `message` est déjà en français et peut être affichée
 * telle quelle. `statusCode` vaut `null` quand la requête n'a pas abouti.
 */
export class ApiError extends Error {
  readonly statusCode: number | null;
  readonly kind: ApiErrorKind;
  readonly details: string[];

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = options.statusCode ?? null;
    this.kind = options.kind ?? 'unknown';
    this.details = options.details ?? [];
  }
}

export const MESSAGE_RESEAU = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
export const MESSAGE_DELAI = 'Le serveur met trop de temps à répondre. Réessayez.';
export const MESSAGE_GENERIQUE = 'Une erreur est survenue. Réessayez plus tard.';
export const MESSAGE_TROP_DE_TENTATIVES =
  'Trop de tentatives. Patientez un instant avant de réessayer.';
export const MESSAGE_SESSION_EXPIREE = 'Votre session a expiré. Reconnectez-vous.';
export const MESSAGE_INTERDIT = 'Vous n’avez pas les droits nécessaires pour cette action.';

export function networkError(): ApiError {
  return new ApiError(MESSAGE_RESEAU, { kind: 'network' });
}

export function timeoutError(): ApiError {
  return new ApiError(MESSAGE_DELAI, { kind: 'timeout' });
}

function kindDepuisStatut(statut: number): ApiErrorKind {
  if (statut === 400 || statut === 422) {
    return 'validation';
  }
  if (statut === 401) {
    return 'unauthorized';
  }
  if (statut === 403) {
    return 'forbidden';
  }
  if (statut === 429) {
    return 'rateLimited';
  }
  if (statut >= 500) {
    return 'server';
  }
  return 'unknown';
}

function messagesDepuisCorps(corps: unknown): string[] {
  if (typeof corps !== 'object' || corps === null) {
    return [];
  }

  const { message } = corps as Partial<ApiErrorBody>;

  if (Array.isArray(message)) {
    return message.filter((element): element is string => typeof element === 'string');
  }

  if (typeof message === 'string' && message.length > 0) {
    return [message];
  }

  return [];
}

/**
 * Convertit une réponse HTTP en erreur française.
 * Un message métier renvoyé par le backend (déjà en français) est conservé ;
 * les statuts sans message exploitable reçoivent un texte par défaut.
 */
export function apiErrorFromResponse(statut: number, corps: unknown): ApiError {
  const kind = kindDepuisStatut(statut);
  const messages = messagesDepuisCorps(corps);

  const defaut =
    kind === 'rateLimited'
      ? MESSAGE_TROP_DE_TENTATIVES
      : kind === 'unauthorized'
        ? MESSAGE_SESSION_EXPIREE
        : kind === 'forbidden'
          ? MESSAGE_INTERDIT
          : kind === 'server'
            ? MESSAGE_GENERIQUE
            : MESSAGE_GENERIQUE;

  return new ApiError(messages[0] ?? defaut, {
    statusCode: statut,
    kind,
    details: messages,
  });
}

/** Normalise n'importe quelle exception en `ApiError` affichable. */
export function apiErrorFromUnknown(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return timeoutError();
  }

  return new ApiError(MESSAGE_GENERIQUE, { kind: 'unknown' });
}

/** Message prêt à afficher pour une erreur quelconque. */
export function errorMessage(error: unknown): string {
  return apiErrorFromUnknown(error).message;
}
