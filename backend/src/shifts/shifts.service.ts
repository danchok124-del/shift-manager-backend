import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UserRole } from '../entities/enums'
import { AssignmentStatus, ShiftAssignment } from '../entities/shift-assignment.entity'
import { Shift } from '../entities/shift.entity'
import { User } from '../entities/user.entity'
import { AssignShiftDto, CreateShiftDto, UpdateShiftDto } from './dto/shifts.dto'

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift)
    private shiftsRepository: Repository<Shift>,
    @InjectRepository(ShiftAssignment)
    private assignmentsRepository: Repository<ShiftAssignment>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(query: {
    departmentId?: number;
    isPublic?: boolean;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { departmentId, isPublic, startDate, endDate } = query;
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;

    const queryBuilder = this.shiftsRepository
      .createQueryBuilder('shift')
      .leftJoinAndSelect('shift.department', 'department')
      // Subquery to get confirmed assignments count
      .loadRelationCountAndMap(
        'shift.assignedCount',
        'shift.assignments',
        'assignment',
        (qb) => qb.where('assignment.status = :status', { status: AssignmentStatus.CONFIRMED }),
      )
      .where('shift.isActive = :isActive', { isActive: true });

    if (departmentId) {
      queryBuilder.andWhere('shift.departmentId = :departmentId', { departmentId });
    }

    if (isPublic !== undefined) {
      queryBuilder.andWhere('shift.isPublic = :isPublic', { isPublic });
    }

    if (startDate) {
      queryBuilder.andWhere('shift.startTime >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('shift.endTime <= :endDate', { endDate });
    }

    queryBuilder.orderBy('shift.startTime', 'ASC');

    const [shifts, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: shifts.map((shift: any) => ({
        ...shift,
        availableSlots: Math.max(0, shift.requiredEmployees - (shift.assignedCount || 0)),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPublic(query: { startDate?: Date; endDate?: Date; page?: number; limit?: number }) {
    return this.findAll({ ...query, isPublic: true });
  }

  async findOne(id: number) {
    const shift = await this.shiftsRepository.findOne({
      where: { id },
      relations: ['department', 'assignments', 'assignments.user'],
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    return {
      ...shift,
      assignedCount: shift.assignments?.filter((a) => a.status === AssignmentStatus.CONFIRMED).length || 0,
      availableSlots: shift.requiredEmployees - (shift.assignments?.filter((a) => a.status === AssignmentStatus.CONFIRMED).length || 0),
    };
  }

  async create(createShiftDto: CreateShiftDto, currentUser: User) {
    // Managers can only create shifts for their own department
    if (currentUser.role === UserRole.MANAGER && createShiftDto.departmentId !== currentUser.departmentId) {
      throw new ForbiddenException('Managers can only create shifts for their own department');
    }

    const shift = this.shiftsRepository.create(createShiftDto);
    return this.shiftsRepository.save(shift);
  }

  async update(id: number, updateShiftDto: UpdateShiftDto, currentUser: User) {
    const shift = await this.shiftsRepository.findOne({ where: { id } });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    // Managers can only update shifts for their own department
    if (currentUser.role === UserRole.MANAGER && shift.departmentId !== currentUser.departmentId) {
      throw new ForbiddenException('Managers can only update shifts in their own department');
    }

    Object.assign(shift, updateShiftDto);
    return this.shiftsRepository.save(shift);
  }

  async remove(id: number, currentUser: User) {
    const shift = await this.shiftsRepository.findOne({ where: { id } });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    // Managers can only delete shifts for their own department
    if (currentUser.role === UserRole.MANAGER && shift.departmentId !== currentUser.departmentId) {
      throw new ForbiddenException('Managers can only delete shifts in their own department');
    }

    shift.isActive = false;
    await this.shiftsRepository.save(shift);

    return { message: 'Shift deactivated' };
  }

  async assignUser(shiftId: number, assignDto: AssignShiftDto, currentUser: User) {
    const shift = await this.shiftsRepository.findOne({
      where: { id: shiftId },
      relations: ['assignments'],
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    const targetUserId = assignDto.userId || currentUser.id;
    const targetUser = await this.usersRepository.findOne({ where: { id: targetUserId } });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    if (targetUserId !== currentUser.id) {
      // Only managers can assign others
      if (currentUser.role !== UserRole.MANAGER && currentUser.role !== UserRole.HR) {
        throw new ForbiddenException('Only managers can assign other employees');
      }
      // Managers can only assign from their department
      if (currentUser.role === UserRole.MANAGER && targetUser.departmentId !== currentUser.departmentId) {
        throw new ForbiddenException('Managers can only assign employees from their own department');
      }
    } else {
      // Self-assignment: shift must be public or from own department
      if (!shift.isPublic && shift.departmentId !== currentUser.departmentId) {
        throw new ForbiddenException('Cannot sign up for this shift');
      }
    }

    // Check if already assigned
    const existingAssignment = await this.assignmentsRepository.findOne({
      where: { shiftId, userId: targetUserId },
    });

    if (existingAssignment) {
      throw new BadRequestException('User is already assigned to this shift');
    }

    // Check if shift is full
    const confirmedAssignments = shift.assignments?.filter((a) => a.status === AssignmentStatus.CONFIRMED).length || 0;
    if (confirmedAssignments >= shift.requiredEmployees) {
      throw new BadRequestException('Shift is already full');
    }

    const assignment = this.assignmentsRepository.create({
      shiftId,
      userId: targetUserId,
      status: AssignmentStatus.CONFIRMED,
      assignedById: targetUserId !== currentUser.id ? currentUser.id : null,
    });

    return this.assignmentsRepository.save(assignment);
  }

  async removeAssignment(shiftId: number, userId: number, currentUser: User) {
    const assignment = await this.assignmentsRepository.findOne({
      where: { shiftId, userId },
      relations: ['shift'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check permissions
    if (userId !== currentUser.id) {
      if (currentUser.role !== UserRole.MANAGER && currentUser.role !== UserRole.HR) {
        throw new ForbiddenException('Only managers can remove other employees');
      }
      if (currentUser.role === UserRole.MANAGER && assignment.shift.departmentId !== currentUser.departmentId) {
        throw new ForbiddenException('Managers can only manage shifts in their own department');
      }
    }

    await this.assignmentsRepository.remove(assignment);

    return { message: 'Assignment removed' };
  }

  async getAssignments(shiftId: number) {
    const assignments = await this.assignmentsRepository.find({
      where: { shiftId },
      relations: ['user'],
    });

    return assignments.map((a) => ({
      id: a.id,
      userId: a.userId,
      status: a.status,
      user: {
        id: a.user.id,
        firstName: a.user.firstName,
        lastName: a.user.lastName,
        email: a.user.email,
      },
    }));
  }
}
