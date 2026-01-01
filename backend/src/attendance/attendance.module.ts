import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Attendance } from '../entities/attendance.entity'
import { ShiftAssignment } from '../entities/shift-assignment.entity'
import { Shift } from '../entities/shift.entity'
import { User } from '../entities/user.entity'
import { AttendanceController } from './attendance.controller'
import { AttendanceService } from './attendance.service'

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, User, Shift, ShiftAssignment])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
