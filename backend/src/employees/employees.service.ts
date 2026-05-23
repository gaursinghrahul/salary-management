import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, ILike } from 'typeorm';
import { Employee } from './employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException(`Employee with email ${dto.email} already exists`);
    }
    const employee = this.repo.create(dto);
    return this.repo.save(employee);
  }

  async findAll(query: QueryEmployeeDto): Promise<PaginatedResult<Employee>> {
    const { page = 1, limit = 20, search, country, jobTitle, department, employmentType } = query;

    const where: Record<string, unknown> = {};
    if (country) where.country = country;
    if (jobTitle) where.jobTitle = jobTitle;
    if (department) where.department = department;
    if (employmentType) where.employmentType = employmentType;
    if (search) where.fullName = ILike(`%${search}%`);

    const options: FindManyOptions<Employee> = {
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { fullName: 'ASC' },
    };

    const [data, total] = await this.repo.findAndCount(options);
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.repo.findOne({ where: { id } });
    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);
    const updated = this.repo.merge(employee, dto);
    return this.repo.save(updated);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
