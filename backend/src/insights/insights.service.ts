import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../employees/employee.entity';

export interface CountryStats {
  country: string;
  min: number;
  max: number;
  avg: number;
  count: number;
}

export interface JobTitleStats {
  jobTitle: string;
  country: string;
  avg: number;
  count: number;
}

export interface DepartmentStats {
  department: string;
  avg: number;
  min: number;
  max: number;
  count: number;
}

export interface TopEarner {
  id: string;
  fullName: string;
  salary: number;
  jobTitle: string;
  country: string;
}

@Injectable()
export class InsightsService {
  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
  ) {}

  async getCountryStats(country: string): Promise<CountryStats> {
    const raw = await this.repo
      .createQueryBuilder('e')
      .select('MIN(e.salary)', 'min')
      .addSelect('MAX(e.salary)', 'max')
      .addSelect('AVG(e.salary)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('e.country = :country', { country })
      .getRawOne();

    return {
      country,
      min: raw?.min ? Number(raw.min) : 0,
      max: raw?.max ? Number(raw.max) : 0,
      avg: raw?.avg ? Number(raw.avg) : 0,
      count: raw?.count ? Number(raw.count) : 0,
    };
  }

  async getJobTitleAvgInCountry(jobTitle: string, country: string): Promise<JobTitleStats> {
    const raw = await this.repo
      .createQueryBuilder('e')
      .select('AVG(e.salary)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('e.jobTitle = :jobTitle', { jobTitle })
      .andWhere('e.country = :country', { country })
      .getRawOne();

    return {
      jobTitle,
      country,
      avg: raw?.avg ? Number(raw.avg) : 0,
      count: raw?.count ? Number(raw.count) : 0,
    };
  }

  async getDepartmentStats(): Promise<DepartmentStats[]> {
    const rows = await this.repo
      .createQueryBuilder('e')
      .select('e.department', 'department')
      .addSelect('AVG(e.salary)', 'avg')
      .addSelect('MIN(e.salary)', 'min')
      .addSelect('MAX(e.salary)', 'max')
      .addSelect('COUNT(*)', 'count')
      .groupBy('e.department')
      .orderBy('avg', 'DESC')
      .getRawMany();

    return rows.map((r) => ({
      department: r.department,
      avg: Number(r.avg),
      min: Number(r.min),
      max: Number(r.max),
      count: Number(r.count),
    }));
  }

  async getTopEarners(limit = 10): Promise<TopEarner[]> {
    const rows = await this.repo
      .createQueryBuilder('e')
      .select('e.id', 'id')
      .addSelect('e.fullName', 'fullName')
      .addSelect('e.salary', 'salary')
      .addSelect('e.jobTitle', 'jobTitle')
      .addSelect('e.country', 'country')
      .orderBy('e.salary', 'DESC')
      .limit(limit)
      .getRawMany();

    return rows.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      salary: Number(r.salary),
      jobTitle: r.jobTitle,
      country: r.country,
    }));
  }

  async getDistinctCountries(): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder('e')
      .select('DISTINCT e.country', 'country')
      .orderBy('country', 'ASC')
      .getRawMany();

    return rows.map((r) => r.country);
  }

  async getDistinctJobTitles(): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder('e')
      .select('DISTINCT e.jobTitle', 'jobTitle')
      .orderBy('"jobTitle"', 'ASC')
      .getRawMany();

    return rows.map((r) => r.jobTitle);
  }
}
