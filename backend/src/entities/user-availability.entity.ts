import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_availabilities')
export class UserAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.availabilities)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column()
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.

  @Column({ type: 'time' })
  startTime: string; // Time when unavailable starts

  @Column({ type: 'time' })
  endTime: string; // Time when unavailable ends

  @Column({ nullable: true })
  reason: string; // e.g., "School", "Medical appointment"

  @Column({ default: true })
  isRecurring: boolean; // Weekly recurring

  @Column({ type: 'date', nullable: true })
  specificDate: Date; // For non-recurring unavailability

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
