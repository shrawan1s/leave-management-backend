import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWT_REFRESH_STRATEGY_NAME } from '../constants/auth.constants';

/**
 * Protects refresh routes by requiring a valid refresh token.
 */
@Injectable()
export class RefreshTokenGuard extends AuthGuard(JWT_REFRESH_STRATEGY_NAME) {}
