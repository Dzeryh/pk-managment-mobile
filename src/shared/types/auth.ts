export type UserRole = 'ADMIN' | 'SELLER';

/** Objet utilisateur du contrat d'API. */
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

/**
 * Réponse de login/refresh. Le refresh token n'est présent que pour un client
 * mobile (`X-Client-Type: mobile`).
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: User;
}

/** Corps d'erreur uniforme du contrat. */
export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
}
