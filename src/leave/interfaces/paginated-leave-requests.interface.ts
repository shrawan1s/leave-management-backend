import type { LeaveRequestResponse } from './leave-request-response.interface';

/**
 * Paginated leave request list returned by employee and admin list endpoints.
 */
export interface PaginatedLeaveRequests {
  leaveRequests: LeaveRequestResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
