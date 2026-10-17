import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions } from '../../common/decorators';
import { Permission } from '../../common/permissions';
import type { AuthContext } from '../../common/auth-context';
import { LivestockService, type VitalsRange } from './livestock.service';
import {
  AssignDeviceDto,
  BulkLivestockDto,
  CreateLivestockDto,
  HealthRecordDto,
  LivestockQueryDto,
  MoveLivestockDto,
  UpdateLivestockDto,
} from './livestock.dto';

@ApiTags('Livestock')
@ApiBearerAuth()
@Controller('livestock')
@RequirePermissions(Permission.VIEW_LIVESTOCK)
export class LivestockController {
  constructor(private readonly livestock: LivestockService) {}

  @Get()
  @ApiOperation({ summary: 'Livestock list with search, filters, sorting, pagination and a health summary' })
  list(@CurrentUser() user: AuthContext, @Query() query: LivestockQueryDto) {
    return this.livestock.list(user, query);
  }

  @Get('export.csv')
  @ApiProduces('text/csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="terrava-livestock.csv"')
  async exportCsv(@CurrentUser() user: AuthContext, @Query() query: LivestockQueryDto) {
    return new StreamableFile(Buffer.from(await this.livestock.exportCsv(user, query), 'utf8'));
  }

  @Get('filters')
  @ApiOperation({ summary: 'Distinct types, breeds and herd groups for filter dropdowns' })
  filters(@CurrentUser() user: AuthContext) {
    return this.livestock.filterOptions(user);
  }

  @Get('check-unique')
  @ApiQuery({ name: 'code', required: false })
  @ApiQuery({ name: 'earTagId', required: false })
  @ApiQuery({ name: 'excludeId', required: false })
  checkUnique(
    @CurrentUser() user: AuthContext,
    @Query('code') code?: string,
    @Query('earTagId') earTagId?: string,
    @Query('excludeId') excludeId?: string,
  ) {
    return this.livestock.checkUnique(user, { code, earTagId }, excludeId);
  }

  @Post()
  @RequirePermissions(Permission.EDIT_LIVESTOCK)
  create(@CurrentUser() user: AuthContext, @Body() dto: CreateLivestockDto) {
    return this.livestock.create(user, dto);
  }

  @Post('bulk')
  @RequirePermissions(Permission.EDIT_LIVESTOCK)
  @ApiOperation({ summary: 'Bulk archive, restore or update selected animals' })
  bulk(@CurrentUser() user: AuthContext, @Body() dto: BulkLivestockDto) {
    return this.livestock.bulk(user, dto);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.livestock.get(user, id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.EDIT_LIVESTOCK)
  update(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: UpdateLivestockDto) {
    return this.livestock.update(user, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.EDIT_LIVESTOCK, Permission.EDIT_SETTINGS)
  @ApiOperation({ summary: 'Permanently delete (prefer archive to keep records)' })
  remove(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.livestock.remove(user, id);
  }

  @Post(':id/archive')
  @RequirePermissions(Permission.EDIT_LIVESTOCK)
  archive(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.livestock.setArchived(user, [id], true);
  }

  @Post(':id/restore')
  @RequirePermissions(Permission.EDIT_LIVESTOCK)
  restore(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.livestock.setArchived(user, [id], false);
  }

  @Post(':id/move')
  @RequirePermissions(Permission.EDIT_LIVESTOCK)
  @ApiOperation({ summary: 'Move to another barn (records the movement history)' })
  move(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: MoveLivestockDto) {
    return this.livestock.move(user, id, dto);
  }

  @Put(':id/device')
  @RequirePermissions(Permission.EDIT_LIVESTOCK)
  assignDevice(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: AssignDeviceDto) {
    return this.livestock.assignDevice(user, id, dto.deviceId ?? null);
  }

  @Get(':id/vitals')
  @ApiQuery({ name: 'range', required: false, enum: ['24h', '7d', '30d', '90d'] })
  vitals(@CurrentUser() user: AuthContext, @Param('id') id: string, @Query('range') range?: VitalsRange) {
    return this.livestock.vitals(user, id, range);
  }

  @Get(':id/location-history')
  @ApiQuery({ name: 'hours', required: false, example: 24 })
  locationHistory(
    @CurrentUser() user: AuthContext,
    @Param('id') id: string,
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
  ) {
    return this.livestock.locationHistory(user, id, hours);
  }

  @Get(':id/alerts')
  alerts(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.livestock.alerts(user, id);
  }

  @Get(':id/health-records')
  healthRecords(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.livestock.healthRecords(user, id);
  }

  @Post(':id/health-records')
  @RequirePermissions(Permission.EDIT_LIVESTOCK)
  addHealthRecord(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: HealthRecordDto) {
    return this.livestock.addHealthRecord(user, id, dto);
  }

  @Delete('health-records/:recordId')
  @RequirePermissions(Permission.EDIT_LIVESTOCK)
  removeHealthRecord(@CurrentUser() user: AuthContext, @Param('recordId') recordId: string) {
    return this.livestock.removeHealthRecord(user, recordId);
  }

  @Get(':id/weight-history')
  weightHistory(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.livestock.weightHistory(user, id);
  }

  @Get(':id/timeline')
  timeline(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.livestock.timeline(user, id);
  }
}
