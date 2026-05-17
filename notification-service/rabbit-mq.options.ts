import { Transport, RmqOptions } from '@nestjs/microservices';

type RabbitMQConfig = {
  urls: string[];
  queue: string;
  queueOptions: {
    durable: boolean;
  };
};

export const rabbitMQConfig = ({
  urls,
  queue,
  queueOptions,
}: Partial<RabbitMQConfig>): RmqOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: urls || ['amqp://localhost:5672'], // Replace with your RabbitMQ server URL
    queue: queue || 'orders_queue', // Define the queue name
    queueOptions: queueOptions || {
      durable: true,
    },
  },
});
