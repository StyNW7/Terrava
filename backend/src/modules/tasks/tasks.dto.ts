import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export const TASK_KINDS = ['vaccination', 'vet', 'weighing', 'inspection', 'follow-up'] as const;

class TaskSourceDto {
  @ApiProperty({ enum: ['alert', 'insight'] }) @IsIn(['alert', 'insight']) type: 'alert' | 'insight';
  @ApiProperty() @IsString() id: string;
}

export class CreateTaskDto {
  @ApiPropertyOptional({ example: 'Check hydration for Bella' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;
  @ApiPropertyOptional({ description: 'Dictionary key for system-generated tasks' })
  @IsOptional()
  @IsString()
  titleKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiProperty({ enum: TASK_KINDS }) @IsIn(TASK_KINDS) kind: (typeof TASK_KINDS)[number];
  @ApiProperty() @IsString() farmId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() livestockId?: string;
  @ApiPropertyOptional({ description: 'Membership id' }) @IsOptional() @IsString() assigneeId?: string;
  @ApiPropertyOptional({ description: 'Free-text assignee when not a member' })
  @IsOptional()
  @IsString()
  assigneeName?: string;
  @ApiProperty({ example: '2026-10-20' }) @IsDateString() dueDate: string;

  @ApiPropertyOptional({ type: TaskSourceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TaskSourceDto)
  source?: TaskSourceDto;
}

export class UpdateTaskDto extends PartialType(
  PickType(CreateTaskDto, ['title', 'description', 'kind', 'assigneeId', 'dueDate'] as const),
) {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() done?: boolean;
}

export class TaskQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() farmId?: string;
  @ApiPropertyOptional({ description: 'Membership id or "me"' }) @IsOptional() @IsString() assigneeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() livestockId?: string;
  @ApiPropertyOptional({ enum: ['overdue', 'today', 'week'] })
  @IsOptional()
  @IsIn(['overdue', 'today', 'week'])
  due?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean()
  done?: boolean;
}

/** Optional overrides when turning an alert or insight into a task. */
export class DerivedTaskDto extends PartialType(
  PickType(CreateTaskDto, ['title', 'description', 'kind', 'assigneeId', 'dueDate'] as const),
) {}
