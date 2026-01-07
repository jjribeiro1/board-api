import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { MAIL_PROVIDER } from './interfaces/mail-provider.interface';
import { AwsSesProvider } from './providers/aws-ses.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MAIL_PROVIDER,
      useClass: AwsSesProvider,
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
