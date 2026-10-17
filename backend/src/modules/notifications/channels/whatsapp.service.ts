import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';

/**
 * WhatsApp delivery through an HTTP gateway. The request shape
 * (`POST {target, message}` with a token in `Authorization`) matches common
 * Indonesian providers such as Fonnte and Wablas; adapt `send()` for the WhatsApp
 * Cloud API or Twilio if needed. Without configuration, messages are logged.
 */
@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private readonly config: AppConfigService) {}

  get enabled() {
    return Boolean(this.config.get('WHATSAPP_API_URL') && this.config.get('WHATSAPP_API_TOKEN'));
  }

  /** Normalise Indonesian numbers to 62xxxxxxxxxx. */
  static normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) return `62${digits.slice(1)}`;
    if (digits.startsWith('8')) return `62${digits}`;
    return digits;
  }

  async send(phone: string, message: string): Promise<boolean> {
    const target = WhatsAppService.normalizePhone(phone);
    if (!this.enabled) {
      this.logger.log(`[whatsapp:dev] to=${target}\n${message}`);
      return true;
    }
    try {
      const response = await fetch(this.config.get('WHATSAPP_API_URL')!, {
        method: 'POST',
        headers: { Authorization: this.config.get('WHATSAPP_API_TOKEN')!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, message }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return true;
    } catch (error) {
      this.logger.error(`WhatsApp to ${target} failed: ${(error as Error).message}`);
      return false;
    }
  }
}
