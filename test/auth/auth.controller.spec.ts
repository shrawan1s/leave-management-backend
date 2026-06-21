import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../../src/common/enums/user-role.enum';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { AUTH_MESSAGES } from '../../src/auth/constants/auth-messages.constants';
import type { LoginDto } from '../../src/auth/dto/login.dto';
import type { RegisterDto } from '../../src/auth/dto/register.dto';
import type { AuthResponse } from '../../src/auth/interfaces/auth-response.interface';
import type { AuthenticatedRequest } from '../../src/auth/interfaces/authenticated-request.interface';
import type { RefreshTokenUser } from '../../src/auth/interfaces/refresh-token-user.interface';
import type { SafeUser } from '../../src/users/interfaces/safe-user.interface';

type AuthServiceMock = Pick<
  AuthService,
  'register' | 'login' | 'refresh' | 'getMe'
>;

const safeUser: SafeUser = {
  id: '507f1f77bcf86cd799439011',
  name: 'Test User',
  email: 'test@example.com',
  role: UserRole.EMPLOYEE,
  department: 'Engineering',
  joinDate: new Date('2026-06-01'),
  leaveBalance: 12,
  createdAt: new Date('2026-06-01'),
  updatedAt: new Date('2026-06-01'),
};

const authResponse: AuthResponse = {
  refreshToken: 'signed-refresh-token',
  token: 'signed-token',
  user: safeUser,
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthServiceMock>;

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      getMe: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('wraps register responses in the standard envelope', async () => {
    const registerDto: RegisterDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'secret123',
      department: 'Engineering',
      joinDate: '2026-06-01',
    };
    authService.register.mockResolvedValue(authResponse);

    await expect(authController.register(registerDto)).resolves.toEqual({
      success: true,
      data: authResponse,
      message: AUTH_MESSAGES.REGISTER_SUCCESS,
    });
  });

  it('wraps login responses in the standard envelope', async () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'secret123',
    };
    authService.login.mockResolvedValue(authResponse);

    await expect(authController.login(loginDto)).resolves.toEqual({
      success: true,
      data: authResponse,
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
    });
  });

  it('wraps refresh responses in the standard envelope', async () => {
    const request = {
      user: {
        id: safeUser.id,
        email: safeUser.email,
        role: safeUser.role,
        refreshToken: authResponse.refreshToken,
      },
    } as AuthenticatedRequest & { user: RefreshTokenUser };
    authService.refresh.mockResolvedValue(authResponse);

    await expect(authController.refresh(request)).resolves.toEqual({
      success: true,
      data: authResponse,
      message: AUTH_MESSAGES.REFRESH_SUCCESS,
    });
  });

  it('wraps logout responses in the standard envelope', () => {
    expect(authController.logout()).toEqual({
      success: true,
      data: null,
      message: AUTH_MESSAGES.LOGOUT_SUCCESS,
    });
  });

  it('returns the authenticated user profile', async () => {
    const request = {
      user: {
        id: safeUser.id,
        email: safeUser.email,
        role: safeUser.role,
      },
    } as AuthenticatedRequest;
    authService.getMe.mockResolvedValue(safeUser);

    await expect(authController.me(request)).resolves.toEqual({
      success: true,
      data: { user: safeUser },
      message: AUTH_MESSAGES.ME_SUCCESS,
    });
  });
});
