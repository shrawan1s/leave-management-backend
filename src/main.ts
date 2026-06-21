import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { appConfig } from './config/app.config';

/**
 * Creates and starts the Nest application with global infrastructure settings.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(appConfig.apiPrefix);
  app.enableCors({
    origin: appConfig.corsOrigin,
    credentials: true,
  });
  // Strip unknown DTO properties before requests reach controllers.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(appConfig.port);
}
void bootstrap();
