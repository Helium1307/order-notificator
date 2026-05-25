import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SessionsModule } from './sessions/sessions.module';
import { User } from './users/user.entity';
import { Session } from './sessions/session.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DATABASE_PATH ?? './auth.db',
      entities: [User, Session],
      synchronize: true,
    }),
    UsersModule,
    SessionsModule,
    AuthModule,
  ],
})
export class AppModule {}
