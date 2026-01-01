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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../entities/enums';
import { User } from '../entities/user.entity';
import { DelegateDto, UpdateAvailabilityDto, UpdateRoleDto, UpdateUserDto } from './dto/users.dto';
import { UsersService } from './users.service';

interface AuthenticatedRequest {
  user: User;
}

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.HR, UserRole.MANAGER)
  async findAll(
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: number,
    @Query('role') role?: UserRole,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.findAll({ search, departmentId, role, page, limit });
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Request() req: AuthenticatedRequest) {
    return this.usersService.findOne(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @Put(':id/role')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.HR)
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.usersService.updateRole(id, updateRoleDto.role);
  }

  @Get(':id/schedule')
  @UseGuards(AuthGuard('jwt'))
  async getSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: AuthenticatedRequest,
  ) {
    if (req.user.role !== UserRole.HR && req.user.id !== id) {
      if (req.user.role === UserRole.MANAGER) {
        const targetUser = await this.usersService.findOne(id);
        if (targetUser.departmentId !== req.user.departmentId) {
          throw new ForbiddenException('Managers can only view schedules of users in their own department');
        }
      } else {
        throw new ForbiddenException('You can only view your own schedule');
      }
    }

    return this.usersService.getSchedule(
      id,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id/report')
  @UseGuards(AuthGuard('jwt'))
  async getWorkReport(
    @Param('id', ParseIntPipe) id: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Request() req: AuthenticatedRequest,
  ) {
    if (req.user.role !== UserRole.HR && req.user.id !== id) {
      if (req.user.role === UserRole.MANAGER) {
        const targetUser = await this.usersService.findOne(id);
        if (targetUser.departmentId !== req.user.departmentId) {
          throw new ForbiddenException('Managers can only view reports of users in their own department');
        }
      } else {
        throw new ForbiddenException('You can only view your own work report');
      }
    }

    return this.usersService.getWorkReport(id, month, year);
  }

  @Get(':id/availabilities')
  @UseGuards(AuthGuard('jwt'))
  async getAvailabilities(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getAvailabilities(id);
  }

  @Post(':id/availabilities')
  @UseGuards(AuthGuard('jwt'))
  async createAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.usersService.createAvailability(id, dto);
  }

  @Delete(':id/availabilities/:availabilityId')
  @UseGuards(AuthGuard('jwt'))
  async deleteAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Param('availabilityId', ParseIntPipe) availabilityId: number,
  ) {
    return this.usersService.deleteAvailability(id, availabilityId);
  }

  @Post('delegate')
  @UseGuards(AuthGuard('jwt'))
  async delegate(@Request() req: AuthenticatedRequest, @Body() delegateDto: DelegateDto) {
    return this.usersService.delegate(req.user, delegateDto);
  }

  @Delete(':id/delegation')
  @UseGuards(AuthGuard('jwt'))
  async revokeDelegation(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.revokeDelegation(id);
  }
}
