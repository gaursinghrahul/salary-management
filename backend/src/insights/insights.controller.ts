import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InsightsService } from './insights.service';

@ApiTags('insights')
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('country-stats')
  @ApiOperation({ summary: 'Min, max, avg salary and headcount for a country' })
  @ApiQuery({ name: 'country', required: true, type: String })
  getCountryStats(@Query('country') country: string) {
    return this.insightsService.getCountryStats(country);
  }

  @Get('job-title-avg')
  @ApiOperation({ summary: 'Average salary for a job title within a country' })
  @ApiQuery({ name: 'jobTitle', required: true, type: String })
  @ApiQuery({ name: 'country', required: true, type: String })
  getJobTitleAvg(
    @Query('jobTitle') jobTitle: string,
    @Query('country') country: string,
  ) {
    return this.insightsService.getJobTitleAvgInCountry(jobTitle, country);
  }

  @Get('department-stats')
  @ApiOperation({ summary: 'Avg, min, max salary per department' })
  getDepartmentStats() {
    return this.insightsService.getDepartmentStats();
  }

  @Get('top-earners')
  @ApiOperation({ summary: 'Top N employees by salary' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  getTopEarners(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.insightsService.getTopEarners(limit);
  }

  @Get('countries')
  @ApiOperation({ summary: 'List all distinct countries' })
  getDistinctCountries() {
    return this.insightsService.getDistinctCountries();
  }

  @Get('job-titles')
  @ApiOperation({ summary: 'List all distinct job titles' })
  getDistinctJobTitles() {
    return this.insightsService.getDistinctJobTitles();
  }
}
