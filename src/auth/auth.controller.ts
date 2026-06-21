import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { createApiResponse } from '../common/utils/api-response.util';
import type { ApiResponse } from '../common/interfaces/api-response.interface';
import type { SafeUser } from '../users/interfaces/safe-user.interface';
import { AuthService } from './auth.service';
import { AUTH_MESSAGES } from './constants/auth-messages.constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import type { AuthResponse } from './interfaces/auth-response.interface';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface';
import type { RefreshTokenUser } from './interfaces/refresh-token-user.interface';

/**
 * Exposes authentication endpoints for employees and admins.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new employee account.
   */
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ApiResponse<AuthResponse>> {
    const authResponse = await this.authService.register(registerDto);

    return createApiResponse(authResponse, AUTH_MESSAGES.REGISTER_SUCCESS);
  }

  /**
   * Authenticates an employee or pre-seeded admin account.
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<AuthResponse>> {
    const authResponse = await this.authService.login(loginDto);

    return createApiResponse(authResponse, AUTH_MESSAGES.LOGIN_SUCCESS);
  }

  /**
   * Exchanges a valid refresh token for a new token pair.
   */
  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @Req() request: AuthenticatedRequest & { user: RefreshTokenUser },
  ): Promise<ApiResponse<AuthResponse>> {
    const authResponse = await this.authService.refresh(request.user.id);

    return createApiResponse(authResponse, AUTH_MESSAGES.REFRESH_SUCCESS);
  }

  /**
   * Validates the access token before the client clears its local session.
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(): ApiResponse<null> {
    return createApiResponse(null, AUTH_MESSAGES.LOGOUT_SUCCESS);
  }

  /**
   * Returns the user associated with the bearer token.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(
    @Req() request: AuthenticatedRequest,
  ): Promise<ApiResponse<{ user: SafeUser }>> {
    const user = await this.authService.getMe(request.user.id);

    return createApiResponse({ user }, AUTH_MESSAGES.ME_SUCCESS);
  }
}
