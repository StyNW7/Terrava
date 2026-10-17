import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions } from '../../common/decorators';
import { Permission } from '../../common/permissions';
import type { AuthContext } from '../../common/auth-context';
import { DevicesService } from './devices.service';
import {
  AssignmentDto,
  CommandDto,
  CreateDeviceDto,
  DeviceQueryDto,
  MaintenanceNoteDto,
  UpdateDeviceDto,
} from './devices.dto';

@ApiTags('Devices')
@ApiBearerAuth()
@Controller('devices')
export class DevicesController {
  constructor(private readonly devices: DevicesService) {}

  @Get()
  @ApiOperation({ summary: 'Ear tags, gateways and environmental sensors (filterable, paginated)' })
  list(@CurrentUser() user: AuthContext, @Query() query: DeviceQueryDto) {
    return this.devices.list(user, query);
  }

  @Get('stats')
  @ApiQuery({ name: 'farmId', required: false })
  stats(@CurrentUser() user: AuthContext, @Query('farmId') farmId?: string) {
    return this.devices.stats(user, farmId);
  }

  @Post()
  @RequirePermissions(Permission.MANAGE_DEVICES)
  @ApiOperation({ summary: 'Register a device. Gateways receive an API key in the response (shown once).' })
  create(@CurrentUser() user: AuthContext, @Body() dto: CreateDeviceDto) {
    return this.devices.create(user, dto);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.devices.get(user, id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.MANAGE_DEVICES)
  update(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: UpdateDeviceDto) {
    return this.devices.update(user, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.MANAGE_DEVICES)
  remove(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.devices.remove(user, id);
  }

  @Post(':id/restart')
  @RequirePermissions(Permission.MANAGE_DEVICES)
  restart(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.devices.restart(user, id);
  }

  @Post(':id/diagnostics')
  @RequirePermissions(Permission.MANAGE_DEVICES)
  @ApiOperation({ summary: 'Packet delivery, link quality and battery drain analysis + on-device self-test' })
  diagnostics(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.devices.diagnostics(user, id);
  }

  @Post(':id/maintenance/start')
  @RequirePermissions(Permission.MANAGE_DEVICES)
  startMaintenance(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: MaintenanceNoteDto) {
    return this.devices.startMaintenance(user, id, dto.note);
  }

  @Post(':id/maintenance/end')
  @RequirePermissions(Permission.MANAGE_DEVICES)
  endMaintenance(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: MaintenanceNoteDto) {
    return this.devices.endMaintenance(user, id, dto.note);
  }

  @Post(':id/maintenance-logs')
  @RequirePermissions(Permission.MANAGE_DEVICES)
  addMaintenanceLog(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: MaintenanceNoteDto) {
    return this.devices.addMaintenanceLog(user, id, dto.note ?? '');
  }

  @Put(':id/assignment')
  @RequirePermissions(Permission.MANAGE_DEVICES)
  @ApiOperation({ summary: 'Pair the ear tag with an animal (or unpair with null)' })
  assign(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: AssignmentDto) {
    return this.devices.assign(user, id, dto.livestockId);
  }

  @Post(':id/api-key')
  @RequirePermissions(Permission.MANAGE_DEVICES)
  @ApiOperation({ summary: 'Issue or rotate the gateway API key used by the IoT layer' })
  rotateApiKey(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.devices.rotateApiKey(user, id);
  }

  @Post(':id/commands')
  @RequirePermissions(Permission.MANAGE_DEVICES)
  @ApiOperation({ summary: 'Queue a downlink command (set-interval, firmware-update, locate...)' })
  sendCommand(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: CommandDto) {
    return this.devices.sendCommand(user, id, dto);
  }

  @Get(':id/commands')
  listCommands(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.devices.listCommands(user, id);
  }

  @Get(':id/events')
  @ApiQuery({ name: 'take', required: false, example: 100 })
  listEvents(
    @CurrentUser() user: AuthContext,
    @Param('id') id: string,
    @Query('take', new DefaultValuePipe(100), ParseIntPipe) take: number,
  ) {
    return this.devices.listEvents(user, id, take);
  }

  @Get(':id/readings')
  @ApiQuery({ name: 'hours', required: false, example: 24 })
  readings(
    @CurrentUser() user: AuthContext,
    @Param('id') id: string,
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
  ) {
    return this.devices.readings(user, id, hours);
  }
}
