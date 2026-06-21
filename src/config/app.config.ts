import {
  API_PREFIX,
  DEFAULT_MONGODB_URI,
  DEFAULT_PORT,
} from '../common/constants/app.constants';
import type { AppConfig } from './interfaces/app-config.interface';

/**
 * Converts a comma-separated CORS origin list into Nest's CORS option shape.
 */
function parseCorsOrigin(corsOrigin?: string): boolean | string[] {
  const origins = corsOrigin
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins?.length ? origins : true;
}

/**
 * Parses the configured HTTP port and falls back when the value is invalid.
 */
function parsePort(port?: string): number {
  const parsedPort = Number(port);

  return Number.isFinite(parsedPort) && parsedPort > 0
    ? parsedPort
    : DEFAULT_PORT;
}

/**
 * Centralized application configuration.
 *
 * This is the only backend file that should read from `process.env`.
 */
export const appConfig: AppConfig = {
  apiPrefix: API_PREFIX,
  corsOrigin: parseCorsOrigin(process.env.CORS_ORIGIN),
  mongodbUri: process.env.MONGODB_URI ?? DEFAULT_MONGODB_URI,
  port: parsePort(process.env.PORT),
};
