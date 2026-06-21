import { UserRole } from '../../common/enums/user-role.enum';

/**
 * Internal payload used when creating a user document.
 */
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  department: string;
  joinDate: Date;
}
