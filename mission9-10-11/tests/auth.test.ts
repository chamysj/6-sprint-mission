import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prismaClient';
import { cleanDb, disconnectDb } from './utils/cleanDb';

jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

describe('인증 API 통합 테스트 (회원가입/로그인)', () => {
  beforeAll(async () => {
    await cleanDb();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await cleanDb();
    await disconnectDb();
  });

  describe('POST /users/register', () => {
    test('정상 입력이면 201과 사용자 정보를 반환한다', async () => {
      const res = await request(app).post('/users/register').send({
        email: 'newuser@example.com',
        nickname: 'user01',
        password: 'password1',
        image: 'https://example.com/profile.png',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', 'newuser@example.com');
      expect(res.body).toHaveProperty('nickname', 'user01');
      expect(res.body).not.toHaveProperty('password');
    });

    test('이메일 형식이 틀리면 400을 반환한다', async () => {
      const res = await request(app).post('/users/register').send({
        email: 'invalid-email',
        nickname: 'user01',
        password: 'password1',
      });

      expect(res.status).toBe(400);
    });

    test('중복 이메일이면 400을 반환한다', async () => {
      await request(app).post('/users/register').send({
        email: 'dup@example.com',
        nickname: 'user01',
        password: 'password1',
      });

      const res = await request(app).post('/users/register').send({
        email: 'dup@example.com',
        nickname: 'user02',
        password: 'password1',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /users/login', () => {
    test('올바른 이메일/비밀번호면 200과 쿠키를 반환한다', async () => {
      await request(app).post('/users/register').send({
        email: 'login@example.com',
        nickname: 'login01',
        password: 'password1',
      });

      const res = await request(app).post('/users/login').send({
        email: 'login@example.com',
        password: 'password1',
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      const setCookie = res.headers['set-cookie'] ?? [];
      const cookieHeader = Array.isArray(setCookie) ? setCookie.join(';') : setCookie;
      expect(cookieHeader).toContain('access-token=');
      expect(cookieHeader).toContain('refresh-token=');
    });

    test('잘못된 비밀번호면 401을 반환한다', async () => {
      await request(app).post('/users/register').send({
        email: 'wrongpw@example.com',
        nickname: 'wrongpw',
        password: 'password1',
      });

      const res = await request(app).post('/users/login').send({
        email: 'wrongpw@example.com',
        password: 'password2',
      });

      expect(res.status).toBe(401);
    });
  });
});
