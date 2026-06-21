import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { appConfig } from '../../config/app.config';
import { UsersService } from '../../users/users.service';
import { AUTH_MESSAGES } from '../constants/auth-messages.constants';
import { JWT_REFRESH_STRATEGY_NAME } from '../constants/auth.constants';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';
import type { RefreshTokenUser } from '../interfaces/refresh-token-user.interface';

/**
 * Validates refresh bearer tokens and attaches the token owner to requests.
 */
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_STRATEGY_NAME,
) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: appConfig.jwtRefreshSecret,
    });
  }

  /**
   * Ensures the refresh token subject still maps to an existing user.
   */
  async validate(
    request: { headers: { authorization?: string } },
    payload: JwtPayload,
  ): Promise<RefreshTokenUser> {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.REFRESH_UNAUTHORIZED);
    }

    const refreshToken = request.headers.authorization?.replace('Bearer ', '');

    if (!refreshToken) {
      throw new UnauthorizedException(AUTH_MESSAGES.REFRESH_UNAUTHORIZED);
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      refreshToken,
    };
  }
}
