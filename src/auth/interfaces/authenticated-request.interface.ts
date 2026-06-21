import type { Request } from 'express';
import type { AuthenticatedUser } from './authenticated-user.interface';

/**
 * Express request carrying the authenticated user injected by Passport.
 */
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
