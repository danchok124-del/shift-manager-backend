import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm'
import { UserSkill } from './user-skill.entity'

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => UserSkill, (userSkill: UserSkill) => userSkill.skill)
  userSkills: UserSkill[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
