import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole } from '../common/enums/user-role.enum';
import type { CreateUserData } from './interfaces/create-user-data.interface';
import type { SafeUser } from './interfaces/safe-user.interface';
import { User, type UserDocument } from './schemas/user.schema';

/**
 * Handles user persistence and user response mapping.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Creates a user with normalized email storage.
   */
  async create(createUserData: CreateUserData): Promise<UserDocument> {
    return this.userModel.create({
      ...createUserData,
      email: createUserData.email.toLowerCase(),
    });
  }

  /**
   * Finds a user by email and includes the password hash for credential checks.
   */
  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .exec();
  }

  /**
   * Finds a user by email without selecting sensitive fields.
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  /**
   * Finds a user by MongoDB id without selecting sensitive fields.
   */
  async findById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
  }

  /**
   * Counts users by role for organization stats.
   */
  async countByRole(role: UserRole): Promise<number> {
    return this.userModel.countDocuments({ role }).exec();
  }

  /**
   * Converts a user document into the public API user shape.
   */
  toSafeUser(user: UserDocument): SafeUser {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      joinDate: user.joinDate,
      leaveBalance: user.leaveBalance,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
