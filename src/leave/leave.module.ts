import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import {
  LeaveRequest,
  LeaveRequestSchema,
} from './schemas/leave-request.schema';

/**
 * Registers employee leave request providers.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
    ]),
    UsersModule,
  ],
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}
