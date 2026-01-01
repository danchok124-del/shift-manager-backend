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
import { AssignSkillDto, CreateSkillDto, UpdateSkillDto, UpdateUserSkillDto } from './dto/skills.dto';
import { SkillsService } from './skills.service';

interface AuthenticatedRequest {
  user: User;
}

@Controller('skills')
export class SkillsController {
  constructor(private skillsService: SkillsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.skillsService.findAll({ search, page, limit });
  }

  @Get('pending')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.HR)
  async getPendingApprovals() {
    return this.skillsService.getPendingApprovals();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.skillsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.HR)
  async create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.HR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return this.skillsService.update(id, updateSkillDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.HR)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.skillsService.remove(id);
  }

  // User skill endpoints
  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getUserSkills(@Param('userId', ParseIntPipe) userId: number) {
    return this.skillsService.getUserSkills(userId);
  }

  @Post('user/:userId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.HR)
  async assignToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() assignSkillDto: AssignSkillDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.skillsService.assignToUser(userId, assignSkillDto, req.user.id);
  }

  @Put('user/:userId/:skillId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.HR)
  async updateUserSkill(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('skillId', ParseIntPipe) skillId: number,
    @Body() updateDto: UpdateUserSkillDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.skillsService.updateUserSkill(userId, skillId, updateDto, req.user.id);
  }

  @Delete('user/:userId/:skillId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.HR)
  async removeFromUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('skillId', ParseIntPipe) skillId: number,
  ) {
    return this.skillsService.removeFromUser(userId, skillId);
  }
}
