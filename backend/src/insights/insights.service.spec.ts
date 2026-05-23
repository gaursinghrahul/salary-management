import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InsightsService } from './insights.service';
import { Employee } from '../employees/employee.entity';

const createMockQueryBuilder = (returnValue: unknown) => ({
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  getRawMany: jest.fn().mockResolvedValue(returnValue),
  getRawOne: jest.fn().mockResolvedValue(returnValue),
});

describe('InsightsService', () => {
  let service: InsightsService;
  let mockRepo: { createQueryBuilder: jest.Mock };

  beforeEach(async () => {
    mockRepo = { createQueryBuilder: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsightsService,
        { provide: getRepositoryToken(Employee), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<InsightsService>(InsightsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getCountryStats', () => {
    it('should return min, max, avg salary and employee count for a country', async () => {
      const rawResult = {
        min: '45000',
        max: '180000',
        avg: '95000.50',
        count: '250',
      };
      mockRepo.createQueryBuilder.mockReturnValue(createMockQueryBuilder(rawResult));

      const result = await service.getCountryStats('United States');

      expect(result.country).toBe('United States');
      expect(result.min).toBe(45000);
      expect(result.max).toBe(180000);
      expect(Number(result.avg.toFixed(2))).toBe(95000.5);
      expect(result.count).toBe(250);
    });

    it('should return zeros when no employees in country', async () => {
      const rawResult = { min: null, max: null, avg: null, count: '0' };
      mockRepo.createQueryBuilder.mockReturnValue(createMockQueryBuilder(rawResult));

      const result = await service.getCountryStats('Antarctica');

      expect(result.min).toBe(0);
      expect(result.max).toBe(0);
      expect(result.avg).toBe(0);
      expect(result.count).toBe(0);
    });
  });

  describe('getJobTitleAvgInCountry', () => {
    it('should return average salary for a job title in a country', async () => {
      const rawResult = { avg: '105000.00', count: '42' };
      mockRepo.createQueryBuilder.mockReturnValue(createMockQueryBuilder(rawResult));

      const result = await service.getJobTitleAvgInCountry('Software Engineer', 'United States');

      expect(result.jobTitle).toBe('Software Engineer');
      expect(result.country).toBe('United States');
      expect(result.avg).toBe(105000);
      expect(result.count).toBe(42);
    });

    it('should return zero avg when no matching employees', async () => {
      const rawResult = { avg: null, count: '0' };
      mockRepo.createQueryBuilder.mockReturnValue(createMockQueryBuilder(rawResult));

      const result = await service.getJobTitleAvgInCountry('Astronaut', 'Antarctica');

      expect(result.avg).toBe(0);
      expect(result.count).toBe(0);
    });
  });

  describe('getDepartmentStats', () => {
    it('should return salary stats grouped by department', async () => {
      const rawResult = [
        { department: 'Engineering', avg: '110000', min: '70000', max: '200000', count: '500' },
        { department: 'Sales', avg: '75000', min: '40000', max: '130000', count: '300' },
      ];
      mockRepo.createQueryBuilder.mockReturnValue(createMockQueryBuilder(rawResult));

      const result = await service.getDepartmentStats();

      expect(result).toHaveLength(2);
      expect(result[0].department).toBe('Engineering');
      expect(result[0].avg).toBe(110000);
      expect(result[1].count).toBe(300);
    });
  });

  describe('getTopEarners', () => {
    it('should return top N employees by salary', async () => {
      const rawResult = [
        { id: 'uuid-1', fullName: 'Alice', salary: '200000', jobTitle: 'VP', country: 'US' },
        { id: 'uuid-2', fullName: 'Bob', salary: '190000', jobTitle: 'Director', country: 'US' },
      ];
      mockRepo.createQueryBuilder.mockReturnValue(createMockQueryBuilder(rawResult));

      const result = await service.getTopEarners(2);

      expect(result).toHaveLength(2);
      expect(result[0].salary).toBe(200000);
      expect(result[1].fullName).toBe('Bob');
    });
  });

  describe('getDistinctCountries', () => {
    it('should return sorted list of distinct countries', async () => {
      const rawResult = [{ country: 'Germany' }, { country: 'India' }, { country: 'USA' }];
      mockRepo.createQueryBuilder.mockReturnValue(createMockQueryBuilder(rawResult));

      const result = await service.getDistinctCountries();

      expect(result).toEqual(['Germany', 'India', 'USA']);
    });
  });

  describe('getDistinctJobTitles', () => {
    it('should return sorted list of distinct job titles', async () => {
      const rawResult = [{ jobTitle: 'Analyst' }, { jobTitle: 'Engineer' }, { jobTitle: 'Manager' }];
      mockRepo.createQueryBuilder.mockReturnValue(createMockQueryBuilder(rawResult));

      const result = await service.getDistinctJobTitles();

      expect(result).toEqual(['Analyst', 'Engineer', 'Manager']);
    });
  });
});
