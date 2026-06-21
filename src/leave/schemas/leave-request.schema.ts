import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { LeaveStatus } from '../../common/enums/leave-status.enum';
import { LeaveType } from '../../common/enums/leave-type.enum';
import { User } from '../../users/schemas/user.schema';

export type LeaveRequestDocument = HydratedDocument<LeaveRequest> & {
  _id: Types.ObjectId;
};

/**
 * MongoDB representation of an employee leave request.
 */
@Schema({ timestamps: true })
export class LeaveRequest {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: String, enum: LeaveType, required: true })
  type: LeaveType;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ required: true, min: 1 })
  days: number;

  @Prop({ required: true, trim: true, minlength: 10 })
  reason: string;

  @Prop({ type: String, enum: LeaveStatus, default: LeaveStatus.PENDING })
  status: LeaveStatus;

  @Prop({ trim: true })
  adminComment?: string;

  createdAt: Date;

  updatedAt: Date;
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);
