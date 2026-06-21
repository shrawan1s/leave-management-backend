import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { APP_MESSAGES } from '../common/constants/app-messages.constants';
import type { ApiResponse } from '../common/interfaces/api-response.interface';
import { createApiResponse } from '../common/utils/api-response.util';

/**
 * Exposes application-level endpoints that are not owned by a feature module.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Returns a lightweight health response for uptime checks.
   */
  @Get('health')
  getHealth(): ApiResponse<ReturnType<AppService['getHealth']>> {
    return createApiResponse(
      this.appService.getHealth(),
      APP_MESSAGES.HEALTH_CHECK_SUCCESS,
    );
  }
}
