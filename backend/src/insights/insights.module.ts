import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employees/employee.entity';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Employee])],
  controllers: [InsightsController],
  providers: [InsightsService],
})
export class InsightsModule {}
