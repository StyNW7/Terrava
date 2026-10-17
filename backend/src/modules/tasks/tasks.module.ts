import { Body, Controller, Delete, Get, Module, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions } from '../../common/decorators';
import { Permission } from '../../common/permissions';
import type { AuthContext } from '../../common/auth-context';
import { TasksService } from './tasks.service';
import { CreateTaskDto, TaskQueryDto, UpdateTaskDto } from './tasks.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  list(@CurrentUser() user: AuthContext, @Query() query: TaskQueryDto) {
    return this.tasks.list(user, query);
  }

  @Post()
  @RequirePermissions(Permission.MANAGE_TASKS)
  create(@CurrentUser() user: AuthContext, @Body() dto: CreateTaskDto) {
    return this.tasks.create(user, dto);
  }

  @Patch(':id')
  @RequirePermissions(Permission.MANAGE_TASKS)
  update(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasks.update(user, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.MANAGE_TASKS)
  remove(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.tasks.remove(user, id);
  }
}

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
