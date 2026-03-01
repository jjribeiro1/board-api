import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailProvider, SendMailOptions } from '../interfaces/mail-provider.interface';
import { Resend } from 'resend';

@Injectable()
export class ResendProvider implements MailProvider {
  private readonly resendClient: Resend;

  constructor(private readonly configService: ConfigService) {
    this.resendClient = new Resend(this.configService.get<string>('RESEND_API_KEY') as string);
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const { to, from, subject, text } = options;
    const defaultFrom = this.configService.get<string>('MAIL_FROM') as string;
    const toAddresses = Array.isArray(to) ? to : [to];

    const { error } = await this.resendClient.emails.send({
      from: from || defaultFrom,
      to: toAddresses,
      subject,
      text: text as string,
    });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return;
  }
}
