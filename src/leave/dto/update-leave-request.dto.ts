import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { LeaveType } from '../../common/enums/leave-type.enum';

/**
 * Request body for admin leave request edits.
 */
export class UpdateLeaveRequestDto {
  @IsOptional()
  @IsEnum(LeaveType)
  type?: LeaveType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  reason?: string;

  @IsOptional()
  @IsString()
  adminComment?: string;
}
