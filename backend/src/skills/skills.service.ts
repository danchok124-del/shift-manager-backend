import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Skill } from '../entities/skill.entity';
import { SkillStatus, UserSkill } from '../entities/user-skill.entity';
import { AssignSkillDto, CreateSkillDto, UpdateSkillDto, UpdateUserSkillDto } from './dto/skills.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,
    @InjectRepository(UserSkill)
    private userSkillsRepository: Repository<UserSkill>,
  ) {}

  async findAll(query: { search?: string; page?: number; limit?: number }) {
    const { search } = query;
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 50;

    const queryBuilder = this.skillsRepository
      .createQueryBuilder('skill')
      .where('skill.isActive = :isActive', { isActive: true });

    if (search) {
      queryBuilder.andWhere('skill.name ILIKE :search', { search: `%${search}%` });
    }

    const [skills, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: skills,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: ['userSkills', 'userSkills.user'],
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  async create(createSkillDto: CreateSkillDto) {
    const existing = await this.skillsRepository.findOne({
      where: { name: createSkillDto.name },
    });

    if (existing) {
      throw new ConflictException('Skill with this name already exists');
    }

    const skill = this.skillsRepository.create(createSkillDto);
    return this.skillsRepository.save(skill);
  }

  async update(id: number, updateSkillDto: UpdateSkillDto) {
    const skill = await this.skillsRepository.findOne({ where: { id } });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    Object.assign(skill, updateSkillDto);
    return this.skillsRepository.save(skill);
  }

  async remove(id: number) {
    const skill = await this.skillsRepository.findOne({ where: { id } });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    skill.isActive = false;
    await this.skillsRepository.save(skill);

    return { message: 'Skill deactivated' };
  }

  // User skill management
  async assignToUser(userId: number, assignSkillDto: AssignSkillDto, approvedById?: number) {
    const existing = await this.userSkillsRepository.findOne({
      where: { userId, skillId: assignSkillDto.skillId },
    });

    if (existing) {
      throw new ConflictException('User already has this skill assigned');
    }

    const userSkill = this.userSkillsRepository.create({
      userId,
      skillId: assignSkillDto.skillId,
      status: approvedById ? SkillStatus.APPROVED : SkillStatus.PENDING,
      approvedById,
    });

    return this.userSkillsRepository.save(userSkill);
  }

  async updateUserSkill(userId: number, skillId: number, updateDto: UpdateUserSkillDto, approvedById: number) {
    const userSkill = await this.userSkillsRepository.findOne({
      where: { userId, skillId },
    });

    if (!userSkill) {
      throw new NotFoundException('User skill not found');
    }

    userSkill.status = updateDto.status;
    if (updateDto.status === SkillStatus.APPROVED) {
      userSkill.approvedById = approvedById;
    }

    return this.userSkillsRepository.save(userSkill);
  }

  async removeFromUser(userId: number, skillId: number) {
    const result = await this.userSkillsRepository.delete({ userId, skillId });

    if (result.affected === 0) {
      throw new NotFoundException('User skill not found');
    }

    return { message: 'Skill removed from user' };
  }

  async getUserSkills(userId: number) {
    return this.userSkillsRepository.find({
      where: { userId },
      relations: ['skill'],
    });
  }

  async getPendingApprovals() {
    return this.userSkillsRepository.find({
      where: { status: SkillStatus.PENDING },
      relations: ['user', 'skill'],
    });
  }
}
