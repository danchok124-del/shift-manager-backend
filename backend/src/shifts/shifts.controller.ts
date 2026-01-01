import {
    Body,
    Controller,
    Delete,
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
import { AssignShiftDto, CreateShiftDto, UpdateShiftDto } from './dto/shifts.dto';
import { ShiftsService } from './shifts.service';

interface AuthenticatedRequest {
  user: User;
}

@Controller('shifts')
export class ShiftsController {
  constructor(private shiftsService: ShiftsService) {}

  // Public endpoint - list public shifts (for unauthenticated users)
  @Get('public')
  async findPublic(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.shiftsService.findPublic({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page,
      limit,
    });
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(
    @Query('departmentId') departmentId?: number,
    @Query('isPublic') isPublic?: boolean,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.shiftsService.findAll({
      departmentId,
      isPublic,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page,
      limit,
    });
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shiftsService.findOne(id);
  }

  @Get(':id/assignments')
  @UseGuards(AuthGuard('jwt'))
  async getAssignments(@Param('id', ParseIntPipe) id: number) {
    return this.shiftsService.getAssignments(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.HR)
  async create(@Body() createShiftDto: CreateShiftDto, @Request() req: AuthenticatedRequest) {
    return this.shiftsService.create(createShiftDto, req.user);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.HR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShiftDto: UpdateShiftDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.shiftsService.update(id, updateShiftDto, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.HR)
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: AuthenticatedRequest) {
    return this.shiftsService.remove(id, req.user);
  }

  @Post(':id/assign')
  @UseGuards(AuthGuard('jwt'))
  async assignUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignDto: AssignShiftDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.shiftsService.assignUser(id, assignDto, req.user);
  }

  @Delete(':id/assign/:userId')
  @UseGuards(AuthGuard('jwt'))
  async removeAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.shiftsService.removeAssignment(id, userId, req.user);
  }
}
