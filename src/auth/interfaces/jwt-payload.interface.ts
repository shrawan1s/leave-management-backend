import { UserRole } from '../../common/enums/user-role.enum';

/**
 * Claims stored inside issued JWT access tokens.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
