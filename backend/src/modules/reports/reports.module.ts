import { Body, Controller, Delete, Get, Module, Param, Put, Query, Res, StreamableFile } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser, RequirePermissions } from '../../common/decorators';
import { Permission } from '../../common/permissions';
import type { AuthContext } from '../../common/auth-context';
import { DashboardModule } from '../dashboard/dashboard.module';
import { ReportsService, type RenderedReport } from './reports.service';
import { ReportBuilderService } from './report-builder.service';
import { DownloadQueryDto, ReportQueryDto, ScheduleDto } from './reports.dto';

function sendFile(res: Response, file: RenderedReport) {
  res.set({
    'Content-Type': file.contentType,
    'Content-Disposition': `attachment; filename="${file.filename}"`,
    'Content-Length': String(file.buffer.length),
  });
  return new StreamableFile(file.buffer);
}

@ApiTags('Reports & Analytics')
@ApiBearerAuth()
@Controller('reports')
class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('types')
  @ApiQuery({ name: 'lang', required: false, enum: ['id', 'en'] })
  types(@Query('lang') lang?: 'id' | 'en') {
    return this.reports.catalog(lang === 'en' ? 'en' : 'id');
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Chart data for the Reports & Analytics page (farm, type, health and range filters)' })
  analytics(@CurrentUser() user: AuthContext, @Query() query: ReportQueryDto) {
    return this.reports.analyticsDashboard(user, query);
  }

  @Get('history')
  history(@CurrentUser() user: AuthContext) {
    return this.reports.history(user);
  }

  @Get('history/:id/download')
  @RequirePermissions(Permission.EXPORT_REPORTS)
  async redownload(
    @CurrentUser() user: AuthContext,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return sendFile(res, await this.reports.redownload(user, id));
  }

  @Get('schedules')
  schedules(@CurrentUser() user: AuthContext) {
    return this.reports.schedules(user);
  }

  @Put('schedules/:type')
  @RequirePermissions(Permission.EXPORT_REPORTS)
  @ApiOperation({ summary: 'Create or replace the email schedule for a report type' })
  upsertSchedule(@CurrentUser() user: AuthContext, @Param('type') type: string, @Body() dto: ScheduleDto) {
    return this.reports.upsertSchedule(user, type, dto);
  }

  @Delete('schedules/:type')
  @RequirePermissions(Permission.EXPORT_REPORTS)
  removeSchedule(@CurrentUser() user: AuthContext, @Param('type') type: string) {
    return this.reports.removeSchedule(user, type);
  }

  @Get(':type/preview')
  @ApiOperation({ summary: 'Report document as JSON (KPIs, chart, findings, tables) for the on-screen preview' })
  preview(@CurrentUser() user: AuthContext, @Param('type') type: string, @Query() query: ReportQueryDto) {
    return this.reports.preview(user, type, query);
  }

  @Get(':type/download')
  @RequirePermissions(Permission.EXPORT_REPORTS)
  @ApiProduces('application/pdf', 'text/csv')
  @ApiOperation({ summary: 'Download as PDF or CSV (recorded in the report history)' })
  async download(
    @CurrentUser() user: AuthContext,
    @Param('type') type: string,
    @Query() query: DownloadQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return sendFile(res, await this.reports.download(user, type, query.format, query));
  }
}

@Module({
  imports: [DashboardModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportBuilderService],
  exports: [ReportsService],
})
export class ReportsModule {}
