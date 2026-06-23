import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveStatus } from '../common/enums/leave-status.enum';
import { UserRole } from '../common/enums/user-role.enum';
import type { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { LEAVE_MESSAGES } from './constants/leave-messages.constants';
import type { CreateLeaveDto } from './dto/create-leave.dto';
import type { FilterLeaveRequestsDto } from './dto/filter-leave-requests.dto';
import type { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import type { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import type { LeaveBalanceResponse } from './interfaces/leave-balance-response.interface';
import type { LeaveRequestEmployee } from './interfaces/leave-request-employee.interface';
import type { LeaveRequestResponse } from './interfaces/leave-request-response.interface';
import type { LeaveStatsResponse } from './interfaces/leave-stats-response.interface';
import {
  LeaveRequest,
  type LeaveRequestDocument,
} from './schemas/leave-request.schema';

/**
 * Handles employee leave request workflows.
 */
@Injectable()
export class LeaveService {
  constructor(
    @InjectModel(LeaveRequest.name)
    private readonly leaveRequestModel: Model<LeaveRequestDocument>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Creates a pending leave request after validating date range and balance.
   */
  async create(
    employeeId: string,
    createLeaveDto: CreateLeaveDto,
  ): Promise<LeaveRequestResponse> {
    const startDate = this.parseDate(createLeaveDto.startDate);
    const endDate = this.parseDate(createLeaveDto.endDate);
    const days = this.calculateInclusiveDays(startDate, endDate);
    const user = await this.usersService.findById(employeeId);

    if (!user || days > user.leaveBalance) {
      throw new BadRequestException(LEAVE_MESSAGES.INSUFFICIENT_BALANCE);
    }

    const leaveRequest = await this.leaveRequestModel.create({
      employeeId: new Types.ObjectId(employeeId),
      type: createLeaveDto.type,
      startDate,
      endDate,
      days,
      reason: createLeaveDto.reason,
      status: LeaveStatus.PENDING,
    });

    return this.toLeaveRequestResponse(leaveRequest);
  }

  /**
   * Returns all leave requests for the authenticated employee.
   */
  async findMyLeaves(employeeId: string): Promise<LeaveRequestResponse[]> {
    const leaveRequests = await this.leaveRequestModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .sort({ createdAt: -1 })
      .exec();

    return leaveRequests.map((leaveRequest) =>
      this.toLeaveRequestResponse(leaveRequest),
    );
  }

  /**
   * Returns the current leave balance for the authenticated employee.
   */
  async getBalance(employeeId: string): Promise<LeaveBalanceResponse> {
    const user = await this.usersService.findById(employeeId);

    if (!user) {
      throw new BadRequestException(LEAVE_MESSAGES.INSUFFICIENT_BALANCE);
    }

    return {
      leaveBalance: user.leaveBalance,
    };
  }

  /**
   * Returns all leave requests with optional admin filters.
   */
  async findAll(
    filters: FilterLeaveRequestsDto,
  ): Promise<LeaveRequestResponse[]> {
    const leaveRequests = await this.leaveRequestModel
      .find({
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.type ? { type: filters.type } : {}),
      })
      .sort({ createdAt: -1 })
      .exec();

    return Promise.all(
      leaveRequests.map(async (leaveRequest) => {
        const employee = await this.usersService.findById(
          leaveRequest.employeeId.toString(),
        );

        return this.toLeaveRequestResponse(leaveRequest, employee ?? undefined);
      }),
    );
  }

  /**
   * Returns organization-level leave stats for admin dashboard.
   */
  async getStats(): Promise<LeaveStatsResponse> {
    const [total, pending, approved, rejected, totalEmployees] =
      await Promise.all([
        this.leaveRequestModel.countDocuments().exec(),
        this.leaveRequestModel
          .countDocuments({ status: LeaveStatus.PENDING })
          .exec(),
        this.leaveRequestModel
          .countDocuments({ status: LeaveStatus.APPROVED })
          .exec(),
        this.leaveRequestModel
          .countDocuments({ status: LeaveStatus.REJECTED })
          .exec(),
        this.usersService.countByRole(UserRole.EMPLOYEE),
      ]);

    return {
      total,
      pending,
      approved,
      rejected,
      totalEmployees,
    };
  }

  /**
   * Approves or rejects a pending leave request.
   */
  async updateStatus(
    leaveRequestId: string,
    updateLeaveStatusDto: UpdateLeaveStatusDto,
  ): Promise<LeaveRequestResponse> {
    if (
      updateLeaveStatusDto.status !== LeaveStatus.APPROVED &&
      updateLeaveStatusDto.status !== LeaveStatus.REJECTED
    ) {
      throw new BadRequestException(LEAVE_MESSAGES.INVALID_STATUS_ACTION);
    }

    const leaveRequest = await this.leaveRequestModel
      .findById(leaveRequestId)
      .exec();

    if (!leaveRequest) {
      throw new NotFoundException(LEAVE_MESSAGES.LEAVE_NOT_FOUND);
    }

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        LEAVE_MESSAGES.ONLY_PENDING_CAN_BE_ACTIONED,
      );
    }

    const user = await this.usersService.findById(
      leaveRequest.employeeId.toString(),
    );

    if (updateLeaveStatusDto.status === LeaveStatus.APPROVED) {
      if (!user || user.leaveBalance < leaveRequest.days) {
        throw new BadRequestException(LEAVE_MESSAGES.INSUFFICIENT_BALANCE);
      }

      user.leaveBalance -= leaveRequest.days;
      await user.save();
    }

    leaveRequest.status = updateLeaveStatusDto.status;
    leaveRequest.adminComment = updateLeaveStatusDto.adminComment;
    await leaveRequest.save();

    return this.toLeaveRequestResponse(leaveRequest, user ?? undefined);
  }

  /**
   * Updates editable details for an employee-owned pending leave request.
   */
  async update(
    employeeId: string,
    leaveRequestId: string,
    updateLeaveRequestDto: UpdateLeaveRequestDto,
  ): Promise<LeaveRequestResponse> {
    const leaveRequest = await this.leaveRequestModel
      .findById(leaveRequestId)
      .exec();

    if (!leaveRequest) {
      throw new NotFoundException(LEAVE_MESSAGES.LEAVE_NOT_FOUND);
    }

    if (
      leaveRequest.employeeId.toString() !== employeeId ||
      leaveRequest.status !== LeaveStatus.PENDING
    ) {
      throw new BadRequestException(LEAVE_MESSAGES.ONLY_PENDING_CAN_BE_CHANGED);
    }

    const startDate = updateLeaveRequestDto.startDate
      ? this.parseDate(updateLeaveRequestDto.startDate)
      : leaveRequest.startDate;
    const endDate = updateLeaveRequestDto.endDate
      ? this.parseDate(updateLeaveRequestDto.endDate)
      : leaveRequest.endDate;
    const nextDays = this.calculateInclusiveDays(startDate, endDate);
    const user = await this.usersService.findById(
      leaveRequest.employeeId.toString(),
    );

    if (!user || nextDays > user.leaveBalance) {
      throw new BadRequestException(LEAVE_MESSAGES.INSUFFICIENT_BALANCE);
    }

    leaveRequest.type = updateLeaveRequestDto.type ?? leaveRequest.type;
    leaveRequest.startDate = startDate;
    leaveRequest.endDate = endDate;
    leaveRequest.days = nextDays;
    leaveRequest.reason = updateLeaveRequestDto.reason ?? leaveRequest.reason;
    await leaveRequest.save();

    return this.toLeaveRequestResponse(leaveRequest, user ?? undefined);
  }

  /**
   * Deletes an employee-owned pending leave request.
   */
  async remove(employeeId: string, leaveRequestId: string): Promise<void> {
    const leaveRequest = await this.leaveRequestModel
      .findById(leaveRequestId)
      .exec();

    if (!leaveRequest) {
      throw new NotFoundException(LEAVE_MESSAGES.LEAVE_NOT_FOUND);
    }

    if (
      leaveRequest.employeeId.toString() !== employeeId ||
      leaveRequest.status !== LeaveStatus.PENDING
    ) {
      throw new BadRequestException(LEAVE_MESSAGES.ONLY_PENDING_CAN_BE_CHANGED);
    }

    await leaveRequest.deleteOne();
  }

  private parseDate(date: string): Date {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException(LEAVE_MESSAGES.INVALID_DATE_RANGE);
    }

    return parsedDate;
  }

  private calculateInclusiveDays(startDate: Date, endDate: Date): number {
    if (endDate < startDate) {
      throw new BadRequestException(LEAVE_MESSAGES.END_DATE_BEFORE_START_DATE);
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    return (
      Math.floor(
        (endDate.getTime() - startDate.getTime()) / millisecondsPerDay,
      ) + 1
    );
  }

  private toLeaveRequestResponse(
    leaveRequest: LeaveRequestDocument,
    employee?: UserDocument,
  ): LeaveRequestResponse {
    return {
      id: leaveRequest._id.toString(),
      employeeId: leaveRequest.employeeId.toString(),
      employee: employee ? this.toLeaveRequestEmployee(employee) : undefined,
      type: leaveRequest.type,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      days: leaveRequest.days,
      reason: leaveRequest.reason,
      status: leaveRequest.status,
      adminComment: leaveRequest.adminComment,
      createdAt: leaveRequest.createdAt,
      updatedAt: leaveRequest.updatedAt,
    };
  }

  private toLeaveRequestEmployee(
    employeeId: UserDocument,
  ): LeaveRequestEmployee {
    return {
      id: employeeId._id.toString(),
      name: employeeId.name,
      email: employeeId.email,
      department: employeeId.department,
    };
  }
}
