import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    @Inject('ORDER_SERVICE') private readonly client: ClientProxy,
    private readonly httpService: HttpService,
  ) {}

  async createOrder(
    orderData: { productId: string; quantity: number },
    cookieHeader: string,
  ): Promise<string> {
    const authUrl = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';

    let sessionUser: { userId: string; email: string; name: string };
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ userId: string; email: string; name: string }>(
          `${authUrl}/session`,
          { headers: { Cookie: cookieHeader } },
        ),
      );
      sessionUser = response.data;
    } catch {
      throw new UnauthorizedException('Invalid session');
    }

    this.client.emit('order:created', {
      email: sessionUser.email,
      name: sessionUser.name,
      orderId: crypto.randomUUID(),
    });

    return 'Order created successfully!';
  }
}
