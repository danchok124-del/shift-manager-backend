import { User } from '@/entities';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class ClockInDto {
  @IsString()
  cardId: string;
}

export class ClockOutDto {
  @IsString()
  cardId: string;
}

export class ManualClockInDto {
  @IsNumber()
  shiftId: number;
}

export class UpdateAttendanceDto {
  @IsOptional()
  @IsDateString()
  clockIn?: string;

  @IsOptional()
  @IsDateString()
  clockOut?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export type RequestWithUser = Request & { user:User };
