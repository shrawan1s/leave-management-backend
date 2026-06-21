import type {
  APP_HEALTH_STATUS,
  APP_SERVICE_NAME,
} from '../../common/constants/app.constants';

/**
 * Health payload returned by the application health endpoint.
 */
export interface HealthStatus {
  status: typeof APP_HEALTH_STATUS;
  service: typeof APP_SERVICE_NAME;
}
