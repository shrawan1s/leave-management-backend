export const AUTH_MESSAGES = {
  EMAIL_ALREADY_EXISTS: 'Email is already registered',
  INVALID_CREDENTIALS: 'Invalid email or password',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  ME_SUCCESS: 'Authenticated user fetched successfully',
  REFRESH_SUCCESS: 'Token refreshed successfully',
  REGISTER_SUCCESS: 'Registration successful',
  REFRESH_UNAUTHORIZED: 'Refresh token is missing or invalid',
  UNAUTHORIZED: 'Authentication token is missing or invalid',
} as const;
