import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	Unique,
	UpdateDateColumn,
} from 'typeorm'
import { Shift } from './shift.entity'
import { User } from './user.entity'

export enum AssignmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Entity('shift_assignments')
@Unique(['userId', 'shiftId'])
export class ShiftAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.shiftAssignments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Shift, (shift) => shift.assignments)
  @JoinColumn({ name: 'shiftId' })
  shift: Shift;

  @Column()
  shiftId: number;

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.PENDING,
  })
  status: AssignmentStatus;

  @Column({ type: 'int', nullable: true })
  assignedById: number | null; // Manager who assigned, null if self-assigned

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
