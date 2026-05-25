import { HttpService } from '@nestjs/axios';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { AppService } from './app.service';

const mockHttpService = {
  get: jest.fn(),
};

const mockClient = {
  emit: jest.fn(),
};

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: 'ORDER_SERVICE', useValue: mockClient },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('creates order and emits event when session is valid', async () => {
    const sessionData = { userId: 'u1', email: 'a@test.com', name: 'Alice' };
    mockHttpService.get.mockReturnValue(
      of({ data: sessionData, status: 200 } as AxiosResponse),
    );

    const result = await service.createOrder(
      { productId: 'p1', quantity: 2 },
      'session_id=abc123',
    );

    expect(result).toBe('Order created successfully!');
    expect(mockClient.emit).toHaveBeenCalledWith('order:created', {
      email: 'a@test.com',
      name: 'Alice',
      orderId: expect.any(String),
    });
  });

  it('throws UnauthorizedException when auth-service returns 401', async () => {
    mockHttpService.get.mockReturnValue(
      throwError(() => ({ response: { status: 401 } })),
    );

    await expect(
      service.createOrder({ productId: 'p1', quantity: 1 }, 'session_id=invalid'),
    ).rejects.toThrow(UnauthorizedException);

    expect(mockClient.emit).not.toHaveBeenCalled();
  });
});
