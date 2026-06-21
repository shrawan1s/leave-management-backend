import { UserRole } from '../../common/enums/user-role.enum';

/**
 * User details attached to authenticated requests by JWT strategy.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}
