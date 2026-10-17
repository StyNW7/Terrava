import { Body, Controller, Get, Module, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions } from '../../common/decorators';
import { Permission } from '../../common/permissions';
import type { AuthContext } from '../../common/auth-context';
import { PrismaService } from '../../prisma/prisma.service';
import { TasksModule } from '../tasks/tasks.module';
import { TasksService } from '../tasks/tasks.service';
import { DerivedTaskDto } from '../tasks/tasks.dto';
import { AlertsService } from './alerts.service';
import { AlertQueryDto, AssignDto, BulkAlertDto, CreateAlertDto, AlertNoteDto, ResolveDto } from './alerts.dto';

@ApiTags('Alerts')
@ApiBearerAuth()
@Controller('alerts')
class AlertsController {
  constructor(
    private readonly alerts: AlertsService,
    private readonly tasks: TasksService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Alerts Center: filter by status, severity, category, farm, assignee, date' })
  list(@CurrentUser() user: AuthContext, @Query() query: AlertQueryDto) {
    return this.alerts.list(user, query);
  }

  @Get('stats')
  @ApiQuery({ name: 'farmId', required: false })
  stats(@CurrentUser() user: AuthContext, @Query('farmId') farmId?: string) {
    return this.alerts.stats(user, farmId);
  }

  @Post()
  @RequirePermissions(Permission.MANAGE_ALERTS)
  @ApiOperation({ summary: 'Report an alert manually' })
  create(@CurrentUser() user: AuthContext, @Body() dto: CreateAlertDto) {
    return this.alerts.createManual(user, dto);
  }

  @Post('bulk')
  @RequirePermissions(Permission.MANAGE_ALERTS)
  bulk(@CurrentUser() user: AuthContext, @Body() dto: BulkAlertDto) {
    return this.alerts.bulk(user, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Alert detail with notes, timeline and related alerts' })
  get(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.alerts.get(user, id);
  }

  @Patch(':id/acknowledge')
  @RequirePermissions(Permission.MANAGE_ALERTS)
  async acknowledge(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    await this.alerts.acknowledge(user, [id]);
    return this.alerts.get(user, id);
  }

  @Patch(':id/resolve')
  @RequirePermissions(Permission.MANAGE_ALERTS)
  async resolve(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: ResolveDto) {
    await this.alerts.resolve(user, [id], dto.note);
    return this.alerts.get(user, id);
  }

  @Patch(':id/reopen')
  @RequirePermissions(Permission.MANAGE_ALERTS)
  async reopen(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    await this.alerts.reopen(user, [id]);
    return this.alerts.get(user, id);
  }

  @Patch(':id/assign')
  @RequirePermissions(Permission.MANAGE_ALERTS)
  async assign(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: AssignDto) {
    await this.alerts.assign(user, [id], dto.assigneeId ?? null);
    return this.alerts.get(user, id);
  }

  @Post(':id/notes')
  @RequirePermissions(Permission.MANAGE_ALERTS)
  addNote(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: AlertNoteDto) {
    return this.alerts.addNote(user, id, dto.text);
  }

  @Post(':id/tasks')
  @RequirePermissions(Permission.MANAGE_TASKS)
  @ApiOperation({ summary: 'Create a follow-up task linked to this alert' })
  async createTask(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: DerivedTaskDto) {
    const alert = await this.prisma.alert.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!alert) throw new NotFoundException('Alert not found');
    const title = alert.title as { en?: string };
    const due = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    return this.tasks.create(user, {
      title: dto.title ?? `Follow up: ${title.en ?? 'alert'}`,
      kind: dto.kind ?? 'follow-up',
      farmId: alert.farmId,
      livestockId: alert.livestockId ?? undefined,
      assigneeId: dto.assigneeId ?? alert.assignedToId ?? undefined,
      dueDate: dto.dueDate ?? due,
      description: dto.description,
      source: { type: 'alert', id },
    });
  }
}

@Module({
  imports: [TasksModule],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
