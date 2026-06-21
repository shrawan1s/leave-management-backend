import type { AuthenticatedUser } from './authenticated-user.interface';

/**
 * User details attached to requests authenticated with a refresh token.
 */
export interface RefreshTokenUser extends AuthenticatedUser {
  refreshToken: string;
}
