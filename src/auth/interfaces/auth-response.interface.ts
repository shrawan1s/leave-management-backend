import type { SafeUser } from '../../users/interfaces/safe-user.interface';

/**
 * Successful authentication payload returned after register or login.
 */
export interface AuthResponse {
  refreshToken: string;
  token: string;
  user: SafeUser;
}
