import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { MAIL_PROVIDER } from './interfaces/mail-provider.interface';
import { ResendProvider } from './providers/resend';
import { AwsSesProvider } from './providers/aws-ses';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MAIL_PROVIDER,
      useFactory: (configService: ConfigService) => {
        const activeEmailProvider = configService.get<string>('MAIL_PROVIDER');
        if (activeEmailProvider === 'RESEND') {
          return new ResendProvider(configService);
        }
        if (activeEmailProvider === 'AWS_SES') {
          return new AwsSesProvider(configService);
        }
        throw new Error('No valid mail provider configured');
      },
      inject: [ConfigService],
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
