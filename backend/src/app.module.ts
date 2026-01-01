import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TypeOrmModule } from '@nestjs/typeorm'
import { join } from 'path'

// Environment validation function
function validateEnvironment(config: Record<string, unknown>) {
  const required = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE', 'JWT_SECRET'];
  const missing = required.filter((key) => !config[key]);
  
  if (missing.length > 0) {
    throw new Error(`❌ Missing required environment variables: ${missing.join(', ')}. Please check your .env file.`);
  }
  
  if (typeof config.JWT_SECRET === 'string' && config.JWT_SECRET.length < 32) {
    throw new Error('❌ JWT_SECRET must be at least 32 characters long for security. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  }
  
  return config;
}

import { AttendanceModule } from './attendance/attendance.module'
import { AuthModule } from './auth/auth.module'
import { DepartmentsModule } from './departments/departments.module'
import { ShiftsModule } from './shifts/shifts.module'
import { SkillsModule } from './skills/skills.module'
import { UsersModule } from './users/users.module'

import { Attendance } from './entities/attendance.entity'
import { Department } from './entities/department.entity'
import { ShiftAssignment } from './entities/shift-assignment.entity'
import { Shift } from './entities/shift.entity'
import { Skill } from './entities/skill.entity'
import { UserAvailability } from './entities/user-availability.entity'
import { UserSkill } from './entities/user-skill.entity'
import { User } from './entities/user.entity'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'shift_management'),
        entities: [
          User,
          Department,
          Shift,
          ShiftAssignment,
          Attendance,
          Skill,
          UserSkill,
          UserAvailability,
        ],
        synchronize: true,
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'dist'),
      exclude: ['/api*'],
    }),
    AuthModule,
    UsersModule,
    DepartmentsModule,
    ShiftsModule,
    AttendanceModule,
    SkillsModule,
  ],
})
export class AppModule {}
