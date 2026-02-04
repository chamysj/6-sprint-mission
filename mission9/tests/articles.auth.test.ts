import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prismaClient';
import { cleanDb, disconnectDb } from './utils.ts/cleanDb';

jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

async function registerAndLogin(email: string, nickname: string) {
  const agent = request.agent(app);
  await agent.post('/users/register').send({
    email,
    nickname,
    password: 'password1',
  });
  await agent.post('/users/login').send({
    email,
    password: 'password1',
  });
  return agent;
}

describe('인증이 필요한 게시글 API 통합 테스트', () => {
  beforeAll(async () => {
    await cleanDb();
  });

  beforeEach(async () => {
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.article.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await cleanDb();
    await disconnectDb();
  });

  describe('POST /articles', () => {
    test('로그인 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).post('/articles').send({
        title: 'NoAuth',
        content: 'x',
        image: null,
      });
      expect(res.status).toBe(401);
    });

    test('로그인 상태면 201과 게시글 정보를 반환한다', async () => {
      const agent = await registerAndLogin('owner-a@example.com', 'ownerA');
      const res = await agent.post('/articles').send({
        title: 'MyArticle',
        content: 'content',
        image: null,
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title', 'MyArticle');
    });
  });

  describe('PATCH /articles/:id', () => {
    test('본인 게시글이면 수정된다', async () => {
      const agent = await registerAndLogin('owner-b@example.com', 'ownerB');
      const article = await prisma.article.create({
        data: {
          title: 'Old',
          content: 'old',
          image: null,
          user: { connect: { email: 'owner-b@example.com' } },
        },
      });
      const res = await agent.patch(`/articles/${article.id}`).send({ title: 'New' });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('New');
    });

    test('다른 사람 게시글이면 403을 반환한다', async () => {
      await prisma.user.create({
        data: { email: 'owner-c@example.com', nickname: 'ownerC', password: 'pw' },
      });
      const article = await prisma.article.create({
        data: {
          title: 'Other',
          content: 'x',
          image: null,
          user: { connect: { email: 'owner-c@example.com' } },
        },
      });
      const agent = await registerAndLogin('user-a@example.com', 'userA');
      const res = await agent.patch(`/articles/${article.id}`).send({ title: 'Nope' });
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /articles/:id', () => {
    test('본인 게시글이면 삭제된다', async () => {
      const agent = await registerAndLogin('owner-d@example.com', 'ownerD');
      const article = await prisma.article.create({
        data: {
          title: 'DeleteMe',
          content: 'x',
          image: null,
          user: { connect: { email: 'owner-d@example.com' } },
        },
      });
      const res = await agent.delete(`/articles/${article.id}`);
      expect(res.status).toBe(204);
    });

    test('다른 사람 게시글이면 403을 반환한다', async () => {
      await prisma.user.create({
        data: { email: 'owner-e@example.com', nickname: 'ownerE', password: 'pw' },
      });
      const article = await prisma.article.create({
        data: {
          title: 'Other',
          content: 'x',
          image: null,
          user: { connect: { email: 'owner-e@example.com' } },
        },
      });
      const agent = await registerAndLogin('user-b@example.com', 'userB');
      const res = await agent.delete(`/articles/${article.id}`);
      expect(res.status).toBe(403);
    });
  });

  describe('POST /articles/:id/comments', () => {
    test('로그인 상태면 댓글이 등록된다', async () => {
      const agent = await registerAndLogin('owner-f@example.com', 'ownerF');
      const article = await prisma.article.create({
        data: {
          title: 'WithComment',
          content: 'x',
          image: null,
          user: { connect: { email: 'owner-f@example.com' } },
        },
      });

      const res = await agent.post(`/articles/${article.id}/comments`).send({ content: 'hello' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('content', 'hello');
    });
  });

  describe('POST/DELETE /articles/:id/like', () => {
    test('좋아요 등록/취소가 동작한다', async () => {
      const agent = await registerAndLogin('owner-g@example.com', 'ownerG');
      const article = await prisma.article.create({
        data: {
          title: 'LikeMe',
          content: 'x',
          image: null,
          user: { connect: { email: 'owner-g@example.com' } },
        },
      });

      const likeRes = await agent.post(`/articles/${article.id}/like`);
      expect(likeRes.status).toBe(200);

      const unlikeRes = await agent.delete(`/articles/${article.id}/like`);
      expect(unlikeRes.status).toBe(200);
    });
  });
});
