import { Inject, Injectable } from '@nestjs/common';
import { MAIL_PROVIDER, MailProvider, SendMailOptions } from './interfaces/mail-provider.interface';

@Injectable()
export class MailService {
  constructor(
    @Inject(MAIL_PROVIDER)
    private readonly mailProvider: MailProvider,
  ) {}

  async send(options: SendMailOptions) {
    return await this.mailProvider.sendMail(options);
  }

  async sendHtml(to: string | string[], subject: string, html: string) {
    return await this.send({ to, subject, html });
  }

  async sendText(to: string | string[], subject: string, text: string) {
    return await this.send({ to, subject, text });
  }
}
