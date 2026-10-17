import { Module } from '@nestjs/common';
import { FarmsController } from './farms.controller';
import { FarmsService } from './farms.service';
import { FarmStatsService } from './farm-stats.service';

@Module({
  controllers: [FarmsController],
  providers: [FarmsService, FarmStatsService],
  exports: [FarmsService, FarmStatsService],
})
export class FarmsModule {}
