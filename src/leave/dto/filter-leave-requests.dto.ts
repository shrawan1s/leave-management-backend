import { IsEnum, IsOptional } from 'class-validator';
import { LeaveStatus } from '../../common/enums/leave-status.enum';
import { LeaveType } from '../../common/enums/leave-type.enum';

/**
 * Query params used by admins to filter all leave requests.
 */
export class FilterLeaveRequestsDto {
  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @IsOptional()
  @IsEnum(LeaveType)
  type?: LeaveType;
}
