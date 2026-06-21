import { IsDateString, IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Request body for employee self-registration.
 */
export class RegisterDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  department: string;

  @IsDateString()
  joinDate: string;
}
