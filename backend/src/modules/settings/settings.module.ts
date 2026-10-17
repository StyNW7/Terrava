import { Body, Controller, Delete, Get, Module, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions } from '../../common/decorators';
import { Permission } from '../../common/permissions';
import type { AuthContext } from '../../common/auth-context';
import { AuthModule } from '../auth/auth.module';
import { SettingsService } from './settings.service';
import { UpdateOrganizationDto, UpdatePreferencesDto, UpdateProfileDto } from './settings.dto';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller()
class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('settings')
  @ApiOperation({ summary: 'All settings tabs (same shape as the dashboard AppSettings)' })
  get(@CurrentUser() user: AuthContext) {
    return this.settings.get(user);
  }

  @Patch('settings/profile')
  updateProfile(@CurrentUser() user: AuthContext, @Body() dto: UpdateProfileDto) {
    return this.settings.updateProfile(user, dto);
  }

  @Patch('settings/preferences')
  @ApiOperation({ summary: 'Farm settings, notifications, appearance and privacy preferences' })
  updatePreferences(@CurrentUser() user: AuthContext, @Body() dto: UpdatePreferencesDto) {
    return this.settings.updatePreferences(user, dto);
  }

  @Patch('settings/thresholds')
  @RequirePermissions(Permission.EDIT_SETTINGS)
  @ApiOperation({ summary: 'Organisation-wide alert thresholds used by the rule engine' })
  @ApiBody({
    schema: {
      example: {
        tempHigh: 39.5,
        tempLow: 37.5,
        heartRate: 100,
        activityDrop: 30,
        batteryLow: 20,
        signalWeak: 25,
        geofenceDuration: 15,
      },
    },
  })
  updateThresholds(@CurrentUser() user: AuthContext, @Body() body: Record<string, unknown>) {
    return this.settings.updateThresholds(user, body);
  }

  @Get('settings/export')
  @RequirePermissions(Permission.EXPORT_REPORTS)
  @ApiOperation({ summary: 'Data and Privacy: export all organisation data as JSON' })
  export(@CurrentUser() user: AuthContext) {
    return this.settings.exportData(user);
  }

  @Delete('settings/account')
  @ApiOperation({ summary: 'Data and Privacy: delete my account' })
  deleteAccount(@CurrentUser() user: AuthContext) {
    return this.settings.deleteAccount(user);
  }

  @Get('organization')
  getOrganization(@CurrentUser() user: AuthContext) {
    return this.settings.getOrganization(user);
  }

  @Patch('organization')
  @RequirePermissions(Permission.EDIT_SETTINGS)
  updateOrganization(@CurrentUser() user: AuthContext, @Body() dto: UpdateOrganizationDto) {
    return this.settings.updateOrganization(user, dto);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
