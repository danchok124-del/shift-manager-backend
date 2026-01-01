import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Shift } from './shift.entity';
import { User } from './user.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => User, (user: User) => user.department)
  users: User[];

  @OneToMany(() => Shift, (shift: Shift) => shift.department)
  shifts: Shift[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
