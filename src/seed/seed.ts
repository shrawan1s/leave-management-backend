import { NestFactory } from '@nestjs/core';
import { hash } from 'bcryptjs';
import { AppModule } from '../app/app.module';
import { UserRole } from '../common/enums/user-role.enum';
import { UsersService } from '../users/users.service';
import { PASSWORD_SALT_ROUNDS } from '../auth/constants/auth.constants';
import {
  ADMIN_SEED_MESSAGES,
  ADMIN_SEED_USER,
} from './constants/admin-seed.constants';

/**
 * Seeds the default admin account used for assignment evaluation.
 */
async function seedAdmin(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    const existingAdmin = await usersService.findByEmail(ADMIN_SEED_USER.email);

    if (existingAdmin) {
      console.log(ADMIN_SEED_MESSAGES.ALREADY_EXISTS);
      return;
    }

    const password = await hash(ADMIN_SEED_USER.password, PASSWORD_SALT_ROUNDS);

    await usersService.create({
      name: ADMIN_SEED_USER.name,
      email: ADMIN_SEED_USER.email,
      password,
      role: UserRole.ADMIN,
      department: ADMIN_SEED_USER.department,
      joinDate: new Date(ADMIN_SEED_USER.joinDate),
    });

    console.log(ADMIN_SEED_MESSAGES.CREATED);
  } finally {
    await app.close();
  }
}

void seedAdmin();
