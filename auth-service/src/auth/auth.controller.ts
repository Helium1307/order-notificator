import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

const SESSION_COOKIE = 'session_id';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('users')
  @HttpCode(201)
  async register(
    @Body() body: { email: string; name: string; password: string },
  ) {
    const user = await this.usersService.register(
      body.email,
      body.name,
      body.password,
    );
    return { id: user.id, email: user.email, name: user.name };
  }

  @Post('auth/login')
  @HttpCode(200)
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { sessionId } = await this.authService.login(body.email, body.password);
    res.cookie(SESSION_COOKIE, sessionId, { httpOnly: true });
    return { message: 'Login successful' };
  }

  @Get('session')
  async getSession(@Req() req: Request) {
    const sessionId = req.cookies?.[SESSION_COOKIE];
    if (!sessionId) throw new UnauthorizedException('Session cookie missing');
    return this.authService.validateSession(sessionId);
  }

  @Delete('auth/logout')
  @HttpCode(200)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = req.cookies?.[SESSION_COOKIE];
    if (sessionId) {
      await this.authService.logout(sessionId);
      res.clearCookie(SESSION_COOKIE);
    }
    return { message: 'Logout successful' };
  }
}
