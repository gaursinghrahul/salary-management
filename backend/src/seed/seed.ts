import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Employee, EmploymentType } from '../employees/employee.entity';

// ── Reference data ────────────────────────────────────────────────────────────

const JOB_TITLES = [
  'Software Engineer',
  'Senior Software Engineer',
  'Product Manager',
  'Data Analyst',
  'UX Designer',
  'Sales Manager',
  'Marketing Specialist',
  'HR Manager',
  'Finance Analyst',
  'DevOps Engineer',
  'QA Engineer',
  'Technical Lead',
  'Business Analyst',
  'Customer Success Manager',
  'Operations Manager',
];

const DEPARTMENTS: Record<string, string> = {
  'Software Engineer': 'Engineering',
  'Senior Software Engineer': 'Engineering',
  'Technical Lead': 'Engineering',
  'DevOps Engineer': 'Engineering',
  'QA Engineer': 'Engineering',
  'Product Manager': 'Product',
  'UX Designer': 'Design',
  'Data Analyst': 'Analytics',
  'Sales Manager': 'Sales',
  'Customer Success Manager': 'Sales',
  'Marketing Specialist': 'Marketing',
  'HR Manager': 'Human Resources',
  'Finance Analyst': 'Finance',
  'Business Analyst': 'Operations',
  'Operations Manager': 'Operations',
};

const SALARY_RANGES: Record<string, [number, number]> = {
  'Software Engineer': [70000, 130000],
  'Senior Software Engineer': [110000, 190000],
  'Technical Lead': [130000, 200000],
  'DevOps Engineer': [80000, 150000],
  'QA Engineer': [60000, 110000],
  'Product Manager': [90000, 170000],
  'UX Designer': [65000, 120000],
  'Data Analyst': [60000, 120000],
  'Sales Manager': [70000, 150000],
  'Customer Success Manager': [55000, 100000],
  'Marketing Specialist': [50000, 90000],
  'HR Manager': [55000, 100000],
  'Finance Analyst': [60000, 120000],
  'Business Analyst': [65000, 120000],
  'Operations Manager': [70000, 130000],
};

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'Canada',
  'Australia',
  'India',
  'Brazil',
  'Japan',
  'Singapore',
  'Netherlands',
  'Sweden',
  'Spain',
  'Italy',
  'Mexico',
  'South Korea',
  'Israel',
  'Switzerland',
  'Norway',
  'Denmark',
];

const EMPLOYMENT_TYPES = [
  { type: EmploymentType.FULL_TIME, weight: 70 },
  { type: EmploymentType.PART_TIME, weight: 20 },
  { type: EmploymentType.CONTRACTOR, weight: 10 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function weightedRandom<T>(items: { type: T; weight: number }[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let rnd = Math.random() * total;
  for (const item of items) {
    rnd -= item.weight;
    if (rnd <= 0) return item.type;
  }
  return items[items.length - 1].type;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDate(startYear = 2010, endYear = 2025): string {
  const year = randInt(startYear, endYear);
  const month = String(randInt(1, 12)).padStart(2, '0');
  const day = String(randInt(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Name loading ──────────────────────────────────────────────────────────────

function loadNames(filename: string): string[] {
  const filePath = path.resolve(__dirname, '../../../../data', filename);
  return fs
    .readFileSync(filePath, 'utf-8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

// ── Employee generation ────────────────────────────────────────────────────────

function generateEmployees(count: number): Partial<Employee>[] {
  const firstNames = loadNames('first_names.txt');
  const lastNames = loadNames('last_names.txt');

  const emailSet = new Set<string>();
  const employees: Partial<Employee>[] = [];

  let index = 0;
  while (employees.length < count) {
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    const fullName = `${firstName} ${lastName}`;
    const jobTitle = pick(JOB_TITLES);
    const [minSal, maxSal] = SALARY_RANGES[jobTitle];
    const salary = Math.round(randInt(minSal, maxSal) / 100) * 100;

    // Guarantee unique email even with repeated names
    const baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    let email = `${baseEmail}@company.com`;
    if (emailSet.has(email)) {
      email = `${baseEmail}${++index}@company.com`;
    }
    emailSet.add(email);

    employees.push({
      fullName,
      jobTitle,
      department: DEPARTMENTS[jobTitle],
      country: pick(COUNTRIES),
      salary,
      email,
      hireDate: new Date(randDate()),
      employmentType: weightedRandom(EMPLOYMENT_TYPES),
    });
  }

  return employees;
}

// ── Batch insert ───────────────────────────────────────────────────────────────

const BATCH_SIZE = 500;

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'root',
    database: process.env.DB_NAME ?? 'salary_db',
    entities: [Employee],
    synchronize: true,
  });

  await ds.initialize();
  console.log('✔ Connected to database');

  const repo = ds.getRepository(Employee);
  const existing = await repo.count();

  if (existing > 0) {
    console.log(`ℹ  Found ${existing} existing employees. Clearing table before re-seed…`);
    await repo.clear();
  }

  const count = 10_000;
  console.log(`⏳ Generating ${count} employees…`);
  const employees = generateEmployees(count);

  const batches = Math.ceil(employees.length / BATCH_SIZE);
  const start = Date.now();

  for (let i = 0; i < batches; i++) {
    const batch = employees.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    await ds.createQueryBuilder().insert().into(Employee).values(batch).execute();
    process.stdout.write(`\r  Inserted batch ${i + 1}/${batches}`);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`\n✔ Seeded ${count} employees in ${elapsed}s`);
  await ds.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
