import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { PairingService } from './pairing.service';

@Module({
  controllers: [DevicesController],
  providers: [DevicesService, PairingService],
  exports: [DevicesService, PairingService],
})
export class DevicesModule {}
