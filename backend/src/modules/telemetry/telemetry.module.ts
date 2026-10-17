import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  Module,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentGateway, CurrentUser, DeviceAuth } from '../../common/decorators';
import type { AuthContext, DeviceContext } from '../../common/auth-context';
import { AlertsModule } from '../alerts/alerts.module';
import { TelemetryService } from './telemetry.service';
import { DeviceMonitorService } from './device-monitor.service';
import { mapTtnUplink, type TtnUplink } from './ttn.mapper';
import { CommandAckDto, EnvironmentBatchDto, HeartbeatDto, TelemetryBatchDto } from './telemetry.dto';

/**
 * Machine-to-machine endpoints used by the IoT layer (iot/). Authenticated with
 * a gateway API key in the `x-device-key` header, never with a user token.
 */
@ApiTags('IoT Ingest')
@Controller('ingest')
@Throttle({ default: { limit: 600, ttl: 60_000 } })
class IngestController {
  constructor(private readonly telemetry: TelemetryService) {}

  @Post('telemetry')
  @DeviceAuth()
  @HttpCode(202)
  @ApiOperation({ summary: 'Batch of decoded ear tag readings from a gateway / bridge' })
  telemetryBatch(@CurrentGateway() gateway: DeviceContext, @Body() dto: TelemetryBatchDto) {
    return this.telemetry.ingest(gateway, dto.readings);
  }

  @Post('environment')
  @DeviceAuth()
  @HttpCode(202)
  @ApiOperation({ summary: 'Barn temperature / humidity readings (THI is computed server-side)' })
  environmentBatch(@CurrentGateway() gateway: DeviceContext, @Body() dto: EnvironmentBatchDto) {
    return this.telemetry.ingestEnvironment(gateway, dto.readings);
  }

  @Post('ttn')
  @DeviceAuth()
  @HttpCode(202)
  @ApiOperation({ summary: 'The Things Network v3 webhook (set x-device-key as a webhook header)' })
  ttn(@CurrentGateway() gateway: DeviceContext, @Body() body: TtnUplink) {
    const reading = mapTtnUplink(body);
    if (!reading) throw new BadRequestException('Uplink has no decoded vitals payload');
    return this.telemetry.ingest(gateway, [reading]);
  }

  @Post('heartbeat')
  @DeviceAuth()
  @HttpCode(200)
  heartbeat(@CurrentGateway() gateway: DeviceContext, @Body() dto: HeartbeatDto) {
    return this.telemetry.heartbeat(gateway, dto);
  }

  @Get('commands')
  @DeviceAuth()
  @ApiOperation({
    summary: 'Pending downlink commands (scope=farm for a P2P gateway, organization for LoRaWAN bridges)',
  })
  @ApiQuery({ name: 'scope', required: false, enum: ['organization', 'farm'] })
  commands(@CurrentGateway() gateway: DeviceContext, @Query('scope') scope?: string) {
    return this.telemetry.pullCommands(gateway, scope === 'farm' ? 'farm' : 'organization');
  }

  @Post('commands/:id/ack')
  @DeviceAuth()
  @HttpCode(200)
  ack(@CurrentGateway() gateway: DeviceContext, @Param('id') id: string, @Body() dto: CommandAckDto) {
    return this.telemetry.ackCommand(gateway, id, dto.success, dto.result);
  }
}

@ApiTags('Telemetry')
@ApiBearerAuth()
@Controller('telemetry')
class TelemetryController {
  constructor(private readonly telemetry: TelemetryService) {}

  @Get('live')
  @ApiOperation({ summary: 'Live Monitoring: latest vitals for every active animal + threshold breaches' })
  @ApiQuery({ name: 'farmId', required: false })
  live(@CurrentUser() user: AuthContext, @Query('farmId') farmId?: string) {
    return this.telemetry.live(user.organizationId, farmId);
  }

  @Get('livestock/:id/latest')
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  latest(
    @CurrentUser() user: AuthContext,
    @Param('id') id: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.telemetry.latest(user.organizationId, id, limit);
  }
}

@Module({
  imports: [AlertsModule],
  controllers: [IngestController, TelemetryController],
  providers: [TelemetryService, DeviceMonitorService],
  exports: [TelemetryService],
})
export class TelemetryModule {}
