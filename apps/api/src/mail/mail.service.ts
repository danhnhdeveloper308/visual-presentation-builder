import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.validation';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

type SendArgs = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  /** Bản text thuần (fallback client không đọc HTML). */
  text?: string;
};

/**
 * Gửi email transaction qua Brevo REST API (không cần SDK — gọi fetch trực tiếp).
 * Thiếu BREVO_API_KEY → chế độ dev: log nội dung ra console thay vì gửi thật,
 * để luồng quên mật khẩu vẫn test được khi chưa cấu hình mail.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService<Env, true>) {}

  get enabled(): boolean {
    return !!this.config.get('BREVO_API_KEY', { infer: true });
  }

  async send({ to, toName, subject, html, text }: SendArgs): Promise<void> {
    const apiKey = this.config.get('BREVO_API_KEY', { infer: true });
    if (!apiKey) {
      // Dev fallback: không có API key thì in ra để lập trình viên test
      this.logger.warn(
        `[MAIL DEV] Chưa cấu hình BREVO_API_KEY — email tới ${to} không được gửi.\nSubject: ${subject}\n${text ?? html}`,
      );
      return;
    }

    const body = {
      sender: {
        email: this.config.get('BREVO_SENDER_EMAIL', { infer: true }),
        name: this.config.get('BREVO_SENDER_NAME', { infer: true }),
      },
      to: [{ email: to, name: toName ?? to }],
      subject,
      htmlContent: html,
      ...(text ? { textContent: text } : {}),
    };

    const res = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      this.logger.error(`Gửi email thất bại (${res.status}): ${detail}`);
      throw new Error('Gửi email thất bại');
    }
  }
}
