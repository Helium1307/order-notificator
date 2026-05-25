import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { Session } from '../sessions/session.entity';
import { SessionsModule } from '../sessions/sessions.module';
import { AuthModule } from './auth.module';

async function buildApp(ttlSeconds = 3600): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'better-sqlite3',
        database: ':memory:',
        entities: [User, Session],
        synchronize: true,
      }),
      UsersModule,
      SessionsModule,
      AuthModule,
    ],
  })
    .overrideProvider('SESSION_TTL_SECONDS')
    .useValue(ttlSeconds)
    .compile();

  const app = module.createNestApplication();
  app.use(cookieParser());
  await app.init();
  return app;
}

describe('AuthController (integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await buildApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /users — creates user and returns 201', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'a@test.com', name: 'Alice', password: 'secret' })
      .expect(201);
  });

  it('POST /auth/login with correct credentials — returns 200 and sets cookie', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'b@test.com', name: 'Bob', password: 'pass123' });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'b@test.com', password: 'pass123' })
      .expect(200);

    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('POST /auth/login with wrong password — returns 401', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'c@test.com', name: 'Carol', password: 'correct' });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'c@test.com', password: 'wrong' })
      .expect(401);
  });

  it('GET /session with valid cookie — returns userId, email, name', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'd@test.com', name: 'Diana', password: 'pw' });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'd@test.com', password: 'pw' });

    const cookie = loginRes.headers['set-cookie'];

    const sessionRes = await request(app.getHttpServer())
      .get('/session')
      .set('Cookie', cookie)
      .expect(200);

    expect(sessionRes.body).toMatchObject({
      email: 'd@test.com',
      name: 'Diana',
    });
    expect(sessionRes.body.userId).toBeDefined();
  });

  it('GET /session without cookie — returns 401', async () => {
    await request(app.getHttpServer()).get('/session').expect(401);
  });

  it('GET /session with expired session — returns 401', async () => {
    const shortApp = await buildApp(0); // TTL = 0s → already expired
    await request(shortApp.getHttpServer())
      .post('/users')
      .send({ email: 'e@test.com', name: 'Eve', password: 'pw' });

    const loginRes = await request(shortApp.getHttpServer())
      .post('/auth/login')
      .send({ email: 'e@test.com', password: 'pw' });

    const cookie = loginRes.headers['set-cookie'];

    await request(shortApp.getHttpServer())
      .get('/session')
      .set('Cookie', cookie)
      .expect(401);

    await shortApp.close();
  });

  it('DELETE /auth/logout invalidates the session', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'f@test.com', name: 'Frank', password: 'pw' });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'f@test.com', password: 'pw' });

    const cookie = loginRes.headers['set-cookie'];

    await request(app.getHttpServer())
      .delete('/auth/logout')
      .set('Cookie', cookie)
      .expect(200);

    await request(app.getHttpServer())
      .get('/session')
      .set('Cookie', cookie)
      .expect(401);
  });
});
