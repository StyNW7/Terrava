import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export const ALERT_SEVERITIES = ['info', 'warning', 'high', 'critical'] as const;
export const ALERT_CATEGORIES = ['health', 'behavior', 'location', 'device', 'environmental', 'weather'] as const;
export const ALERT_STATUSES = ['active', 'acknowledged', 'resolved'] as const;

export class AlertQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ALERT_STATUSES, description: 'Comma-separated list allowed' })
  @IsOptional()
  @IsString()
  status?: string;
  @ApiPropertyOptional({ enum: ALERT_SEVERITIES, description: 'Comma-separated list allowed' })
  @IsOptional()
  @IsString()
  severity?: string;
  @ApiPropertyOptional({ enum: ALERT_CATEGORIES, description: 'Comma-separated list allowed' })
  @IsOptional()
  @IsString()
  category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() farmId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() barnId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() livestockId?: string;
  @ApiPropertyOptional({ description: 'Membership id, "me" or "unassigned"' })
  @IsOptional()
  @IsString()
  assignedTo?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() from?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() to?: string;
}

class LocalizedDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(300) id: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(300) en: string;
}

export class CreateAlertDto {
  @ApiProperty({ type: LocalizedDto }) @ValidateNested() @Type(() => LocalizedDto) title: LocalizedDto;
  @ApiProperty({ type: LocalizedDto }) @ValidateNested() @Type(() => LocalizedDto) description: LocalizedDto;
  @ApiProperty({ enum: ALERT_SEVERITIES }) @IsIn(ALERT_SEVERITIES) severity: string;
  @ApiProperty({ enum: ALERT_CATEGORIES }) @IsIn(ALERT_CATEGORIES) category: string;
  @ApiProperty() @IsString() farmId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() barnId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() livestockId?: string;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendations?: string[];
  @ApiPropertyOptional({ default: 80 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  aiConfidence?: number;
}

export class ResolveDto {
  @ApiPropertyOptional({ example: 'Treated with antipyretic, temperature back to normal' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

export class AssignDto {
  @ApiPropertyOptional({ nullable: true, description: 'Membership id, or null to unassign' })
  @IsOptional()
  @IsString()
  assigneeId?: string | null;
}

export class AlertNoteDto {
  @ApiProperty({ example: 'Vet scheduled for 14:00' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text: string;
}

export class BulkAlertDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsString({ each: true })
  ids: string[];

  @ApiProperty({ enum: ['acknowledge', 'resolve', 'reopen', 'assign'] })
  @IsIn(['acknowledge', 'resolve', 'reopen', 'assign'])
  action: 'acknowledge' | 'resolve' | 'reopen' | 'assign';

  @ApiPropertyOptional({ description: 'For assign: membership id or null' })
  @IsOptional()
  @IsString()
  assigneeId?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}
