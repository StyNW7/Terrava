import {
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CurrentUser, RequirePermissions } from '../../common/decorators';
import { Permission } from '../../common/permissions';
import type { AuthContext } from '../../common/auth-context';
import { PrismaService } from '../../prisma/prisma.service';
import { Events } from '../../common/events';
import { serializeInsight } from '../../common/serializers';
import { fromApiEnum, toApiEnum } from '../../common/utils/enums';
import type { InsightCategory, InsightPriority, Prisma } from '../../generated/prisma/client';
import { TasksModule } from '../tasks/tasks.module';
import { TasksService } from '../tasks/tasks.service';
import { DerivedTaskDto } from '../tasks/tasks.dto';
import { InsightGeneratorService } from './insight-generator.service';

const CATEGORIES = ['health', 'behavior', 'environment', 'productivity', 'devices'] as const;
const PRIORITIES = ['low', 'medium', 'high'] as const;
const toBool = ({ value }: { value: unknown }) => (value === 'true' ? true : value === 'false' ? false : value);

class InsightQueryDto {
  @ApiPropertyOptional({ enum: CATEGORIES }) @IsOptional() @IsIn(CATEGORIES) category?: string;
  @ApiPropertyOptional({ enum: PRIORITIES }) @IsOptional() @IsIn(PRIORITIES) priority?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(toBool) @IsBoolean() reviewed?: boolean;
  @ApiPropertyOptional() @IsOptional() @Transform(toBool) @IsBoolean() includeDismissed?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() farmId?: string;
}

class LocalizedTextDto {
  @ApiProperty() @IsString() id: string;
  @ApiProperty() @IsString() en: string;
}

/** Insight pushed by the AI service or another trusted integration. */
class CreateInsightDto {
  @ApiProperty({ enum: PRIORITIES }) @IsIn(PRIORITIES) priority: string;
  @ApiProperty({ enum: CATEGORIES }) @IsIn(CATEGORIES) category: string;
  @ApiProperty({ type: LocalizedTextDto }) @ValidateNested() @Type(() => LocalizedTextDto) title: LocalizedTextDto;
  @ApiProperty({ type: LocalizedTextDto }) @ValidateNested() @Type(() => LocalizedTextDto) summary: LocalizedTextDto;
  @ApiProperty({ type: LocalizedTextDto })
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  recommendation: LocalizedTextDto;
  @ApiProperty({ example: 87 }) @Type(() => Number) @IsInt() @Min(0) @Max(100) confidence: number;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  affectedLivestock?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() farmId?: string;
  @ApiPropertyOptional({ example: 'ai/anomaly-isoforest-v1' }) @IsOptional() @IsString() source?: string;
}

@Injectable()
class InsightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  async list(ctx: AuthContext, query: InsightQueryDto) {
    const rows = await this.prisma.aIInsight.findMany({
      where: {
        organizationId: ctx.organizationId,
        category: query.category ? fromApiEnum<InsightCategory>(query.category) : undefined,
        priority: query.priority ? fromApiEnum<InsightPriority>(query.priority) : undefined,
        reviewed: query.reviewed,
        dismissed: query.includeDismissed ? undefined : false,
        ...(query.farmId && query.farmId !== 'all' ? { OR: [{ farmId: query.farmId }, { farmId: null }] } : {}),
      },
      orderBy: [{ generatedAt: 'desc' }],
      take: 200,
    });
    return rows.map(serializeInsight);
  }

  /** Header numbers and the 14-day risk trend for the AI Insights page. */
  async summary(ctx: AuthContext) {
    const where = { organizationId: ctx.organizationId, dismissed: false };
    const [byCategory, byPriority, total, reviewed, tasksFromInsights, tasksDone] = await Promise.all([
      this.prisma.aIInsight.groupBy({ by: ['category'], where, _count: { _all: true } }),
      this.prisma.aIInsight.groupBy({ by: ['priority'], where, _count: { _all: true } }),
      this.prisma.aIInsight.count({ where }),
      this.prisma.aIInsight.count({ where: { ...where, reviewed: true } }),
      this.prisma.task.count({ where: { organizationId: ctx.organizationId, sourceType: 'INSIGHT' } }),
      this.prisma.task.count({ where: { organizationId: ctx.organizationId, sourceType: 'INSIGHT', done: true } }),
    ]);
    const trend = await this.prisma.$queryRaw<{ day: Date; high: bigint; total: bigint }[]>`
      SELECT date_trunc('day', "detectedAt") AS day,
             COUNT(*) FILTER (WHERE "severity" IN ('HIGH', 'CRITICAL')) AS high,
             COUNT(*) AS total
      FROM "alerts"
      WHERE "organizationId" = ${ctx.organizationId} AND "detectedAt" >= NOW() - INTERVAL '14 days'
      GROUP BY day ORDER BY day`;
    return {
      total,
      reviewed,
      reviewRate: total ? Math.round((reviewed / total) * 100) : 0,
      actionCompletion: tasksFromInsights ? Math.round((tasksDone / tasksFromInsights) * 100) : 0,
      byCategory: Object.fromEntries(byCategory.map((r) => [toApiEnum(r.category), r._count._all])),
      byPriority: Object.fromEntries(byPriority.map((r) => [toApiEnum(r.priority), r._count._all])),
      riskTrend: trend.map((r) => ({
        date: r.day.toISOString().slice(0, 10),
        highRiskAlerts: Number(r.high),
        totalAlerts: Number(r.total),
        riskIndex: Number(r.total) ? Math.round((Number(r.high) / Number(r.total)) * 100) : 0,
      })),
    };
  }

  async patch(ctx: AuthContext, id: string, data: Prisma.AIInsightUpdateInput) {
    const exists = await this.prisma.aIInsight.count({ where: { id, organizationId: ctx.organizationId } });
    if (!exists) throw new NotFoundException('Insight not found');
    return serializeInsight(await this.prisma.aIInsight.update({ where: { id }, data }));
  }

  async create(ctx: AuthContext, dto: CreateInsightDto) {
    const insight = await this.prisma.aIInsight.create({
      data: {
        organizationId: ctx.organizationId,
        farmId: dto.farmId,
        priority: fromApiEnum<InsightPriority>(dto.priority),
        category: fromApiEnum<InsightCategory>(dto.category),
        title: { ...dto.title },
        summary: { ...dto.summary },
        recommendation: { ...dto.recommendation },
        confidence: dto.confidence,
        affectedLivestock: dto.affectedLivestock ?? [],
        source: dto.source ?? 'external',
      },
    });
    const payload = serializeInsight(insight);
    this.events.emit(Events.InsightCreated, { organizationId: ctx.organizationId, payload });
    return payload;
  }
}

@ApiTags('AI Insights')
@ApiBearerAuth()
@Controller('insights')
class InsightsController {
  constructor(
    private readonly insights: InsightsService,
    private readonly generator: InsightGeneratorService,
    private readonly tasks: TasksService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  list(@CurrentUser() user: AuthContext, @Query() query: InsightQueryDto) {
    return this.insights.list(user, query);
  }

  @Get('summary')
  summary(@CurrentUser() user: AuthContext) {
    return this.insights.summary(user);
  }

  @Post()
  @RequirePermissions(Permission.MANAGE_ALERTS)
  @ApiOperation({ summary: 'Store an insight produced by the AI service or another integration' })
  create(@CurrentUser() user: AuthContext, @Body() dto: CreateInsightDto) {
    return this.insights.create(user, dto);
  }

  @Post('generate')
  @RequirePermissions(Permission.MANAGE_ALERTS)
  @ApiOperation({ summary: 'Run the herd analytics now instead of waiting for the hourly job' })
  generate(@CurrentUser() user: AuthContext) {
    return this.generator.generate(user.organizationId);
  }

  @Patch(':id/review')
  review(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.insights.patch(user, id, { reviewed: true, reviewedAt: new Date(), reviewedBy: user.name });
  }

  @Patch(':id/dismiss')
  dismiss(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.insights.patch(user, id, { dismissed: true, dismissedAt: new Date() });
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Undo a dismissal' })
  restore(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.insights.patch(user, id, { dismissed: false, dismissedAt: null });
  }

  @Post(':id/tasks')
  @RequirePermissions(Permission.MANAGE_TASKS)
  @ApiOperation({ summary: 'Turn the insight recommendation into a task' })
  async createTask(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: DerivedTaskDto) {
    const insight = await this.prisma.aIInsight.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!insight) throw new NotFoundException('Insight not found');
    const farmId =
      insight.farmId ??
      (
        await this.prisma.farm.findFirst({
          where: { organizationId: user.organizationId },
          orderBy: { createdAt: 'asc' },
          select: { id: true },
        })
      )?.id;
    if (!farmId) throw new NotFoundException('Create a farm first');
    const recommendation = insight.recommendation as { en?: string };
    const task = await this.tasks.create(user, {
      title: dto.title ?? recommendation.en ?? 'Follow up on AI insight',
      kind: dto.kind ?? (insight.category === 'HEALTH' ? 'vet' : 'inspection'),
      farmId,
      assigneeId: dto.assigneeId,
      dueDate: dto.dueDate ?? new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10),
      description: dto.description,
      source: { type: 'insight', id },
    });
    await this.prisma.aIInsight.update({
      where: { id },
      data: { reviewed: true, reviewedAt: new Date(), reviewedBy: user.name },
    });
    return task;
  }
}

@Module({
  imports: [TasksModule],
  controllers: [InsightsController],
  providers: [InsightsService, InsightGeneratorService],
  exports: [InsightGeneratorService],
})
export class InsightsModule {}
