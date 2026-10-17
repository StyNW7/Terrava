import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * One decoded ear tag uplink. Field names follow the Terrava payload spec
 * (iot/protocol/PAYLOAD.md); the gateway or TTN decoder produces this shape.
 */
export class TelemetryReadingDto {
  @ApiPropertyOptional({ example: 'DEV-001', description: 'Device serial (or use devEui)' })
  @IsOptional()
  @IsString()
  deviceSerial?: string;

  @ApiPropertyOptional({ example: '70B3D57ED005A1B2' })
  @IsOptional()
  @IsString()
  devEui?: string;

  @ApiPropertyOptional({ description: 'Sample time from the tag RTC/GPS; defaults to receive time' })
  @IsOptional()
  @IsDateString()
  recordedAt?: string;

  @ApiPropertyOptional({ description: 'Frame counter for duplicate suppression' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sequence?: number;

  @ApiPropertyOptional({ example: 38.7 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(30)
  @Max(45)
  temperature?: number;
  @ApiPropertyOptional({ example: 72 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(20)
  @Max(220)
  heartRate?: number;
  @ApiPropertyOptional({ example: 97 }) @IsOptional() @Type(() => Number) @IsInt() @Min(50) @Max(100) oxygen?: number;
  @ApiPropertyOptional({ example: 64, description: 'Activity index 0-100' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  activity?: number;
  @ApiPropertyOptional({ example: 412 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) steps?: number;
  @ApiPropertyOptional({ example: -7.5312 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;
  @ApiPropertyOptional({ example: 110.6021 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
  @ApiPropertyOptional({ example: 84 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) battery?: number;
  @ApiPropertyOptional({ example: -97 }) @IsOptional() @Type(() => Number) @IsInt() @Min(-150) @Max(0) rssi?: number;
  @ApiPropertyOptional({ example: 7.5 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(-30) @Max(30) snr?: number;
  @ApiPropertyOptional({ example: 'v2.4.1' }) @IsOptional() @IsString() firmware?: string;
}

export class TelemetryBatchDto {
  @ApiProperty({ type: [TelemetryReadingDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => TelemetryReadingDto)
  readings: TelemetryReadingDto[];
}

export class EnvironmentReadingDto {
  @ApiProperty({ example: 'DEV-017' }) @IsString() deviceSerial: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() recordedAt?: string;
  @ApiProperty({ example: 29.4 }) @Type(() => Number) @IsNumber() @Min(-10) @Max(60) temperature: number;
  @ApiProperty({ example: 71 }) @Type(() => Number) @IsNumber() @Min(0) @Max(100) humidity: number;
  @ApiPropertyOptional({ example: 92 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) battery?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() rssi?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() snr?: number;
}

export class EnvironmentBatchDto {
  @ApiProperty({ type: [EnvironmentReadingDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => EnvironmentReadingDto)
  readings: EnvironmentReadingDto[];
}

export class HeartbeatDto {
  @ApiPropertyOptional({ example: 'v1.8.2' }) @IsOptional() @IsString() firmware?: string;
  @ApiPropertyOptional({ example: 86_400 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) uptimeSeconds?: number;
  @ApiPropertyOptional({ example: 1250 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) packetsForwarded?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() rssi?: number;
  @ApiPropertyOptional({ description: 'Gateway backhaul: wifi, ethernet, cellular' })
  @IsOptional()
  @IsString()
  backhaul?: string;
}

export class CommandAckDto {
  @ApiProperty() @IsBoolean() success: boolean;
  @ApiPropertyOptional() @IsOptional() @IsObject() result?: Record<string, unknown>;
}
