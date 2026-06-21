/**
 * Organization leave stats returned to admin dashboard.
 */
export interface LeaveStatsResponse {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalEmployees: number;
}
