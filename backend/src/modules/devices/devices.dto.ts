import { ApiProperty, ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export const DEVICE_TYPES = ['ear-tag', 'gateway', 'environmental-sensor'] as const;
export const DEVICE_STATUSES = ['online', 'offline', 'low-battery', 'maintenance'] as const;
export const COMMAND_TYPES = ['restart', 'run-diagnostics', 'set-interval', 'firmware-update', 'locate'] as const;

export class DeviceQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: DEVICE_TYPES }) @IsOptional() @IsIn(DEVICE_TYPES) type?: string;
  @ApiPropertyOptional({ enum: DEVICE_STATUSES }) @IsOptional() @IsIn(DEVICE_STATUSES) status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() farmId?: string;
  @ApiPropertyOptional({ enum: ['assigned', 'unassigned'] })
  @IsOptional()
  @IsIn(['assigned', 'unassigned'])
  assignment?: string;
}

export class CreateDeviceDto {
  @ApiProperty({ example: 'DEV-021', description: 'Serial printed on the hardware' })
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  serial: string;

  @ApiProperty({ example: 'Smart Ear Tag 021' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ enum: DEVICE_TYPES })
  @IsIn(DEVICE_TYPES)
  type: (typeof DEVICE_TYPES)[number];

  @ApiProperty()
  @IsString()
  farmId: string;

  @ApiPropertyOptional() @IsOptional() @IsString() barnId?: string;

  @ApiPropertyOptional({ example: '70B3D57ED005A1B2', description: 'LoRaWAN DevEUI (16 hex chars)' })
  @IsOptional()
  @Matches(/^[0-9A-Fa-f]{16}$/, { message: 'devEui must be 16 hexadecimal characters' })
  devEui?: string;

  @ApiPropertyOptional({ example: 'v2.4.1' }) @IsOptional() @IsString() firmware?: string;

  @ApiPropertyOptional({ example: 300, description: 'Seconds between transmissions' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(30)
  @Max(86_400)
  reportInterval?: number;

  @ApiPropertyOptional() @IsOptional() @IsLatitude() latitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsLongitude() longitude?: number;
}

export class UpdateDeviceDto extends PartialType(OmitType(CreateDeviceDto, ['serial', 'type'] as const)) {}

export class MaintenanceNoteDto {
  @ApiPropertyOptional({ example: 'Replaced battery and cleaned the solar panel' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class AssignmentDto {
  @ApiPropertyOptional({ description: 'Livestock id, or null to unpair', nullable: true })
  @IsOptional()
  @IsString()
  livestockId?: string | null;
}

export class CommandDto {
  @ApiProperty({ enum: COMMAND_TYPES })
  @IsIn(COMMAND_TYPES)
  type: (typeof COMMAND_TYPES)[number];

  @ApiPropertyOptional({ example: { interval: 600 } })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
