import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { MailService } from '../notifications/channels/mail.service';
import { AnalyticsService, RANGE_DAYS, type Range, type Scope } from '../dashboard/analytics.service';
import { fromApiEnum, toApiEnum } from '../../common/utils/enums';
import { nextRun } from '../../domain/schedule';
import { readOrgSettings } from '../settings/settings.schema';
import type { AuthContext } from '../../common/auth-context';
import type { Language } from '../../common/utils/localized';
import type { ReportFormat, ReportFrequency, ReportType } from '../../generated/prisma/client';
import { ReportBuilderService } from './report-builder.service';
import { renderCsv, renderPdf } from './report-renderers';
import { LABELS, REPORT_TYPES, type ReportFilters, type ReportKind } from './report.types';
import type { ReportQueryDto, ScheduleDto } from './reports.dto';

export interface RenderedReport {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly builder: ReportBuilderService,
    private readonly analytics: AnalyticsService,
    private readonly mail: MailService,
    private readonly config: AppConfigService,
  ) {}

  catalog(lang: Language) {
    return REPORT_TYPES.map((type) => ({
      type,
      title: LABELS[`title.${type}`][lang],
      description: LABELS[`desc.${type}`][lang],
      formats: ['pdf', 'csv'],
    }));
  }

  /** Data for the ten charts on the Reports & Analytics page, honouring its filters. */
  async analyticsDashboard(ctx: AuthContext, query: ReportQueryDto) {
    const scope: Scope = {
      organizationId: ctx.organizationId,
      farmId: query.farmId,
      livestockType: query.livestockType,
      health: query.health,
    };
    const range: Range = query.range && query.range in RANGE_DAYS ? query.range : '30d';
    const [
      healthTrend,
      healthDistribution,
      alertFrequency,
      alertsByCategory,
      activityTrend,
      environmentTrend,
      deviceUptime,
      responseTimes,
      farmComparison,
    ] = await Promise.all([
      this.analytics.healthTrend(scope, range),
      this.analytics.healthDistribution(scope),
      this.analytics.alertFrequency(scope, range),
      this.analytics.alertsByCategory(scope, range),
      this.analytics.activityTrend(scope, range),
      this.analytics.environmentTrend(scope, range),
      this.analytics.deviceUptime(scope),
      this.analytics.responseTimes(scope, range),
      this.analytics.farmComparison(ctx.organizationId),
    ]);
    return {
      range,
      healthTrend,
      healthDistribution,
      alertFrequency,
      alertsByCategory,
      activityTrend,
      environmentTrend,
      deviceUptime,
      responseTimes,
      farmComparison,
    };
  }

  filtersFrom(query: ReportQueryDto): ReportFilters {
    return {
      farmId: query.farmId ?? 'all',
      livestockType: query.livestockType ?? 'all',
      health: query.health ?? 'all',
      days: RANGE_DAYS[query.range && query.range in RANGE_DAYS ? query.range : '30d'],
    };
  }

  async preview(ctx: AuthContext, type: string, query: ReportQueryDto) {
    return this.builder.build(ctx.organizationId, this.assertType(type), this.filtersFrom(query), query.lang ?? 'id');
  }

  async download(
    ctx: AuthContext,
    type: string,
    format: 'pdf' | 'csv',
    query: ReportQueryDto,
  ): Promise<RenderedReport> {
    const kind = this.assertType(type);
    const filters = this.filtersFrom(query);
    const lang = query.lang ?? 'id';
    const rendered = await this.render(ctx.organizationId, kind, format, filters, lang);
    await this.prisma.reportRun.create({
      data: {
        organizationId: ctx.organizationId,
        reportType: fromApiEnum<ReportType>(kind),
        format: fromApiEnum<ReportFormat>(format),
        filters: { ...filters },
        language: lang,
        generatedById: ctx.userId,
        sizeBytes: rendered.buffer.length,
      },
    });
    return rendered;
  }

  async render(
    organizationId: string,
    kind: ReportKind,
    format: 'pdf' | 'csv',
    filters: ReportFilters,
    lang: Language,
  ): Promise<RenderedReport> {
    const doc = await this.builder.build(organizationId, kind, filters, lang);
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === 'csv') {
      return {
        buffer: Buffer.from(renderCsv(doc), 'utf8'),
        filename: `terrava-${kind}-report-${stamp}.csv`,
        contentType: 'text/csv; charset=utf-8',
      };
    }
    return {
      buffer: await renderPdf(doc),
      filename: `terrava-${kind}-report-${stamp}.pdf`,
      contentType: 'application/pdf',
    };
  }

  async history(ctx: AuthContext) {
    const runs = await this.prisma.reportRun.findMany({
      where: { organizationId: ctx.organizationId },
      include: { generatedBy: { select: { name: true } } },
      orderBy: { generatedAt: 'desc' },
      take: 50,
    });
    return runs.map((run) => ({
      id: run.id,
      reportType: toApiEnum(run.reportType),
      format: toApiEnum(run.format),
      filters: run.filters,
      language: run.language,
      generatedBy: run.generatedBy?.name ?? (run.scheduleId ? 'Scheduled' : null),
      scheduled: Boolean(run.scheduleId),
      sizeBytes: run.sizeBytes,
      generatedAt: run.generatedAt.toISOString(),
    }));
  }

  /** Re-download a past report with the filters it was generated with. */
  async redownload(ctx: AuthContext, runId: string): Promise<RenderedReport> {
    const run = await this.prisma.reportRun.findFirst({ where: { id: runId, organizationId: ctx.organizationId } });
    if (!run) throw new NotFoundException('Report not found');
    return this.render(
      ctx.organizationId,
      toApiEnum(run.reportType) as ReportKind,
      toApiEnum(run.format) as 'pdf' | 'csv',
      run.filters as unknown as ReportFilters,
      run.language as Language,
    );
  }

  // ---------------------------------------------------------------------------
  // Schedules
  // ---------------------------------------------------------------------------

  async schedules(ctx: AuthContext) {
    const rows = await this.prisma.reportSchedule.findMany({
      where: { organizationId: ctx.organizationId },
      orderBy: { reportType: 'asc' },
    });
    return rows.map((s) => this.serializeSchedule(s));
  }

  async upsertSchedule(ctx: AuthContext, type: string, dto: ScheduleDto) {
    const kind = this.assertType(type);
    if (dto.frequency === 'weekly' && (dto.day < 1 || dto.day > 7))
      throw new BadRequestException('Weekly schedules use day 1-7 (Mon-Sun)');
    if (dto.frequency === 'monthly' && (dto.day < 1 || dto.day > 28))
      throw new BadRequestException('Monthly schedules use day 1-28');
    const org = await this.prisma.organization.findUniqueOrThrow({
      where: { id: ctx.organizationId },
      select: { settings: true },
    });
    const timezone = readOrgSettings(org.settings).timezone;
    const frequency = fromApiEnum<ReportFrequency>(dto.frequency);
    const data = {
      frequency,
      day: dto.day,
      time: dto.time,
      timezone,
      format: fromApiEnum<ReportFormat>(dto.format),
      recipients: [...new Set(dto.recipients.map((r) => r.trim().toLowerCase()))],
      language: dto.language ?? 'id',
      active: true,
      nextRunAt: nextRun({ frequency, day: dto.day, time: dto.time }, new Date(), timezone),
    };
    const reportType = fromApiEnum<ReportType>(kind);
    const schedule = await this.prisma.reportSchedule.upsert({
      where: { organizationId_reportType: { organizationId: ctx.organizationId, reportType } },
      update: data,
      create: { ...data, organizationId: ctx.organizationId, reportType, createdById: ctx.userId },
    });
    return this.serializeSchedule(schedule);
  }

  async removeSchedule(ctx: AuthContext, type: string) {
    const kind = this.assertType(type);
    await this.prisma.reportSchedule.deleteMany({
      where: { organizationId: ctx.organizationId, reportType: fromApiEnum<ReportType>(kind) },
    });
    return { ok: true };
  }

  /** Every 5 minutes: generate and email every schedule that is due. */
  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'scheduled-reports' })
  async runDueSchedules() {
    if (!this.config.get('JOBS_ENABLED')) return;
    const due = await this.prisma.reportSchedule.findMany({
      where: { active: true, nextRunAt: { lte: new Date() } },
      take: 20,
    });
    for (const schedule of due) {
      try {
        const kind = toApiEnum(schedule.reportType) as ReportKind;
        const format = toApiEnum(schedule.format) as 'pdf' | 'csv';
        const lang = (schedule.language === 'en' ? 'en' : 'id') as Language;
        const filters: ReportFilters = {
          farmId: 'all',
          livestockType: 'all',
          health: 'all',
          days: schedule.frequency === 'DAILY' ? 7 : schedule.frequency === 'WEEKLY' ? 7 : 30,
        };
        const rendered = await this.render(schedule.organizationId, kind, format, filters, lang);
        const title = LABELS[`title.${kind}`][lang];
        await this.mail.send({
          to: schedule.recipients,
          subject: `Terrava · ${title}`,
          text:
            lang === 'id' ? `Laporan terjadwal "${title}" terlampir.` : `Your scheduled "${title}" report is attached.`,
          html: MailService.layout(
            title,
            `<p>${lang === 'id' ? 'Laporan terjadwal Anda terlampir.' : 'Your scheduled report is attached.'}</p>`,
          ),
          attachments: [{ filename: rendered.filename, content: rendered.buffer, contentType: rendered.contentType }],
        });
        await this.prisma.$transaction([
          this.prisma.reportRun.create({
            data: {
              organizationId: schedule.organizationId,
              reportType: schedule.reportType,
              format: schedule.format,
              filters: { ...filters },
              language: lang,
              scheduleId: schedule.id,
              sizeBytes: rendered.buffer.length,
            },
          }),
          this.prisma.reportSchedule.update({
            where: { id: schedule.id },
            data: {
              lastRunAt: new Date(),
              nextRunAt: nextRun(
                { frequency: schedule.frequency, day: schedule.day, time: schedule.time },
                new Date(),
                schedule.timezone,
              ),
            },
          }),
        ]);
        this.logger.log(`Sent scheduled ${kind} report to ${schedule.recipients.length} recipient(s)`);
      } catch (error) {
        this.logger.error(`Scheduled report ${schedule.id} failed: ${(error as Error).message}`);
        // Try again at the next slot rather than every 5 minutes.
        await this.prisma.reportSchedule.update({
          where: { id: schedule.id },
          data: {
            nextRunAt: nextRun(
              { frequency: schedule.frequency, day: schedule.day, time: schedule.time },
              new Date(),
              schedule.timezone,
            ),
          },
        });
      }
    }
  }

  private serializeSchedule(s: {
    id: string;
    reportType: ReportType;
    frequency: ReportFrequency;
    day: number;
    time: string;
    timezone: string;
    format: ReportFormat;
    recipients: string[];
    language: string;
    active: boolean;
    nextRunAt: Date;
    lastRunAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: s.id,
      reportType: toApiEnum(s.reportType),
      frequency: toApiEnum(s.frequency),
      day: s.day,
      time: s.time,
      timezone: s.timezone,
      format: toApiEnum(s.format),
      recipients: s.recipients,
      language: s.language,
      active: s.active,
      nextRunAt: s.nextRunAt.toISOString(),
      lastRunAt: s.lastRunAt?.toISOString() ?? null,
      createdAt: s.createdAt.toISOString(),
    };
  }

  private assertType(type: string): ReportKind {
    if (!(REPORT_TYPES as readonly string[]).includes(type))
      throw new NotFoundException(`Unknown report type "${type}"`);
    return type as ReportKind;
  }
}
