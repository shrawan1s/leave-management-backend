import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UserRole } from '../common/enums/user-role.enum';
import { UsersService } from '../users/users.service';
import { AUTH_MESSAGES } from './constants/auth-messages.constants';
import { PASSWORD_SALT_ROUNDS } from './constants/auth.constants';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { AuthResponse } from './interfaces/auth-response.interface';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import type { SafeUser } from '../users/interfaces/safe-user.interface';
import { appConfig } from '../config/app.config';

/**
 * Handles authentication workflows and JWT issuing.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers an employee account and returns a signed access token.
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const password = await hash(registerDto.password, PASSWORD_SALT_ROUNDS);
    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      password,
      role: UserRole.EMPLOYEE,
      department: registerDto.department,
      joinDate: new Date(registerDto.joinDate),
    });

    return this.buildAuthResponse(this.usersService.toSafeUser(user));
  }

  /**
   * Authenticates a user with email/password credentials.
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );

    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const passwordMatches = await compare(loginDto.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    return this.buildAuthResponse(this.usersService.toSafeUser(user));
  }

  /**
   * Returns the current authenticated user's public profile.
   */
  async getMe(userId: string): Promise<SafeUser> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.UNAUTHORIZED);
    }

    return this.usersService.toSafeUser(user);
  }

  /**
   * Issues a new token pair for a valid refresh-token subject.
   */
  async refresh(userId: string): Promise<AuthResponse> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.REFRESH_UNAUTHORIZED);
    }

    return this.buildAuthResponse(this.usersService.toSafeUser(user));
  }

  private buildAuthResponse(user: SafeUser): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: appConfig.jwtRefreshExpiresIn,
        secret: appConfig.jwtRefreshSecret,
      }),
      token: this.jwtService.sign(payload),
      user,
    };
  }
}
