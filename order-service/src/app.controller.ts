import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';

@Controller('/orders')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  createOrder(
    @Body()
    orderData: {
      productId: string;
      quantity: number;
    },
    @Req() req: Request,
  ): Promise<string> {
    const cookieHeader = req.headers.cookie ?? '';
    return this.appService.createOrder(orderData, cookieHeader);
  }
}
