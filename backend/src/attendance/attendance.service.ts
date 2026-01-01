import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'

import { Attendance } from '../entities/attendance.entity'
import { AssignmentStatus, ShiftAssignment } from '../entities/shift-assignment.entity'
import { Shift } from '../entities/shift.entity'
import { User } from '../entities/user.entity'
import { ClockInDto, ClockOutDto } from './dto/attendance.dto'

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Shift)
    private shiftsRepository: Repository<Shift>,
    @InjectRepository(ShiftAssignment)
    private assignmentsRepository: Repository<ShiftAssignment>,
  ) {}

  // Clock-in from hardware device
  async clockIn(clockInDto: ClockInDto) {
    const { cardId } = clockInDto;

    // Find user by card ID
    const user = await this.usersRepository.findOne({ where: { cardId } });
    if (!user) {
      throw new NotFoundException('User with this card not found');
    }

    // Check if user already clocked in (no clock-out)
    const existingOpenAttendance = await this.attendanceRepository.findOne({
      where: { userId: user.id, clockOut: IsNull() },
    });

    if (existingOpenAttendance) {
      throw new BadRequestException('User already clocked in. Please clock out first.');
    }

    // Find current shift for this user
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const assignment = await this.assignmentsRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.shift', 'shift')
      .where('assignment.userId = :userId', { userId: user.id })
      .andWhere('assignment.status = :status', { status: AssignmentStatus.CONFIRMED })
      .andWhere('shift.startTime BETWEEN :start AND :end', { start: todayStart, end: todayEnd })
      .getOne();

    // Create attendance record
    const attendance = this.attendanceRepository.create({
      userId: user.id,
      shiftId: assignment?.shiftId || null,
      clockIn: now,
      cardId,
    });

    await this.attendanceRepository.save(attendance);

    return {
      message: 'Clock-in successful',
      attendance: {
        id: attendance.id,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        clockIn: attendance.clockIn,
        shiftId: attendance.shiftId,
        hasPlannedShift: !!assignment,
      },
    };
  }

  // Clock-out from hardware device
  async clockOut(clockOutDto: ClockOutDto) {
    const { cardId } = clockOutDto;

    // Find user by card ID
    const user = await this.usersRepository.findOne({ where: { cardId } });
    if (!user) {
      throw new NotFoundException('User with this card not found');
    }

    // Find open attendance record
    const attendance = await this.attendanceRepository.findOne({
      where: { userId: user.id, clockOut: IsNull() },
    });

    if (!attendance) {
      throw new BadRequestException('No active clock-in found. Please clock in first.');
    }

    attendance.clockOut = new Date();
    await this.attendanceRepository.save(attendance);

    // Calculate hours worked
    const hoursWorked = (attendance.clockOut.getTime() - attendance.clockIn.getTime()) / 3600000;

    return {
      message: 'Clock-out successful',
      attendance: {
        id: attendance.id,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        clockIn: attendance.clockIn,
        clockOut: attendance.clockOut,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
      },
    };
  }

  // Manual clock-in from web interface
  async manualClockIn(userId: number, shiftId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already clocked in
    const existingOpenAttendance = await this.attendanceRepository.findOne({
      where: { userId: user.id, clockOut: IsNull() },
    });

    if (existingOpenAttendance) {
      throw new BadRequestException('You are already clocked in');
    }

    const shift = await this.shiftsRepository.findOne({ where: { id: shiftId } });
    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    const now = new Date();
    const startTime = new Date(shift.startTime);
    const tenMinutesBefore = new Date(startTime.getTime() - 10 * 60 * 1000);

    if (now < tenMinutesBefore) {
      const minutesToWait = Math.ceil((tenMinutesBefore.getTime() - now.getTime()) / 60000);
      throw new BadRequestException(`Příliš brzy na příchod. Přihlásit se můžete nejdříve 10 minut před začátkem směny (za ${minutesToWait} min).`);
    }

    // Check if user is assigned
    const assignment = await this.assignmentsRepository.findOne({
      where: { userId, shiftId, status: AssignmentStatus.CONFIRMED }
    });
    
    if (!assignment) {
      throw new BadRequestException('Nejste přihlášen k této směně.');
    }

    const attendance = this.attendanceRepository.create({
      userId,
      shiftId,
      clockIn: now,
      notes: 'Manual web clock-in',
    });

    await this.attendanceRepository.save(attendance);

    return {
      message: 'Příchod úspěšně zaznamenán',
      attendance,
    };
  }

  // Manual clock-out from web interface
  async manualClockOut(userId: number) {
    const attendance = await this.attendanceRepository.findOne({
      where: { userId, clockOut: IsNull() },
      relations: ['shift']
    });

    if (!attendance) {
      throw new BadRequestException('Nenalezen žádný aktivní příchod.');
    }

    if (!attendance.shiftId) {
      throw new BadRequestException('Tato docházka není spojena s konkrétní směnou.');
    }

    const now = new Date();
    const endTime = new Date(attendance.shift.endTime);
    const tenMinutesBeforeEnd = new Date(endTime.getTime() - 10 * 60 * 1000);

    if (now < tenMinutesBeforeEnd) {
      const minutesRemaining = Math.ceil((tenMinutesBeforeEnd.getTime() - now.getTime()) / 60000);
      throw new BadRequestException(`Příliš brzy na odchod. Odhlásit se můžete nejdříve 10 minut před koncem směny (za ${minutesRemaining} min).`);
    }

    attendance.clockOut = now;
    await this.attendanceRepository.save(attendance);

    const hoursWorked = (attendance.clockOut.getTime() - attendance.clockIn.getTime()) / 3600000;

    return {
      message: 'Odchod úspěšně zaznamenán.',
      attendance: {
        ...attendance,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
      },
    };
  }

  // Get attendance records for a user
  async findByUser(userId: number, query: { 
    month?: number; 
    year?: number; 
    page?: number; 
    limit?: number;
    departmentId?: number;
  }) {
    const { month, year, departmentId } = query;
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 31;

    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.shift', 'shift')
      .leftJoinAndSelect('attendance.user', 'user')
      .where('attendance.userId = :userId', { userId });

    if (departmentId) {
      queryBuilder.andWhere('user.departmentId = :departmentId', { departmentId });
    }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      queryBuilder.andWhere('attendance.clockIn BETWEEN :start AND :end', { start: startDate, end: endDate });
    }

    queryBuilder.orderBy('attendance.clockIn', 'DESC');

    const [records, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Calculate total hours
    let totalHours = 0;
    records.forEach((record) => {
      if (record.clockOut) {
        totalHours += (record.clockOut.getTime() - record.clockIn.getTime()) / 3600000;
      }
    });

    return {
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalHours: Math.round(totalHours * 100) / 100,
      },
    };
  }

  // Get all attendance records (for managers/HR)
  async findAll(query: {
    departmentId?: number;
    userId?: number;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { departmentId, userId, startDate, endDate } = query;
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 50;

    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.user', 'user')
      .leftJoinAndSelect('attendance.shift', 'shift')
      .leftJoinAndSelect('user.department', 'department');

    if (userId) {
      queryBuilder.andWhere('attendance.userId = :userId', { userId });
    }

    if (departmentId) {
      queryBuilder.andWhere('user.departmentId = :departmentId', { departmentId });
    }

    if (startDate) {
      queryBuilder.andWhere('attendance.clockIn >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('attendance.clockIn <= :endDate', { endDate });
    }

    queryBuilder.orderBy('attendance.clockIn', 'DESC');

    const [records, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['user', 'shift'],
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    return attendance;
  }

  // Manual entry/correction by HR
  async update(id: number, updateData: { clockIn?: Date; clockOut?: Date; notes?: string }) {
    const attendance = await this.attendanceRepository.findOne({ where: { id } });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    Object.assign(attendance, updateData);
    return this.attendanceRepository.save(attendance);
  }

  async remove(id: number) {
    const attendance = await this.attendanceRepository.findOne({ where: { id } });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    await this.attendanceRepository.remove(attendance);
    return { message: 'Attendance record deleted' };
  }
}
