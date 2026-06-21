import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserRole } from '../../common/enums/user-role.enum';
import { DEFAULT_LEAVE_BALANCE } from '../constants/users.constants';

export type UserDocument = HydratedDocument<User> & { _id: Types.ObjectId };

/**
 * MongoDB representation of an application user.
 */
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.EMPLOYEE })
  role: UserRole;

  @Prop({ required: true, trim: true })
  department: string;

  @Prop({ type: Date, required: true })
  joinDate: Date;

  @Prop({ default: DEFAULT_LEAVE_BALANCE, min: 0 })
  leaveBalance: number;

  createdAt: Date;

  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
