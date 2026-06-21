import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LeaveStatus } from '../../common/enums/leave-status.enum';

/**
 * Request body for admin leave approval or rejection.
 */
export class UpdateLeaveStatusDto {
  @IsEnum(LeaveStatus)
  status: LeaveStatus.APPROVED | LeaveStatus.REJECTED;

  @IsOptional()
  @IsString()
  adminComment?: string;
}
