import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const mockHttpService = { get: jest.fn() };
    const mockClient = { emit: jest.fn() };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: 'ORDER_SERVICE', useValue: mockClient },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('createOrder', () => {
    it('should call appService.createOrder with orderData and cookieHeader', async () => {
      jest.spyOn(appService, 'createOrder').mockResolvedValue('Order created successfully!');

      const mockReq: any = {
        headers: { cookie: 'session_id=abc123' },
      };

      const result = await appController.createOrder(
        { productId: 'p1', quantity: 2 },
        mockReq,
      );

      expect(result).toBe('Order created successfully!');
      expect(appService.createOrder).toHaveBeenCalledWith(
        { productId: 'p1', quantity: 2 },
        'session_id=abc123',
      );
    });
  });
});
