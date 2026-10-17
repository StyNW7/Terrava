import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions } from '../../common/decorators';
import { Permission } from '../../common/permissions';
import type { AuthContext } from '../../common/auth-context';
import { FarmsService } from './farms.service';
import { BarnInputDto, CreateFarmDto, GeofenceDto, UpdateBarnDto, UpdateFarmDto, UpdateGeofenceDto } from './farms.dto';

@ApiTags('Farms & Barns')
@ApiBearerAuth()
@Controller()
export class FarmsController {
  constructor(private readonly farms: FarmsService) {}

  @Get('farms')
  @ApiOperation({ summary: 'Farms with live occupancy, health, coverage and alert statistics' })
  list(@CurrentUser() user: AuthContext) {
    return this.farms.list(user);
  }

  @Post('farms')
  @RequirePermissions(Permission.MANAGE_FARMS)
  create(@CurrentUser() user: AuthContext, @Body() dto: CreateFarmDto) {
    return this.farms.create(user, dto);
  }

  @Get('farms/:id')
  @ApiOperation({ summary: 'Farm detail with barns and geofences' })
  get(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.farms.get(user, id);
  }

  @Patch('farms/:id')
  @RequirePermissions(Permission.MANAGE_FARMS)
  update(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: UpdateFarmDto) {
    return this.farms.update(user, id, dto);
  }

  @Delete('farms/:id')
  @RequirePermissions(Permission.MANAGE_FARMS)
  remove(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.farms.remove(user, id);
  }

  @Get('farms/:id/environment')
  @ApiQuery({ name: 'hours', required: false, example: 24 })
  environment(
    @CurrentUser() user: AuthContext,
    @Param('id') id: string,
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
  ) {
    return this.farms.environment(user, id, hours);
  }

  @Get('farms/:id/activity')
  activity(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.farms.activity(user, id);
  }

  // Barns ---------------------------------------------------------------------

  @Get('barns')
  @ApiQuery({ name: 'farmId', required: false })
  listBarns(@CurrentUser() user: AuthContext, @Query('farmId') farmId?: string) {
    return this.farms.listBarns(user, farmId);
  }

  @Get('farms/:id/barns')
  farmBarns(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.farms.listBarns(user, id);
  }

  @Post('farms/:id/barns')
  @RequirePermissions(Permission.MANAGE_FARMS)
  createBarn(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: BarnInputDto) {
    return this.farms.createBarn(user, id, dto);
  }

  @Patch('barns/:id')
  @RequirePermissions(Permission.MANAGE_FARMS)
  updateBarn(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: UpdateBarnDto) {
    return this.farms.updateBarn(user, id, dto);
  }

  @Delete('barns/:id')
  @RequirePermissions(Permission.MANAGE_FARMS)
  removeBarn(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.farms.removeBarn(user, id);
  }

  // Geofences -----------------------------------------------------------------

  @Get('geofences')
  @ApiQuery({ name: 'farmId', required: false })
  listGeofences(@CurrentUser() user: AuthContext, @Query('farmId') farmId?: string) {
    return this.farms.listGeofences(user, farmId);
  }

  @Post('farms/:id/geofences')
  @RequirePermissions(Permission.MANAGE_FARMS)
  createGeofence(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: GeofenceDto) {
    return this.farms.createGeofence(user, id, dto);
  }

  @Patch('geofences/:id')
  @RequirePermissions(Permission.MANAGE_FARMS)
  updateGeofence(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: UpdateGeofenceDto) {
    return this.farms.updateGeofence(user, id, dto);
  }

  @Delete('geofences/:id')
  @RequirePermissions(Permission.MANAGE_FARMS)
  removeGeofence(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.farms.removeGeofence(user, id);
  }
}
