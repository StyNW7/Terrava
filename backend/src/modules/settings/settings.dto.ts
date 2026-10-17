import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: '+62 812 3456 7890' })
  @IsOptional()
  @Matches(/^\+?[0-9 ()-]{8,20}$/, { message: 'Invalid phone number' })
  phone?: string;

  @ApiPropertyOptional({ enum: ['wib', 'wita', 'wit'] })
  @IsOptional()
  @IsIn(['wib', 'wita', 'wit'])
  timezone?: string;

  @ApiPropertyOptional({ enum: ['id', 'en'] })
  @IsOptional()
  @IsIn(['id', 'en'])
  locale?: string;

  @ApiPropertyOptional({ description: 'Image URL or data URL (max ~1.5 MB); null removes the photo', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2_000_000)
  avatarUrl?: string | null;
}

/** Partial update of farm / notifications / appearance / privacy preference groups. */
export class UpdatePreferencesDto {
  @ApiPropertyOptional() @IsOptional() @IsObject() farm?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsObject() notifications?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsObject() appearance?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsObject() privacy?: Record<string, unknown>;
}

export class UpdateOrganizationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() province?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional({ example: 'Asia/Jakarta' }) @IsOptional() @IsString() timezone?: string;
}
