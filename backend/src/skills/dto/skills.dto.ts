import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SkillStatus } from '../../entities/user-skill.entity';

export class CreateSkillDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AssignSkillDto {
  @IsNumber()
  skillId: number;
}

export class UpdateUserSkillDto {
  @IsEnum(SkillStatus)
  status: SkillStatus;
}
