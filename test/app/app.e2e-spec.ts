import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from '../../src/app/app.controller';
import { AppService } from '../../src/app/app.service';
import { APP_MESSAGES } from '../../src/common/constants/app-messages.constants';
import {
  API_PREFIX,
  APP_HEALTH_STATUS,
  APP_SERVICE_NAME,
} from '../../src/common/constants/app.constants';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(API_PREFIX);
    await app.init();
  });

  it('/api/health (GET)', async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/health`)
      .expect(200)
      .expect({
        success: true,
        data: {
          status: APP_HEALTH_STATUS,
          service: APP_SERVICE_NAME,
        },
        message: APP_MESSAGES.HEALTH_CHECK_SUCCESS,
      });
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });
});
