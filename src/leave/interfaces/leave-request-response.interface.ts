import { LeaveStatus } from '../../common/enums/leave-status.enum';
import { LeaveType } from '../../common/enums/leave-type.enum';
import type { LeaveRequestEmployee } from './leave-request-employee.interface';

/**
 * Public leave request shape returned by leave endpoints.
 */
export interface LeaveRequestResponse {
  id: string;
  employeeId: string;
  employee?: LeaveRequestEmployee;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: LeaveStatus;
  adminComment?: string;
  createdAt: Date;
  updatedAt: Date;
}
