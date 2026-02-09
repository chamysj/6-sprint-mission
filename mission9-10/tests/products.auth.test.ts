import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prismaClient';
import { cleanDb, disconnectDb } from './utils/cleanDb';

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

describe('인증이 필요한 상품 API 통합 테스트', () => {
  beforeAll(async () => {
    await cleanDb();
  });

  beforeEach(async () => {
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await cleanDb();
    await disconnectDb();
  });

  describe('POST /products', () => {
    test('로그인 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).post('/products').send({
        name: 'NoAuth',
        description: 'x',
        price: 100,
        tags: [],
        images: [],
      });
      expect(res.status).toBe(401);
    });

    test('로그인 상태면 201과 상품 정보를 반환한다', async () => {
      const agent = await registerAndLogin('owner@example.com', 'owner01');
      const res = await agent.post('/products').send({
        name: 'MyProduct',
        description: 'desc',
        price: 1000,
        tags: ['t1'],
        images: ['i1'],
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', 'MyProduct');
    });
  });

  describe('PATCH /products/:id', () => {
    test('본인 상품이면 수정된다', async () => {
      const agent = await registerAndLogin('owner2@example.com', 'owner02');
      const product = await prisma.product.create({
        data: {
          name: 'Old',
          description: 'old',
          price: 1,
          tags: [],
          images: [],
          user: { connect: { email: 'owner2@example.com' } },
        },
      });
      const res = await agent.patch(`/products/${product.id}`).send({ name: 'New' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('New');
    });

    test('다른 사람 상품이면 403을 반환한다', async () => {
      await prisma.user.create({
        data: { email: 'owner3@example.com', nickname: 'owner03', password: 'pw' },
      });
      const product = await prisma.product.create({
        data: {
          name: 'Other',
          description: 'x',
          price: 1,
          tags: [],
          images: [],
          user: { connect: { email: 'owner3@example.com' } },
        },
      });
      const agent = await registerAndLogin('user@example.com', 'user01');
      const res = await agent.patch(`/products/${product.id}`).send({ name: 'Nope' });
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /products/:id', () => {
    test('본인 상품이면 삭제된다', async () => {
      const agent = await registerAndLogin('owner4@example.com', 'owner04');
      const product = await prisma.product.create({
        data: {
          name: 'DeleteMe',
          description: 'x',
          price: 1,
          tags: [],
          images: [],
          user: { connect: { email: 'owner4@example.com' } },
        },
      });
      const res = await agent.delete(`/products/${product.id}`);
      expect(res.status).toBe(204);
    });

    test('다른 사람 상품이면 403을 반환한다', async () => {
      await prisma.user.create({
        data: { email: 'owner5@example.com', nickname: 'owner05', password: 'pw' },
      });
      const product = await prisma.product.create({
        data: {
          name: 'Other',
          description: 'x',
          price: 1,
          tags: [],
          images: [],
          user: { connect: { email: 'owner5@example.com' } },
        },
      });
      const agent = await registerAndLogin('user2@example.com', 'user02');
      const res = await agent.delete(`/products/${product.id}`);
      expect(res.status).toBe(403);
    });
  });

  describe('POST /products/:id/comments', () => {
    test('로그인 상태면 댓글이 등록된다', async () => {
      const agent = await registerAndLogin('owner6@example.com', 'owner06');
      const product = await prisma.product.create({
        data: {
          name: 'WithComment',
          description: 'x',
          price: 1,
          tags: [],
          images: [],
          user: { connect: { email: 'owner6@example.com' } },
        },
      });

      const res = await agent.post(`/products/${product.id}/comments`).send({ content: 'hello' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('content', 'hello');
    });
  });

  describe('POST/DELETE /products/:id/like', () => {
    test('좋아요 등록/취소가 동작한다', async () => {
      const agent = await registerAndLogin('owner7@example.com', 'owner07');
      const product = await prisma.product.create({
        data: {
          name: 'LikeMe',
          description: 'x',
          price: 1,
          tags: [],
          images: [],
          user: { connect: { email: 'owner7@example.com' } },
        },
      });

      const likeRes = await agent.post(`/products/${product.id}/like`);
      expect(likeRes.status).toBe(200);

      const unlikeRes = await agent.delete(`/products/${product.id}/like`);
      expect(unlikeRes.status).toBe(200);
    });
  });

  describe('GET /products/me', () => {
    test('내가 등록한 상품 목록을 반환한다', async () => {
      const agent = await registerAndLogin('owner8@example.com', 'owner08');
      const owner = await prisma.user.findUnique({
        where: { email: 'owner8@example.com' },
        select: { id: true },
      });
      if (!owner) {
        throw new Error('Test user not found');
      }
      await prisma.product.createMany({
        data: [
          {
            name: 'Mine1',
            description: 'x',
            price: 1,
            tags: [],
            images: [],
            userId: owner.id,
          },
          {
            name: 'Mine2',
            description: 'x',
            price: 2,
            tags: [],
            images: [],
            userId: owner.id,
          },
        ],
      });

      const res = await agent
        .get('/products/me')
        .query({ page: 1, pageSize: 10, orderBy: 'recent' });
      expect(res.status).toBe(200);
      expect(res.body.totalCount).toBe(2);
      expect(res.body.list).toHaveLength(2);
    });
  });

  describe('GET /products/me/likes', () => {
    test('내가 좋아요한 상품 목록을 반환한다', async () => {
      const agent = await registerAndLogin('owner9@example.com', 'owner09');
      const product = await prisma.product.create({
        data: {
          name: 'Liked',
          description: 'x',
          price: 1,
          tags: [],
          images: [],
          user: {
            create: { email: 'seller@example.com', nickname: 'seller01', password: 'pw' },
          },
        },
      });

      await agent.post(`/products/${product.id}/like`);

      const res = await agent
        .get('/products/me/likes')
        .query({ page: 1, pageSize: 10, orderBy: 'recent' });
      expect(res.status).toBe(200);
      expect(res.body.totalCount).toBe(1);
      expect(res.body.list).toHaveLength(1);
      expect(res.body.list[0].id).toBe(product.id);
    });
  });
});
