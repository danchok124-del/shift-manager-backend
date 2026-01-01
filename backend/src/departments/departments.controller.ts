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
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../entities/enums';
import { DepartmentsService } from './departments.service';
import { AddUserDto, CreateDepartmentDto, UpdateDepartmentDto } from './dto/departments.dto';

@Controller('departments')
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.departmentsService.findAll({ search, page, limit });
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.findOne(id);
  }

  @Get(':id/users')
  @UseGuards(AuthGuard('jwt'))
  async getUsers(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.getUsers(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.HR)
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.HR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.HR)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.remove(id);
  }

  @Post(':id/users')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.HR)
  async addUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() addUserDto: AddUserDto,
  ) {
    return this.departmentsService.addUser(id, addUserDto.userId);
  }

  @Delete(':id/users/:userId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.HR)
  async removeUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.departmentsService.removeUser(id, userId);
  }
}
