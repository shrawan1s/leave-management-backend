import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UserRole } from '../common/enums/user-role.enum';
import type { ApiResponse } from '../common/interfaces/api-response.interface';
import { createApiResponse } from '../common/utils/api-response.util';
import { LEAVE_MESSAGES } from './constants/leave-messages.constants';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { FilterLeaveRequestsDto } from './dto/filter-leave-requests.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import type { LeaveBalanceResponse } from './interfaces/leave-balance-response.interface';
import type { LeaveRequestResponse } from './interfaces/leave-request-response.interface';
import type { LeaveStatsResponse } from './interfaces/leave-stats-response.interface';
import { LeaveService } from './leave.service';

/**
 * Exposes leave endpoints for employee self-service workflows.
 */
@Controller('leave')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  /**
   * Creates a pending leave request for the authenticated employee.
   */
  @Post()
  @Roles(UserRole.EMPLOYEE)
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() createLeaveDto: CreateLeaveDto,
  ): Promise<ApiResponse<{ leaveRequest: LeaveRequestResponse }>> {
    const leaveRequest = await this.leaveService.create(
      request.user.id,
      createLeaveDto,
    );

    return createApiResponse({ leaveRequest }, LEAVE_MESSAGES.CREATE_SUCCESS);
  }

  /**
   * Returns leave requests owned by the authenticated employee.
   */
  @Get('my')
  @Roles(UserRole.EMPLOYEE)
  async findMyLeaves(
    @Req() request: AuthenticatedRequest,
  ): Promise<ApiResponse<{ leaveRequests: LeaveRequestResponse[] }>> {
    const leaveRequests = await this.leaveService.findMyLeaves(request.user.id);

    return createApiResponse(
      { leaveRequests },
      LEAVE_MESSAGES.MY_LEAVES_FETCH_SUCCESS,
    );
  }

  /**
   * Returns current leave balance for the authenticated employee.
   */
  @Get('balance')
  @Roles(UserRole.EMPLOYEE)
  async getBalance(
    @Req() request: AuthenticatedRequest,
  ): Promise<ApiResponse<LeaveBalanceResponse>> {
    const balance = await this.leaveService.getBalance(request.user.id);

    return createApiResponse(balance, LEAVE_MESSAGES.BALANCE_FETCH_SUCCESS);
  }

  /**
   * Returns all leave requests for admins with optional filters.
   */
  @Get('all')
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query() filters: FilterLeaveRequestsDto,
  ): Promise<ApiResponse<{ leaveRequests: LeaveRequestResponse[] }>> {
    const leaveRequests = await this.leaveService.findAll(filters);

    return createApiResponse(
      { leaveRequests },
      LEAVE_MESSAGES.ALL_LEAVES_FETCH_SUCCESS,
    );
  }

  /**
   * Returns leave stats for admin dashboard.
   */
  @Get('stats')
  @Roles(UserRole.ADMIN)
  async getStats(): Promise<ApiResponse<LeaveStatsResponse>> {
    const stats = await this.leaveService.getStats();

    return createApiResponse(stats, LEAVE_MESSAGES.STATS_FETCH_SUCCESS);
  }

  /**
   * Approves or rejects a pending leave request.
   */
  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id') leaveRequestId: string,
    @Body() updateLeaveStatusDto: UpdateLeaveStatusDto,
  ): Promise<ApiResponse<{ leaveRequest: LeaveRequestResponse }>> {
    const leaveRequest = await this.leaveService.updateStatus(
      leaveRequestId,
      updateLeaveStatusDto,
    );

    return createApiResponse(
      { leaveRequest },
      LEAVE_MESSAGES.STATUS_UPDATE_SUCCESS,
    );
  }

  /**
   * Updates an owned pending leave request for the authenticated employee.
   */
  @Patch(':id')
  @Roles(UserRole.EMPLOYEE)
  async update(
    @Req() request: AuthenticatedRequest,
    @Param('id') leaveRequestId: string,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
  ): Promise<ApiResponse<{ leaveRequest: LeaveRequestResponse }>> {
    const leaveRequest = await this.leaveService.update(
      request.user.id,
      leaveRequestId,
      updateLeaveRequestDto,
    );

    return createApiResponse({ leaveRequest }, LEAVE_MESSAGES.UPDATE_SUCCESS);
  }

  /**
   * Deletes an owned pending leave request for the authenticated employee.
   */
  @Delete(':id')
  @Roles(UserRole.EMPLOYEE)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id') leaveRequestId: string,
  ): Promise<ApiResponse<null>> {
    await this.leaveService.remove(request.user.id, leaveRequestId);

    return createApiResponse(null, LEAVE_MESSAGES.DELETE_SUCCESS);
  }
}
