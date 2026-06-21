import type { JwtSignOptions } from '@nestjs/jwt';

/**
 * Runtime configuration consumed by application infrastructure.
 */
export interface AppConfig {
  apiPrefix: string;
  corsOrigin: boolean | string[];
  jwtExpiresIn: JwtSignOptions['expiresIn'];
  jwtRefreshExpiresIn: JwtSignOptions['expiresIn'];
  jwtRefreshSecret: string;
  jwtSecret: string;
  mongodbUri: string;
  port: number;
}

export type JwtExpiresIn = AppConfig['jwtExpiresIn'];
