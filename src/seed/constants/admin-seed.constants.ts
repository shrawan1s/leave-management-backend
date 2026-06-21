export const ADMIN_SEED_USER = {
  name: 'Nrolled Admin',
  email: 'admin@nrolled.com',
  password: 'Admin@123',
  department: 'Administration',
  joinDate: '2026-06-01',
} as const;

export const ADMIN_SEED_MESSAGES = {
  ALREADY_EXISTS: 'Admin user already exists',
  CREATED: 'Admin user seeded successfully',
} as const;
