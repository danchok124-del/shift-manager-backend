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
} from 'typeorm'
import { Attendance } from './attendance.entity'
import { Department } from './department.entity'
import { UserRole } from './enums'
import { ShiftAssignment } from './shift-assignment.entity'
import { UserAvailability } from './user-availability.entity'
import { UserSkill } from './user-skill.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Index()
  @Column({ nullable: true })
  cardId: string; // For hardware attendance tracking

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Department, (department) => department.users, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Index()
  @Column({ type: 'int', nullable: true })
  departmentId: number | null;

  // Delegation: who delegated rights to this user
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'delegatedById' })
  delegatedBy: User;

  @Column({ type: 'int', nullable: true })
  delegatedById: number | null;

  @Column({ type: 'timestamp', nullable: true })
  delegationExpiresAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  @OneToMany(() => ShiftAssignment, (assignment) => assignment.user)
  shiftAssignments: ShiftAssignment[];

  @OneToMany(() => Attendance, (attendance) => attendance.user)
  attendanceRecords: Attendance[];

  @OneToMany(() => UserSkill, (userSkill) => userSkill.user)
  skills: UserSkill[];

  @OneToMany(() => UserAvailability, (availability) => availability.user)
  availabilities: UserAvailability[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
