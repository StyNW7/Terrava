import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Equals, IsBoolean, IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

/** Same rules as the dashboard's Zod password schema (authSchemas.ts). */
export const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;
export const PASSWORD_MESSAGE =
  'Password must be 8+ characters with an uppercase letter, a lowercase letter and a number';

export class LoginDto {
  @ApiProperty({ example: 'demo@terrava.id' })
  @Transform(normalizeEmail)
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Terrava123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;

  @ApiPropertyOptional({ description: 'Sign in to a specific organization when the user belongs to several' })
  @IsOptional()
  @IsString()
  organizationId?: string;
}

/**
 * The three registration steps of the dashboard (RegisterStepOne/Two/Three)
 * submitted together in one request.
 */
export class RegisterDto {
  // Step 1 - account
  @ApiProperty({ example: 'Siti Rahmawati' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ example: 'siti@peternakan.id' })
  @Transform(normalizeEmail)
  @IsEmail()
  email: string;

  @ApiProperty({ example: '081234567890' })
  @Matches(/^[0-9]{8,15}$/, { message: 'Phone must be 8-15 digits' })
  phone: string;

  @ApiProperty({ example: 'Peternak123' })
  @Matches(PASSWORD_RULE, { message: PASSWORD_MESSAGE })
  password: string;

  // Step 2 - farm
  @ApiProperty({ example: 'Peternakan Sumber Rejeki' })
  @IsString()
  @MinLength(2)
  farmName: string;

  @ApiProperty({
    example: 'owner',
    description: 'Role chosen at sign-up (owner, manager, veterinarian, cooperative, government...)',
  })
  @IsString()
  accountRole: string;

  @ApiProperty({ example: 'dairy', description: 'Farm type (dairy, beef, mixed, cooperative...)' })
  @IsString()
  farmType: string;

  @ApiProperty({ example: 'Boyolali' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Jawa Tengah' })
  @IsString()
  province: string;

  @ApiProperty({ example: '11-50' })
  @IsString()
  livestockCount: string;

  @ApiProperty({ example: 'Dairy Cattle' })
  @IsString()
  primaryLivestock: string;

  // Step 3 - preferences
  @ApiProperty({ example: 'whatsapp', enum: ['email', 'whatsapp', 'app', 'sms'] })
  @IsString()
  notificationMethod: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  productUpdates?: boolean;

  @ApiProperty({ example: true })
  @Equals(true, { message: 'You must accept the terms to create an account' })
  agreeTerms: boolean;

  @ApiPropertyOptional({ enum: ['id', 'en'], default: 'id' })
  @IsOptional()
  @IsIn(['id', 'en'])
  locale?: 'id' | 'en';
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'demo@terrava.id' })
  @Transform(normalizeEmail)
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @Matches(PASSWORD_RULE, { message: PASSWORD_MESSAGE })
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @Matches(PASSWORD_RULE, { message: PASSWORD_MESSAGE })
  newPassword: string;
}

export class AcceptInvitationDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiPropertyOptional({ description: 'Required when the invitee has no Terrava account yet' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ description: 'Required when the invitee has no Terrava account yet' })
  @IsOptional()
  @Matches(PASSWORD_RULE, { message: PASSWORD_MESSAGE })
  password?: string;
}

export class SwitchOrganizationDto {
  @ApiProperty()
  @IsString()
  organizationId: string;
}
