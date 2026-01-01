import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import { Skill } from './skill.entity';
import { User } from './user.entity';

export enum SkillStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('user_skills')
@Unique(['userId', 'skillId'])
export class UserSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.skills)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Skill, (skill) => skill.userSkills)
  @JoinColumn({ name: 'skillId' })
  skill: Skill;

  @Column()
  skillId: number;

  @Column({
    type: 'enum',
    enum: SkillStatus,
    default: SkillStatus.PENDING,
  })
  status: SkillStatus;

  @Column({ nullable: true })
  approvedById: number; // HR who approved

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
