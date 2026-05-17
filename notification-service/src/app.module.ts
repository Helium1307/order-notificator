import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule } from '@nestjs/microservices';
import { rabbitMQConfig } from '../rabbit-mq.options';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        options: rabbitMQConfig({
          queueOptions: {
            durable: false,
          },
        }),
      },
    ]),
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
