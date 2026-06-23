import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../../src/common/enums/user-role.enum';
import { LeaveStatus } from '../../src/common/enums/leave-status.enum';
import { LeaveType } from '../../src/common/enums/leave-type.enum';
import { LEAVE_MESSAGES } from '../../src/leave/constants/leave-messages.constants';
import { LeaveController } from '../../src/leave/leave.controller';
import { LeaveService } from '../../src/leave/leave.service';
import type { CreateLeaveDto } from '../../src/leave/dto/create-leave.dto';
import type { FilterLeaveRequestsDto } from '../../src/leave/dto/filter-leave-requests.dto';
import type { UpdateLeaveRequestDto } from '../../src/leave/dto/update-leave-request.dto';
import type { UpdateLeaveStatusDto } from '../../src/leave/dto/update-leave-status.dto';
import type { LeaveRequestResponse } from '../../src/leave/interfaces/leave-request-response.interface';
import type { LeaveStatsResponse } from '../../src/leave/interfaces/leave-stats-response.interface';
import type { AuthenticatedRequest } from '../../src/auth/interfaces/authenticated-request.interface';

type LeaveServiceMock = Pick<
  LeaveService,
  | 'create'
  | 'findMyLeaves'
  | 'getBalance'
  | 'findAll'
  | 'getStats'
  | 'updateStatus'
  | 'update'
  | 'remove'
>;

const employeeId = '507f1f77bcf86cd799439011';
const request = {
  user: {
    id: employeeId,
    email: 'employee@example.com',
    role: UserRole.EMPLOYEE,
  },
} as AuthenticatedRequest;

const leaveRequest: LeaveRequestResponse = {
  id: '507f1f77bcf86cd799439012',
  employeeId,
  type: LeaveType.SICK,
  startDate: new Date('2026-06-22'),
  endDate: new Date('2026-06-23'),
  days: 2,
  reason: 'Feeling unwell',
  status: LeaveStatus.PENDING,
  createdAt: new Date('2026-06-21'),
  updatedAt: new Date('2026-06-21'),
};

describe('LeaveController', () => {
  let leaveController: LeaveController;
  let leaveService: jest.Mocked<LeaveServiceMock>;

  beforeEach(async () => {
    leaveService = {
      create: jest.fn(),
      findMyLeaves: jest.fn(),
      getBalance: jest.fn(),
      findAll: jest.fn(),
      getStats: jest.fn(),
      updateStatus: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaveController],
      providers: [{ provide: LeaveService, useValue: leaveService }],
    }).compile();

    leaveController = module.get<LeaveController>(LeaveController);
  });

  it('wraps create leave responses in the standard envelope', async () => {
    const createLeaveDto: CreateLeaveDto = {
      type: LeaveType.SICK,
      startDate: '2026-06-22',
      endDate: '2026-06-23',
      reason: 'Feeling unwell',
    };
    leaveService.create.mockResolvedValue(leaveRequest);

    await expect(
      leaveController.create(request, createLeaveDto),
    ).resolves.toEqual({
      success: true,
      data: { leaveRequest },
      message: LEAVE_MESSAGES.CREATE_SUCCESS,
    });
  });

  it('wraps my leaves responses in the standard envelope', async () => {
    leaveService.findMyLeaves.mockResolvedValue([leaveRequest]);

    await expect(leaveController.findMyLeaves(request)).resolves.toEqual({
      success: true,
      data: { leaveRequests: [leaveRequest] },
      message: LEAVE_MESSAGES.MY_LEAVES_FETCH_SUCCESS,
    });
  });

  it('wraps balance responses in the standard envelope', async () => {
    leaveService.getBalance.mockResolvedValue({ leaveBalance: 12 });

    await expect(leaveController.getBalance(request)).resolves.toEqual({
      success: true,
      data: { leaveBalance: 12 },
      message: LEAVE_MESSAGES.BALANCE_FETCH_SUCCESS,
    });
  });

  it('wraps admin leave list responses in the standard envelope', async () => {
    const filters: FilterLeaveRequestsDto = {
      status: LeaveStatus.PENDING,
      type: LeaveType.SICK,
    };
    leaveService.findAll.mockResolvedValue([leaveRequest]);

    await expect(leaveController.findAll(filters)).resolves.toEqual({
      success: true,
      data: { leaveRequests: [leaveRequest] },
      message: LEAVE_MESSAGES.ALL_LEAVES_FETCH_SUCCESS,
    });
    expect(leaveService.findAll).toHaveBeenCalledWith(filters);
  });

  it('wraps admin stats responses in the standard envelope', async () => {
    const stats: LeaveStatsResponse = {
      total: 3,
      pending: 1,
      approved: 1,
      rejected: 1,
      totalEmployees: 2,
    };
    leaveService.getStats.mockResolvedValue(stats);

    await expect(leaveController.getStats()).resolves.toEqual({
      success: true,
      data: stats,
      message: LEAVE_MESSAGES.STATS_FETCH_SUCCESS,
    });
  });

  it('wraps status update responses in the standard envelope', async () => {
    const updateLeaveStatusDto: UpdateLeaveStatusDto = {
      status: LeaveStatus.APPROVED,
      adminComment: 'Approved for payroll records.',
    };
    const approvedLeaveRequest = {
      ...leaveRequest,
      status: LeaveStatus.APPROVED,
      adminComment: updateLeaveStatusDto.adminComment,
    };
    leaveService.updateStatus.mockResolvedValue(approvedLeaveRequest);

    await expect(
      leaveController.updateStatus(leaveRequest.id, updateLeaveStatusDto),
    ).resolves.toEqual({
      success: true,
      data: { leaveRequest: approvedLeaveRequest },
      message: LEAVE_MESSAGES.STATUS_UPDATE_SUCCESS,
    });
    expect(leaveService.updateStatus).toHaveBeenCalledWith(
      leaveRequest.id,
      updateLeaveStatusDto,
    );
  });

  it('wraps admin edit responses in the standard envelope', async () => {
    const updateLeaveRequestDto: UpdateLeaveRequestDto = {
      type: LeaveType.EARNED,
      startDate: '2026-06-24',
      endDate: '2026-06-25',
      reason: 'Updated leave request reason.',
    };
    const updatedLeaveRequest = {
      ...leaveRequest,
      type: LeaveType.EARNED,
      startDate: new Date('2026-06-24'),
      endDate: new Date('2026-06-25'),
      reason: updateLeaveRequestDto.reason,
    };
    leaveService.update.mockResolvedValue(updatedLeaveRequest);

    await expect(
      leaveController.update(request, leaveRequest.id, updateLeaveRequestDto),
    ).resolves.toEqual({
      success: true,
      data: { leaveRequest: updatedLeaveRequest },
      message: LEAVE_MESSAGES.UPDATE_SUCCESS,
    });
    expect(leaveService.update).toHaveBeenCalledWith(
      employeeId,
      leaveRequest.id,
      updateLeaveRequestDto,
    );
  });

  it('wraps admin delete responses in the standard envelope', async () => {
    leaveService.remove.mockResolvedValue(undefined);

    await expect(
      leaveController.remove(request, leaveRequest.id),
    ).resolves.toEqual({
      success: true,
      data: null,
      message: LEAVE_MESSAGES.DELETE_SUCCESS,
    });
    expect(leaveService.remove).toHaveBeenCalledWith(
      employeeId,
      leaveRequest.id,
    );
  });
});
