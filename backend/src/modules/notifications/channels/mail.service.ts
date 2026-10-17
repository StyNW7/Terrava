import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { AppConfigService } from '../../../config/app-config.service';

export interface MailMessage {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  attachments?: { filename: string; content: Buffer | string; contentType?: string }[];
}

/**
 * Email delivery. Uses SMTP when SMTP_HOST is configured (Resend, Mailgun,
 * Gmail, SES SMTP...) and otherwise logs the message, so local development and
 * tests never need a mail server.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(config: AppConfigService) {
    this.from = config.get('SMTP_FROM');
    const host = config.get('SMTP_HOST');
    this.transporter = host
      ? nodemailer.createTransport({
          host,
          port: config.get('SMTP_PORT'),
          secure: config.get('SMTP_PORT') === 465,
          auth: config.get('SMTP_USER')
            ? { user: config.get('SMTP_USER'), pass: config.get('SMTP_PASSWORD') }
            : undefined,
        })
      : null;
  }

  get enabled() {
    return this.transporter !== null;
  }

  async send(message: MailMessage): Promise<boolean> {
    const recipients = [message.to].flat().filter(Boolean);
    if (!recipients.length) return false;

    if (!this.transporter) {
      this.logger.log(`[mail:dev] to=${recipients.join(', ')} subject="${message.subject}"\n${message.text}`);
      return true;
    }
    try {
      await this.transporter.sendMail({ from: this.from, ...message, to: recipients });
      return true;
    } catch (error) {
      this.logger.error(`Email to ${recipients.join(', ')} failed: ${(error as Error).message}`);
      return false;
    }
  }

  /** Minimal branded HTML wrapper so every email looks consistent. */
  static layout(title: string, bodyHtml: string, cta?: { label: string; url: string }) {
    const button = cta
      ? `<p style="margin:24px 0"><a href="${cta.url}" style="background:#277a4d;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">${cta.label}</a></p>`
      : '';
    return `<!doctype html><html><body style="margin:0;background:#f4f7f5;font-family:Segoe UI,Arial,sans-serif;color:#163d2a">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<div style="font-size:20px;font-weight:700;color:#277a4d;margin-bottom:16px">Terrava</div>
<div style="background:#fff;border-radius:16px;padding:28px;border:1px solid #e3ebe6">
<h1 style="font-size:18px;margin:0 0 12px">${title}</h1>${bodyHtml}${button}</div>
<p style="font-size:12px;color:#6b7c72;margin-top:16px">Terrava · AI-Powered Smart Livestock Ecosystem</p>
</div></body></html>`;
  }
}
