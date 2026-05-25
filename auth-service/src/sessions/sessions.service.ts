import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly repo: Repository<Session>,
  ) {}

  async create(userId: string, ttlSeconds: number): Promise<Session> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const session = this.repo.create({ userId, expiresAt });
    return this.repo.save(session);
  }

  async findValid(sessionId: string): Promise<Session | null> {
    const session = await this.repo.findOneBy({ id: sessionId });
    if (!session) return null;
    if (session.expiresAt < new Date()) {
      await this.repo.delete({ id: sessionId });
      return null;
    }
    return session;
  }

  async invalidate(sessionId: string): Promise<void> {
    await this.repo.delete({ id: sessionId });
  }
}
