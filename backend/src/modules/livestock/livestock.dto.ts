import { ApiProperty, ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export const HEALTH_STATUSES = ['healthy', 'attention', 'critical', 'inactive'] as const;
export const VACCINATION_STATUSES = ['up-to-date', 'due', 'overdue'] as const;
export const HEALTH_RECORD_TYPES = ['examination', 'vaccination', 'treatment', 'weighing', 'observation'] as const;
export const LIVESTOCK_SORT = [
  'code',
  'name',
  'healthScore',
  'temperature',
  'weightKg',
  'lastReadingAt',
  'createdAt',
] as const;

const toBool = ({ value }: { value: unknown }) =>
  value === 'true' || value === true ? true : value === 'false' || value === false ? false : undefined;

export class LivestockQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() farmId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() barnId?: string;
  @ApiPropertyOptional({ enum: HEALTH_STATUSES }) @IsOptional() @IsIn(HEALTH_STATUSES) healthStatus?: string;
  @ApiPropertyOptional({ example: 'Dairy Cattle' }) @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() breed?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() herdGroup?: string;
  @ApiPropertyOptional({ enum: VACCINATION_STATUSES })
  @IsOptional()
  @IsIn(VACCINATION_STATUSES)
  vaccinationStatus?: string;
  @ApiPropertyOptional({ enum: ['online', 'offline', 'low-battery', 'maintenance', 'unassigned'] })
  @IsOptional()
  @IsIn(['online', 'offline', 'low-battery', 'maintenance', 'unassigned'])
  deviceStatus?: string;
  @ApiPropertyOptional({ description: 'Show archived animals instead of active ones' })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  archived?: boolean;
  @ApiPropertyOptional({ enum: LIVESTOCK_SORT, default: 'code' })
  @IsOptional()
  @IsIn(LIVESTOCK_SORT)
  sortBy?: (typeof LIVESTOCK_SORT)[number];
}

/** Mirrors the dashboard's Add Livestock form (schemas/livestockSchema.ts). */
export class CreateLivestockDto {
  @ApiProperty({ example: 'Bella' }) @IsString() @MinLength(1) @MaxLength(80) name: string;
  @ApiProperty({ example: 'Dairy Cattle' }) @IsString() animalType: string;
  @ApiProperty({ example: 'Friesian Holstein' }) @IsString() breed: string;
  @ApiProperty({ enum: ['Male', 'Female'] }) @IsIn(['Male', 'Female']) gender: 'Male' | 'Female';
  @ApiProperty({ example: '2022-03-14' }) @IsDateString() dateOfBirth: string;

  @ApiProperty({ example: 'TRV-041', description: 'Internal ID, unique within the organization' })
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  internalId: string;

  @ApiProperty({ example: 'EAR-1040' }) @IsString() @MinLength(1) @MaxLength(40) earTagId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() rfid?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() registrationNumber?: string;

  @ApiProperty({ example: 420 }) @Type(() => Number) @IsNumber() @Min(1) @Max(2000) weightKg: number;
  @ApiProperty({ example: 3 }) @Type(() => Number) @IsNumber() @Min(1) @Max(5) bodyConditionScore: number;
  @ApiPropertyOptional() @IsOptional() @IsString() markings?: string;

  @ApiProperty() @IsString() farmId: string;
  @ApiProperty() @IsString() barnId: string;
  @ApiProperty({ example: 'Herd 1' }) @IsString() herdGroup: string;
  @ApiProperty({ example: '2024-01-10' }) @IsDateString() arrivalDate: string;
  @ApiProperty({ example: 'Internal breeding' }) @IsString() acquisitionSource: string;

  @ApiProperty({ enum: HEALTH_STATUSES }) @IsIn(HEALTH_STATUSES) initialHealthStatus: string;
  @ApiProperty({ enum: VACCINATION_STATUSES }) @IsIn(VACCINATION_STATUSES) vaccinationStatus: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() lastExaminationDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() knownConditions?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @ApiPropertyOptional({ description: 'Photo URL or data URL' })
  @IsOptional()
  @IsString()
  @MaxLength(2_000_000)
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Ear tag to pair right away' }) @IsOptional() @IsString() deviceId?: string;
}

export class UpdateLivestockDto extends PartialType(
  OmitType(CreateLivestockDto, ['initialHealthStatus', 'deviceId'] as const),
) {
  @ApiPropertyOptional({ enum: HEALTH_STATUSES }) @IsOptional() @IsIn(HEALTH_STATUSES) healthStatus?: string;
}

export class BulkLivestockDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsString({ each: true })
  ids: string[];

  @ApiProperty({ enum: ['archive', 'restore', 'update'] })
  @IsIn(['archive', 'restore', 'update'])
  action: 'archive' | 'restore' | 'update';

  @ApiPropertyOptional({ example: { herdGroup: 'Herd 2', vaccinationStatus: 'up-to-date' } })
  @IsOptional()
  @IsObject()
  patch?: { herdGroup?: string; vaccinationStatus?: string; healthStatus?: string };
}

export class MoveLivestockDto {
  @ApiProperty() @IsString() barnId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) reason?: string;
}

export class AssignDeviceDto {
  @ApiPropertyOptional({ nullable: true, description: 'Device id, or null to unpair' })
  @IsOptional()
  @IsString()
  deviceId?: string | null;
}

export class HealthRecordDto {
  @ApiProperty({ enum: HEALTH_RECORD_TYPES }) @IsIn(HEALTH_RECORD_TYPES) type: string;
  @ApiProperty({ example: 'Routine examination' }) @IsString() @MinLength(2) title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ example: '2026-10-01T08:00:00.000Z' }) @IsDateString() performedAt: string;
  @ApiPropertyOptional({ description: 'Name of the vet or staff if not the current user' })
  @IsOptional()
  @IsString()
  performedByName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() vaccineName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() medication?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dosage?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(1) weightKg?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(5) bodyConditionScore?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() temperature?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() nextDueAt?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) cost?: number;
}
