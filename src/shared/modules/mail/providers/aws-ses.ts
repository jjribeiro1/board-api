import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses';
import { MailProvider, SendMailOptions } from '../interfaces/mail-provider.interface';

@Injectable()
export class AwsSesProvider implements MailProvider {
  private readonly sesClient: SESClient;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID') as string;
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY') as string;

    this.sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const { to, from, subject, html, text, replyTo } = options;

    const defaultFrom = this.configService.get<string>('MAIL_FROM');
    const toAddresses = Array.isArray(to) ? to : [to];

    const params: SendEmailCommandInput = {
      Source: from ?? defaultFrom,
      Destination: {
        ToAddresses: toAddresses,
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          ...(html && {
            Html: {
              Data: html,
              Charset: 'UTF-8',
            },
          }),
          ...(text && {
            Text: {
              Data: text,
              Charset: 'UTF-8',
            },
          }),
        },
      },
      ...(replyTo && { ReplyToAddresses: [replyTo] }),
    };

    const command = new SendEmailCommand(params);
    await this.sesClient.send(command);
  }
}
