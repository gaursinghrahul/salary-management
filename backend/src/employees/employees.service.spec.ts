import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Employee, EmploymentType } from './employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';

const mockEmployee = (): Employee => ({
  id: 'uuid-1',
  fullName: 'Jane Doe',
  jobTitle: 'Software Engineer',
  department: 'Engineering',
  country: 'United States',
  salary: 90000,
  email: 'jane.doe@company.com',
  hireDate: new Date('2022-01-10'),
  employmentType: EmploymentType.FULL_TIME,
  createdAt: new Date(),
  updatedAt: new Date(),
});

type MockRepository<T extends object> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T extends object>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
});

describe('EmployeesService', () => {
  let service: EmployeesService;
  let repo: MockRepository<Employee>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: getRepositoryToken(Employee), useValue: createMockRepository<Employee>() },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    repo = module.get<MockRepository<Employee>>(getRepositoryToken(Employee));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create and return a new employee', async () => {
      const dto: CreateEmployeeDto = {
        fullName: 'Jane Doe',
        jobTitle: 'Software Engineer',
        department: 'Engineering',
        country: 'United States',
        salary: 90000,
        email: 'jane.doe@company.com',
        hireDate: '2022-01-10',
        employmentType: EmploymentType.FULL_TIME,
      };
      const employee = mockEmployee();
      repo.findOne!.mockResolvedValue(null);
      repo.create!.mockReturnValue(employee);
      repo.save!.mockResolvedValue(employee);

      const result = await service.create(dto);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(employee);
      expect(result).toEqual(employee);
    });

    it('should throw ConflictException when email already exists', async () => {
      const dto: CreateEmployeeDto = {
        fullName: 'Jane Doe',
        jobTitle: 'Engineer',
        department: 'Engineering',
        country: 'United States',
        salary: 90000,
        email: 'jane.doe@company.com',
        hireDate: '2022-01-10',
        employmentType: EmploymentType.FULL_TIME,
      };
      repo.findOne!.mockResolvedValue(mockEmployee());

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated employees with total count', async () => {
      const employees = [mockEmployee(), { ...mockEmployee(), id: 'uuid-2' }];
      repo.findAndCount!.mockResolvedValue([employees, 2]);
      const query: QueryEmployeeDto = { page: 1, limit: 20 };

      const result = await service.findAll(query);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should apply country filter', async () => {
      repo.findAndCount!.mockResolvedValue([[mockEmployee()], 1]);
      const query: QueryEmployeeDto = { country: 'United States', page: 1, limit: 20 };

      await service.findAll(query);

      const callArg = repo.findAndCount!.mock.calls[0][0];
      expect(callArg.where).toMatchObject({ country: 'United States' });
    });

    it('should calculate correct skip offset for pagination', async () => {
      repo.findAndCount!.mockResolvedValue([[], 0]);
      await service.findAll({ page: 3, limit: 10 });

      const callArg = repo.findAndCount!.mock.calls[0][0];
      expect(callArg.skip).toBe(20);
      expect(callArg.take).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return an employee by id', async () => {
      const employee = mockEmployee();
      repo.findOne!.mockResolvedValue(employee);

      const result = await service.findOne('uuid-1');

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
      expect(result).toEqual(employee);
    });

    it('should throw NotFoundException when employee not found', async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the employee', async () => {
      const employee = mockEmployee();
      const updated = { ...employee, salary: 95000 };
      const dto: UpdateEmployeeDto = { salary: 95000 };

      repo.findOne!.mockResolvedValue(employee);
      repo.merge!.mockReturnValue(updated);
      repo.save!.mockResolvedValue(updated);

      const result = await service.update('uuid-1', dto);

      expect(repo.merge).toHaveBeenCalledWith(employee, dto);
      expect(result.salary).toBe(95000);
    });

    it('should throw NotFoundException when updating non-existent employee', async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(service.update('non-existent', { salary: 100 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete an employee and return void', async () => {
      repo.findOne!.mockResolvedValue(mockEmployee());
      repo.delete!.mockResolvedValue({ affected: 1 });

      await expect(service.remove('uuid-1')).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('should throw NotFoundException when deleting non-existent employee', async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
