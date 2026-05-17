import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MailService } from './mail/mail.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService,
  ) {}

  @EventPattern('order:created')
  async handleOrderCreated(
    @Payload() data: { email: string; name: string; orderId: string },
  ): Promise<void> {
    const emailTemplate = {
      to: data.email,
      subject: 'Your order has been created',
      text: `Hello ${data.name}, your order with ID ${data.orderId} has been created successfully!`,
      html: 'template',
    };

    await this.mailService.sendMail(emailTemplate);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
