import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ROLE_LABEL_VALUES } from '../../common/utils/enums';

export class InviteMemberDto {
  @ApiProperty({ example: 'budi.santoso@terrava.id' }) @IsEmail() email: string;
  @ApiPropertyOptional({ example: 'Budi Santoso' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;
  @ApiProperty({ enum: ROLE_LABEL_VALUES, example: 'Staff' }) @IsIn(ROLE_LABEL_VALUES) role: string;
  @ApiPropertyOptional({ description: 'Primary farm assignment' }) @IsOptional() @IsString() farmId?: string;
  @ApiPropertyOptional({ example: 'Field Officer' }) @IsOptional() @IsString() @MaxLength(80) title?: string;
}

export class UpdateMemberDto {
  @ApiPropertyOptional({ enum: ROLE_LABEL_VALUES }) @IsOptional() @IsIn(ROLE_LABEL_VALUES) role?: string;
  @ApiPropertyOptional({ description: 'Farm id or "all"' }) @IsOptional() @IsString() farmId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) title?: string;
}
