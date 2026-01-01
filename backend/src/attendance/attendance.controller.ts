import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { UserRole } from '../entities/enums'
import { AttendanceService } from './attendance.service'
import { ClockInDto, ClockOutDto, ManualClockInDto, RequestWithUser, UpdateAttendanceDto } from './dto/attendance.dto'

@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  // Hardware device endpoints (no auth - uses card ID)
  @Post('clock-in')
  async clockIn(@Body() clockInDto: ClockInDto) {
    return this.attendanceService.clockIn(clockInDto);
  }

  @Post('clock-out')
  async clockOut(@Body() clockOutDto: ClockOutDto) {
    return this.attendanceService.clockOut(clockOutDto);
  }

  @Post('manual-clock-in')
  @UseGuards(AuthGuard('jwt'))
  async manualClockIn(@Request() req: RequestWithUser, @Body() manualClockInDto: ManualClockInDto) {
    return this.attendanceService.manualClockIn(req.user.id, manualClockInDto.shiftId);
  }

  @Post('manual-clock-out')
  @UseGuards(AuthGuard('jwt'))
  async manualClockOut(@Request() req: RequestWithUser) {
    return this.attendanceService.manualClockOut(req.user.id);
  }

  // Get own attendance records
  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  async getMyAttendance(
    @Request() req: RequestWithUser,
    @Query('month') month?: number,
    @Query('year') year?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.attendanceService.findByUser(req.user.id, { month, year, page, limit });
  }

  // Get all attendance (for managers/HR)
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.HR)
  async findAll(
    @Request() req: RequestWithUser,
    @Query('departmentId') departmentId?: number,
    @Query('userId') userId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // Managers can only see their department
    const effectiveDepartmentId = 
      req.user.role === UserRole.MANAGER ? req.user.departmentId ?? undefined : departmentId;

    return this.attendanceService.findAll({
      departmentId: effectiveDepartmentId,
      userId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page,
      limit,
    });
  }

  // Get attendance for specific user
  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
    @Query('month') month?: number,
    @Query('year') year?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // Users can only see their own or managers/HR can see others
    if (req.user.id !== userId && 
        req.user.role !== UserRole.MANAGER && 
        req.user.role !== UserRole.HR) {
      throw new ForbiddenException('You can only view your own attendance records');
    }

    // Additional check for Managers: can only see users from their department
    if (req.user.role === UserRole.MANAGER && req.user.id !== userId) {
      return this.attendanceService.findByUser(userId, { 
        month, 
        year, 
        page, 
        limit,
        departmentId: req.user.departmentId ?? -1 // -1 ensures no results if manager has no department
      });
    }

    return this.attendanceService.findByUser(userId, { month, year, page, limit });
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.findOne(id);
  }

  // Manual correction by HR
  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.HR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, {
      clockIn: updateAttendanceDto.clockIn ? new Date(updateAttendanceDto.clockIn) : undefined,
      clockOut: updateAttendanceDto.clockOut ? new Date(updateAttendanceDto.clockOut) : undefined,
      notes: updateAttendanceDto.notes,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.HR)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.remove(id);
  }
}
