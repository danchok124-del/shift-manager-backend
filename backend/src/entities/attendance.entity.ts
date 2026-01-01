import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Shift } from './shift.entity';
import { User } from './user.entity';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.attendanceRecords)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column()
  userId: number;

  @ManyToOne(() => Shift, (shift) => shift.attendanceRecords, { nullable: true })
  @JoinColumn({ name: 'shiftId' })
  shift: Shift;

  @Index()
  @Column({ type: 'int', nullable: true })
  shiftId: number | null;

  @Index()
  @Column({ type: 'timestamp' })
  clockIn: Date;

  @Column({ type: 'timestamp', nullable: true })
  clockOut: Date;

  @Column({ nullable: true })
  cardId: string; // Card used for clock-in/out

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
