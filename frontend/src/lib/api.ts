const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Employee {
  id: string;
  fullName: string;
  jobTitle: string;
  department: string;
  country: string;
  salary: number;
  email: string;
  hireDate: string;
  employmentType: 'full-time' | 'part-time' | 'contractor';
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedEmployees {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
}

export interface EmployeeQuery {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  jobTitle?: string;
  department?: string;
  employmentType?: string;
}

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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  employees: {
    list: (query: EmployeeQuery = {}): Promise<PaginatedEmployees> => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.set(k, String(v));
      });
      return request<PaginatedEmployees>(`/employees?${params}`);
    },
    get: (id: string): Promise<Employee> => request<Employee>(`/employees/${id}`),
    create: (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> =>
      request<Employee>('/employees', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Employee>): Promise<Employee> =>
      request<Employee>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string): Promise<void> =>
      request<void>(`/employees/${id}`, { method: 'DELETE' }),
  },
  insights: {
    countryStats: (country: string): Promise<CountryStats> =>
      request<CountryStats>(`/insights/country-stats?country=${encodeURIComponent(country)}`),
    jobTitleAvg: (jobTitle: string, country: string): Promise<JobTitleStats> =>
      request<JobTitleStats>(
        `/insights/job-title-avg?jobTitle=${encodeURIComponent(jobTitle)}&country=${encodeURIComponent(country)}`,
      ),
    departmentStats: (): Promise<DepartmentStats[]> =>
      request<DepartmentStats[]>('/insights/department-stats'),
    topEarners: (limit = 10): Promise<TopEarner[]> =>
      request<TopEarner[]>(`/insights/top-earners?limit=${limit}`),
    countries: (): Promise<string[]> => request<string[]>('/insights/countries'),
    jobTitles: (): Promise<string[]> => request<string[]>('/insights/job-titles'),
  },
};
