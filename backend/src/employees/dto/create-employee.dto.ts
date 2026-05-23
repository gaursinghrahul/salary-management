import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEmail,
  IsEnum,
  IsDateString,
  IsPositive,
  MaxLength,
  Min,
} from 'class-validator';
import { EmploymentType } from '../employee.entity';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName: string;

  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  jobTitle: string;

  @ApiProperty({ example: 'Engineering' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  department: string;

  @ApiProperty({ example: 'United States' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @ApiProperty({ example: 85000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(1)
  salary: number;

  @ApiProperty({ example: 'jane.doe@company.com' })
  @IsEmail()
  @MaxLength(200)
  email: string;

  @ApiProperty({ example: '2023-01-15' })
  @IsDateString()
  hireDate: string;

  @ApiPropertyOptional({ enum: EmploymentType, default: EmploymentType.FULL_TIME })
  @IsEnum(EmploymentType)
  employmentType: EmploymentType = EmploymentType.FULL_TIME;
}
