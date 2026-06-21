import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../../src/app/app.controller';
import { AppService } from '../../src/app/app.service';
import { APP_MESSAGES } from '../../src/common/constants/app-messages.constants';
import {
  APP_HEALTH_STATUS,
  APP_SERVICE_NAME,
} from '../../src/common/constants/app.constants';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return API health status', () => {
      expect(appController.getHealth()).toEqual({
        success: true,
        data: {
          status: APP_HEALTH_STATUS,
          service: APP_SERVICE_NAME,
        },
        message: APP_MESSAGES.HEALTH_CHECK_SUCCESS,
      });
    });
  });
});
