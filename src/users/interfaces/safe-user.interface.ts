import { UserRole } from '../../common/enums/user-role.enum';

/**
 * User shape returned by API responses after removing sensitive fields.
 */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  joinDate: Date;
  leaveBalance: number;
  createdAt: Date;
  updatedAt: Date;
}
