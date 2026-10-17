import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class ReportQueryDto {
  @ApiPropertyOptional({ default: 'all' }) @IsOptional() @IsString() farmId?: string;
  @ApiPropertyOptional({ default: 'all', example: 'Dairy Cattle' }) @IsOptional() @IsString() livestockType?: string;
  @ApiPropertyOptional({ default: 'all', enum: ['all', 'healthy', 'attention', 'critical', 'inactive'] })
  @IsOptional()
  @IsIn(['all', 'healthy', 'attention', 'critical', 'inactive'])
  health?: string;
  @ApiPropertyOptional({ enum: ['7d', '30d', '90d'], default: '30d' })
  @IsOptional()
  @IsIn(['7d', '30d', '90d'])
  range?: '7d' | '30d' | '90d';
  @ApiPropertyOptional({ enum: ['id', 'en'], default: 'id' }) @IsOptional() @IsIn(['id', 'en']) lang?: 'id' | 'en';
}

export class DownloadQueryDto extends ReportQueryDto {
  @ApiProperty({ enum: ['pdf', 'csv'] }) @IsIn(['pdf', 'csv']) format: 'pdf' | 'csv';
}

export class ScheduleDto {
  @ApiProperty({ enum: ['daily', 'weekly', 'monthly'] }) @IsIn(['daily', 'weekly', 'monthly']) frequency:
    'daily' | 'weekly' | 'monthly';
  @ApiProperty({ example: 1, description: '1-7 (Mon-Sun) for weekly, 1-28 for monthly, ignored for daily' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(28)
  day: number;
  @ApiProperty({ example: '07:00' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'time must be HH:mm' })
  time: string;
  @ApiProperty({ enum: ['pdf', 'csv'] }) @IsIn(['pdf', 'csv']) format: 'pdf' | 'csv';
  @ApiProperty({ type: [String], example: ['owner@terrava.id'] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsEmail({}, { each: true })
  recipients: string[];
  @ApiPropertyOptional({ enum: ['id', 'en'] }) @IsOptional() @IsIn(['id', 'en']) language?: 'id' | 'en';
}
