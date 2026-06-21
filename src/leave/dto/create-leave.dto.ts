import { IsDateString, IsEnum, IsString, MinLength } from 'class-validator';
import { LeaveType } from '../../common/enums/leave-type.enum';

/**
 * Request body for employee leave applications.
 */
export class CreateLeaveDto {
  @IsEnum(LeaveType)
  type: LeaveType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @MinLength(10)
  reason: string;
}
