import { Injectable } from '@nestjs/common';
import {
  APP_HEALTH_STATUS,
  APP_SERVICE_NAME,
} from '../common/constants/app.constants';
import type { HealthStatus } from './interfaces/health-status.interface';

/**
 * Provides application-level operations that do not belong to a feature module.
 */
@Injectable()
export class AppService {
  /**
   * Builds the static health payload returned by the health endpoint.
   */
  getHealth(): HealthStatus {
    return {
      status: APP_HEALTH_STATUS,
      service: APP_SERVICE_NAME,
    };
  }
}
