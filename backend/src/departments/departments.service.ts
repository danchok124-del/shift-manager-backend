import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Department } from '../entities/department.entity';
import { User } from '../entities/user.entity';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/departments.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(query: { search?: string; page?: number; limit?: number }) {
    const { search } = query;
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;

    const queryBuilder = this.departmentsRepository
      .createQueryBuilder('department')
      .loadRelationCountAndMap('department.userCount', 'department.users');

    if (search) {
      queryBuilder.andWhere('department.name ILIKE :search', { search: `%${search}%` });
    }

    const [departments, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: departments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const department = await this.departmentsRepository.findOne({
      where: { id },
      relations: ['users', 'shifts'],
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async create(createDepartmentDto: CreateDepartmentDto) {
    const existing = await this.departmentsRepository.findOne({
      where: { name: createDepartmentDto.name },
    });

    if (existing) {
      throw new ConflictException('Department with this name already exists');
    }

    const department = this.departmentsRepository.create(createDepartmentDto);
    return this.departmentsRepository.save(department);
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.departmentsRepository.findOne({ where: { id } });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    Object.assign(department, updateDepartmentDto);
    return this.departmentsRepository.save(department);
  }

  async remove(id: number) {
    const department = await this.departmentsRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Soft delete - just deactivate
    department.isActive = false;
    await this.departmentsRepository.save(department);

    return { message: 'Department deactivated' };
  }

  async addUser(departmentId: number, userId: number) {
    const department = await this.departmentsRepository.findOne({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.departmentId = departmentId;
    await this.usersRepository.save(user);

    return { message: 'User added to department' };
  }

  async removeUser(departmentId: number, userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId, departmentId },
    });

    if (!user) {
      throw new NotFoundException('User not found in this department');
    }

    user.departmentId = null;
    await this.usersRepository.save(user);

    return { message: 'User removed from department' };
  }

  async getUsers(departmentId: number) {
    const department = await this.departmentsRepository.findOne({
      where: { id: departmentId },
      relations: ['users'],
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department.users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }));
  }
}
