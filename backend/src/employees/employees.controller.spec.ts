import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { Employee, EmploymentType } from './employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
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

const mockEmployeesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('EmployeesController', () => {
  let controller: EmployeesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [{ provide: EmployeesService, useValue: mockEmployeesService }],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should call service.create and return the employee', async () => {
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
      mockEmployeesService.create.mockResolvedValue(employee);

      const result = await controller.create(dto);

      expect(mockEmployeesService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(employee);
    });
  });

  describe('findAll', () => {
    it('should return paginated result from service', async () => {
      const paginated = { data: [mockEmployee()], total: 1, page: 1, limit: 20 };
      mockEmployeesService.findAll.mockResolvedValue(paginated);
      const query: QueryEmployeeDto = { page: 1, limit: 20 };

      const result = await controller.findAll(query);

      expect(mockEmployeesService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(paginated);
    });
  });

  describe('findOne', () => {
    it('should return a single employee by id', async () => {
      const employee = mockEmployee();
      mockEmployeesService.findOne.mockResolvedValue(employee);

      const result = await controller.findOne('uuid-1');

      expect(mockEmployeesService.findOne).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(employee);
    });
  });

  describe('update', () => {
    it('should call service.update and return updated employee', async () => {
      const updated = { ...mockEmployee(), salary: 100000 };
      mockEmployeesService.update.mockResolvedValue(updated);

      const result = await controller.update('uuid-1', { salary: 100000 });

      expect(mockEmployeesService.update).toHaveBeenCalledWith('uuid-1', { salary: 100000 });
      expect(result.salary).toBe(100000);
    });
  });

  describe('remove', () => {
    it('should call service.remove and return 204 No Content', async () => {
      mockEmployeesService.remove.mockResolvedValue(undefined);

      await expect(controller.remove('uuid-1')).resolves.toBeUndefined();
      expect(mockEmployeesService.remove).toHaveBeenCalledWith('uuid-1');
    });
  });
});
