import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

export type SendMailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

@Injectable()
export class MailService {
  private readonly logger: Logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}
  async sendMail(options: SendMailOptions) {
    try {
      await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      this.logger.log(
        `Email sent to ${options.to} with subject "${options.subject}"`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error}`);
    }
  }
}
