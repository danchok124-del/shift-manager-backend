import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Attendance } from './attendance.entity';
import { Department } from './department.entity';
import { ShiftAssignment } from './shift-assignment.entity';

@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Index()
  @Column({ type: 'timestamp' })
  startTime: Date;

  @Index()
  @Column({ type: 'timestamp' })
  endTime: Date;

  @ManyToOne(() => Department, (department: Department) => department.shifts)
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Index()
  @Column()
  departmentId: number;

  @Column({ default: false })
  isPublic: boolean; // Available for other departments

  @Column({ default: 1 })
  requiredEmployees: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ShiftAssignment, (assignment) => assignment.shift)
  assignments: ShiftAssignment[];

  @OneToMany(() => Attendance, (attendance) => attendance.shift)
  attendanceRecords: Attendance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
