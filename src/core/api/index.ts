export { request, refreshSession, onSessionExpired } from './client';
export type { RefreshOutcome } from './client';
export {
  ApiError,
  MESSAGE_GENERIQUE,
  MESSAGE_RESEAU,
  MESSAGE_SESSION_EXPIREE,
  MESSAGE_TROP_DE_TENTATIVES,
  apiErrorFromUnknown,
  errorMessage,
} from './errors';
export type { ApiErrorKind } from './errors';
