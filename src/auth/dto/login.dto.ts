import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Request body for password-based login.
 */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
