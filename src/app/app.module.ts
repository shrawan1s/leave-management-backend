import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig } from '../config/app.config';

/**
 * Root application module that wires global infrastructure and feature modules.
 */
@Module({
  imports: [MongooseModule.forRoot(appConfig.mongodbUri)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
