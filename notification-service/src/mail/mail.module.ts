import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '1025', 10),
          secure: false,
        },
        defaults: {
          from: process.env.SMTP_FROM,
        },
        template: {
          dir: __dirname + './templates',
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  exports: [MailService],
  providers: [MailService],
})
export class MailModule {}
