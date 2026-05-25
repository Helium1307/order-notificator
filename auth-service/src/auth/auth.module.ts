import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { SessionsModule } from '../sessions/sessions.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [UsersModule, SessionsModule],
  providers: [
    AuthService,
    {
      provide: 'SESSION_TTL_SECONDS',
      useFactory: () => parseInt(process.env.SESSION_TTL_SECONDS ?? '3600', 10),
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
