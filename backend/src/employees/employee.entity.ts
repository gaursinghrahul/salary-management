import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum EmploymentType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACTOR = 'contractor',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  fullName: string;

  @Column({ length: 100 })
  @Index()
  jobTitle: string;

  @Column({ length: 100 })
  department: string;

  @Column({ length: 100 })
  @Index()
  country: string;

  @Column('decimal', { precision: 12, scale: 2 })
  salary: number;

  @Column({ unique: true, length: 200 })
  email: string;

  @Column({ type: 'date' })
  hireDate: Date;

  @Column({ type: 'enum', enum: EmploymentType, default: EmploymentType.FULL_TIME })
  employmentType: EmploymentType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
