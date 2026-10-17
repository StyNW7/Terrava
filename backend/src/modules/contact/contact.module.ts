import { Body, Controller, HttpCode, Injectable, Module, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Equals, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { Request } from 'express';
import { Public } from '../../common/decorators';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { MailService } from '../notifications/channels/mail.service';

/** Same fields as the public Contact page form (ContactFormData). */
class ContactDto {
  @ApiProperty({ example: 'Siti Rahmawati' }) @IsString() @MinLength(2) @MaxLength(120) fullName: string;
  @ApiProperty({ example: 'siti@koperasi.id' }) @IsEmail() email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) organization?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) role?: string;
  @ApiProperty({ example: 'demo' }) @IsString() @MaxLength(60) inquiryType: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) farmLocation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) livestockCount?: string;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(5000) message: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) preferredContact?: string;
  @ApiProperty({ example: true }) @Equals(true, { message: 'Consent is required' }) consent: boolean;
}

@Injectable()
class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: AppConfigService,
  ) {}

  async submit(dto: ContactDto, ip?: string) {
    const submission = await this.prisma.contactSubmission.create({ data: { ...dto, ipAddress: ip } });
    const rows = Object.entries(dto)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 8px;color:#6b7c72">${k}</td><td style="padding:4px 8px">${String(v).replace(/</g, '&lt;')}</td></tr>`,
      )
      .join('');
    await Promise.all([
      this.mail.send({
        to: this.config.get('CONTACT_INBOX'),
        subject: `[Terrava Contact] ${dto.inquiryType} — ${dto.fullName}`,
        text: `${dto.fullName} <${dto.email}>\n\n${dto.message}`,
        html: MailService.layout('New contact submission', `<table>${rows}</table>`),
      }),
      this.mail.send({
        to: dto.email,
        subject: 'Terima kasih telah menghubungi Terrava',
        text: `Halo ${dto.fullName}, pesan Anda sudah kami terima. Tim Terrava akan menghubungi Anda dalam 1-2 hari kerja.`,
        html: MailService.layout(
          `Halo ${dto.fullName},`,
          '<p>Pesan Anda sudah kami terima. Tim Terrava akan menghubungi Anda dalam 1-2 hari kerja.</p>',
        ),
      }),
    ]);
    return { ok: true, id: submission.id };
  }
}

@ApiTags('Public')
@Controller('contact')
class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Public()
  @Post()
  @HttpCode(201)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'Public website contact form' })
  submit(@Body() dto: ContactDto, @Req() req: Request) {
    return this.contact.submit(dto, req.ip);
  }
}

@Module({ controllers: [ContactController], providers: [ContactService] })
export class ContactModule {}
