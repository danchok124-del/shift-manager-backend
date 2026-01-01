import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { UserRole } from '../entities/enums';
import { UserAvailability } from '../entities/user-availability.entity';
import { User } from '../entities/user.entity';
import { DelegateDto, UpdateAvailabilityDto, UpdateUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserAvailability)
    private availabilityRepository: Repository<UserAvailability>,
  ) {}

  async findAll(query: {
    search?: string;
    departmentId?: number;
    role?: UserRole;
    page?: number;
    limit?: number;
  }) {
    const { search, departmentId, role } = query;
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;

    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.role',
        'user.phone',
        'user.isActive',
        'user.departmentId',
        'department.id',
        'department.name',
      ]);

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (departmentId) {
      queryBuilder.andWhere('user.departmentId = :departmentId', { departmentId });
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    const [users, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['department', 'skills', 'skills.skill', 'availabilities'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: number, updateUserDto: UpdateUserDto, currentUser: User) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only allow self-update or HR update
    if (currentUser.id !== id && currentUser.role !== UserRole.HR) {
      throw new ForbiddenException('Cannot update other users');
    }

    // Only HR can change roles
    if (updateUserDto.role && currentUser.role !== UserRole.HR) {
      throw new ForbiddenException('Only HR can change roles');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    await this.usersRepository.save(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateRole(id: number, role: UserRole) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role;
    await this.usersRepository.save(user);

    return { message: 'Role updated successfully' };
  }

  async assignToDepartment(userId: number, departmentId: number | null) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.departmentId = departmentId;
    await this.usersRepository.save(user);

    return { message: 'Department assignment updated' };
  }

  async getSchedule(userId: number, startDate: Date, endDate: Date) {
    const assignments = await this.usersRepository.manager
      .getRepository('ShiftAssignment')
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.shift', 'shift')
      .where('assignment.userId = :userId', { userId })
      .andWhere('shift.startTime BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('shift.startTime', 'ASC')
      .getMany();

    return assignments;
  }

  async getWorkReport(userId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const records = await this.usersRepository.manager
      .getRepository('Attendance')
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.shift', 'shift')
      .where('attendance.userId = :userId', { userId })
      .andWhere('attendance.clockIn BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('attendance.clockIn', 'ASC')
      .getMany();

    let totalHours = 0;
    records.forEach((record) => {
      if (record.clockOut) {
        const hours =
          (new Date(record.clockOut).getTime() - new Date(record.clockIn).getTime()) / 3600000;
        totalHours += hours;
      }
    });

    return {
      userId,
      month,
      year,
      totalHours: Math.round(totalHours * 100) / 100,
      records,
    };
  }

  // Availability management
  async getAvailabilities(userId: number) {
    return this.availabilityRepository.find({ where: { userId } });
  }

  async createAvailability(userId: number, dto: UpdateAvailabilityDto) {
    const availability = this.availabilityRepository.create({
      ...dto,
      userId,
    });
    return this.availabilityRepository.save(availability);
  }

  async deleteAvailability(userId: number, availabilityId: number) {
    const result = await this.availabilityRepository.delete({
      id: availabilityId,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Availability not found');
    }

    return { message: 'Availability deleted' };
  }

  // Delegation
  async delegate(currentUser: User, delegateDto: DelegateDto) {
    const targetUser = await this.usersRepository.findOne({
      where: { id: delegateDto.userId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    targetUser.delegatedById = currentUser.id;
    targetUser.delegationExpiresAt = delegateDto.expiresAt;
    await this.usersRepository.save(targetUser);

    return { message: 'Delegation successful' };
  }

  async revokeDelegation(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.delegatedById = null;
    user.delegationExpiresAt = null;
    await this.usersRepository.save(user);

    return { message: 'Delegation revoked' };
  }
}
