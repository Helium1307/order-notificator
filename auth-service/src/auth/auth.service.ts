import {
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    @Inject('SESSION_TTL_SECONDS') private readonly ttl: number,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ sessionId: string; user: User }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const session = await this.sessionsService.create(user.id, this.ttl);
    return { sessionId: session.id, user };
  }

  async validateSession(
    sessionId: string,
  ): Promise<{ userId: string; email: string; name: string }> {
    const session = await this.sessionsService.findValid(sessionId);
    if (!session) throw new UnauthorizedException('Invalid or expired session');
    const user = await this.usersService.findById(session.userId);
    if (!user) throw new UnauthorizedException('User not found');
    return { userId: user.id, email: user.email, name: user.name };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionsService.invalidate(sessionId);
  }
}
