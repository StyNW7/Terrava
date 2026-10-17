import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Events } from '../../common/events';
import { serializeTask } from '../../common/serializers';
import { fromApiEnum } from '../../common/utils/enums';
import type { AuthContext } from '../../common/auth-context';
import type { Prisma, TaskKind, TaskSourceType } from '../../generated/prisma/client';
import type { CreateTaskDto, TaskQueryDto, UpdateTaskDto } from './tasks.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly events: EventEmitter2,
  ) {}

  async list(ctx: AuthContext, query: TaskQueryDto) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const weekEnd = new Date(today.getTime() + 7 * 86_400_000);
    const due: Prisma.TaskWhereInput =
      query.due === 'overdue'
        ? { dueDate: { lt: today }, done: false }
        : query.due === 'today'
          ? { dueDate: today }
          : query.due === 'week'
            ? { dueDate: { gte: today, lte: weekEnd } }
            : {};
    const tasks = await this.prisma.task.findMany({
      where: {
        organizationId: ctx.organizationId,
        farmId: query.farmId && query.farmId !== 'all' ? query.farmId : undefined,
        assigneeId: query.assigneeId === 'me' ? ctx.membershipId : query.assigneeId,
        done: query.done,
        livestockId: query.livestockId,
        ...due,
      },
      orderBy: [{ done: 'asc' }, { dueDate: 'asc' }],
      take: 500,
    });
    return tasks.map(serializeTask);
  }

  async create(ctx: AuthContext, dto: CreateTaskDto) {
    const farm = await this.prisma.farm.count({ where: { id: dto.farmId, organizationId: ctx.organizationId } });
    if (!farm) throw new BadRequestException('Farm not found in this organization');
    if (!dto.title && !dto.titleKey) throw new BadRequestException('A task needs a title');

    const assignee = dto.assigneeId
      ? await this.prisma.membership.findFirst({
          where: { id: dto.assigneeId, organizationId: ctx.organizationId },
          include: { user: true },
        })
      : null;
    if (dto.assigneeId && !assignee) throw new BadRequestException('Assignee is not a member of this organization');

    const task = await this.prisma.task.create({
      data: {
        organizationId: ctx.organizationId,
        farmId: dto.farmId,
        livestockId: dto.livestockId,
        title: dto.title,
        titleKey: dto.titleKey,
        description: dto.description,
        kind: fromApiEnum<TaskKind>(dto.kind),
        assigneeId: assignee?.id,
        assigneeName: assignee?.user.name ?? dto.assigneeName ?? ctx.name,
        dueDate: new Date(dto.dueDate),
        sourceType: dto.source ? fromApiEnum<TaskSourceType>(dto.source.type) : undefined,
        sourceId: dto.source?.id,
        createdBy: ctx.name,
      },
    });

    if (dto.source?.type === 'alert') {
      await this.prisma.alertEvent.create({
        data: { alertId: dto.source.id, type: 'TASK_CREATED', actorName: ctx.name, metadata: { taskId: task.id } },
      });
    }
    if (assignee && assignee.userId !== ctx.userId) {
      await this.notifications.notify({
        organizationId: ctx.organizationId,
        userIds: [assignee.userId],
        type: 'TASK',
        title: { id: 'Tugas baru untuk Anda', en: 'New task assigned to you' },
        body: {
          id: `${task.title ?? 'Tugas'} · jatuh tempo ${dto.dueDate}`,
          en: `${task.title ?? 'Task'} · due ${dto.dueDate}`,
        },
        link: '/dashboard',
        entityId: task.id,
      });
    }
    this.events.emit(Events.TaskCreated, { organizationId: ctx.organizationId, payload: serializeTask(task) });
    return serializeTask(task);
  }

  async update(ctx: AuthContext, id: string, dto: UpdateTaskDto) {
    const existing = await this.prisma.task.findFirst({ where: { id, organizationId: ctx.organizationId } });
    if (!existing) throw new NotFoundException('Task not found');
    const assignee = dto.assigneeId
      ? await this.prisma.membership.findFirst({
          where: { id: dto.assigneeId, organizationId: ctx.organizationId },
          include: { user: true },
        })
      : null;
    if (dto.assigneeId && !assignee) throw new BadRequestException('Assignee is not a member of this organization');

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        kind: dto.kind ? fromApiEnum<TaskKind>(dto.kind) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        assigneeId: assignee?.id,
        assigneeName: assignee?.user.name,
        done: dto.done,
        completedAt: dto.done === undefined ? undefined : dto.done ? new Date() : null,
      },
    });
    return serializeTask(task);
  }

  async remove(ctx: AuthContext, id: string) {
    const result = await this.prisma.task.deleteMany({ where: { id, organizationId: ctx.organizationId } });
    if (!result.count) throw new NotFoundException('Task not found');
    return { ok: true };
  }
}
