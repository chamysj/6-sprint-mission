import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prismaClient';
import { createSeedUser } from './utils.ts/createUser';
import { cleanDb, disconnectDb } from './utils.ts/cleanDb';

jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

describe('인증이 필요하지 않은 상품 API 통합 테스트', () => {
  let ownerId: number;

  beforeAll(async () => {
    await cleanDb();
    const owner = await createSeedUser();
    ownerId = owner.id;
  });

  beforeEach(async () => {
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.product.deleteMany();
  });

  afterAll(async () => {
    await cleanDb();
    await disconnectDb();
  });

  test('상품이 없을 때, { list: [], totalCount: 0 }을 반환한다', async () => {
    const res = await request(app).get('/products');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ list: [], totalCount: 0 });
  });

  test('여러 개의 상품이 있을 때, list/totalCount를 올바르게 반환한다', async () => {
    await prisma.product.createMany({
      data: [
        { name: '상품1', price: 1000, description: '설명1', tags: [], images: [], userId: ownerId },
        { name: '상품2', price: 2000, description: '설명2', tags: [], images: [], userId: ownerId },
      ],
    });

    const res = await request(app)
      .get('/products')
      .query({ page: 1, pageSize: 10, orderBy: 'recent' });

    expect(res.status).toBe(200);
    expect(res.body.totalCount).toBe(2);
    expect(res.body.list).toHaveLength(2);
    expect(res.body.list[0]).toHaveProperty('likeCount');
    expect(res.body.list).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: '상품1', price: 1000, description: '설명1' }),
        expect.objectContaining({ name: '상품2', price: 2000, description: '설명2' }),
      ]),
    );
  });

  test('page/pageSize로 페이징이 된다', async () => {
    await prisma.product.createMany({
      data: [
        { name: 'P1', price: 1, description: 'D1', tags: [], images: [], userId: ownerId },
        { name: 'P2', price: 2, description: 'D2', tags: [], images: [], userId: ownerId },
        { name: 'P3', price: 3, description: 'D3', tags: [], images: [], userId: ownerId },
        { name: 'P4', price: 4, description: 'D4', tags: [], images: [], userId: ownerId },
        { name: 'P5', price: 5, description: 'D5', tags: [], images: [], userId: ownerId },
      ],
    });

    const res1 = await request(app)
      .get('/products')
      .query({ page: 1, pageSize: 2, orderBy: 'recent' });
    expect(res1.status).toBe(200);
    expect(res1.body.totalCount).toBe(5);
    expect(res1.body.list).toHaveLength(2);

    const res2 = await request(app)
      .get('/products')
      .query({ page: 2, pageSize: 2, orderBy: 'recent' });
    expect(res2.status).toBe(200);
    expect(res2.body.totalCount).toBe(5);
    expect(res2.body.list).toHaveLength(2);

    const res3 = await request(app)
      .get('/products')
      .query({ page: 3, pageSize: 2, orderBy: 'recent' });
    expect(res3.status).toBe(200);
    expect(res3.body.totalCount).toBe(5);
    expect(res3.body.list).toHaveLength(1);
  });

  test('orderBy를 안 주면(기본) createdAt 오래된 순(오름차순)이다', async () => {
    const oldOne = await prisma.product.create({
      data: { name: 'Old', price: 1, description: 'old', tags: [], images: [], userId: ownerId },
    });
    await new Promise((r) => setTimeout(r, 30));
    const newOne = await prisma.product.create({
      data: { name: 'New', price: 2, description: 'new', tags: [], images: [], userId: ownerId },
    });

    const res = await request(app).get('/products').query({ page: 1, pageSize: 10 }); //orderBy 생략

    expect(res.status).toBe(200);
    expect(res.body.list[0].id).toBe(oldOne.id);
    expect(res.body.list[1].id).toBe(newOne.id);
  });

  test("orderBy에 'asc' 같은 값은 허용되지 않아서 400을 반환한다", async () => {
    const res = await request(app)
      .get('/products')
      .query({ page: 1, pageSize: 10, orderBy: 'asc' });

    expect(res.status).toBe(400);
  });

  test('keyword 검색은 name/description/tags 중 하나라도 매칭되면 포함된다', async () => {
    await prisma.product.createMany({
      data: [
        {
          name: 'Apple',
          price: 100,
          description: 'fresh',
          tags: ['fruitTagOnly'],
          images: [],
          userId: ownerId,
        },
        {
          name: 'Banana',
          price: 200,
          description: 'yellowDescOnly',
          tags: ['tasty'],
          images: [],
          userId: ownerId,
        },
        {
          name: 'Car',
          price: 300,
          description: 'vehicle',
          tags: ['transport'],
          images: [],
          userId: ownerId,
        },
      ],
    });

    const r1 = await request(app)
      .get('/products')
      .query({ page: 1, pageSize: 10, orderBy: 'recent', keyword: 'App' });
    expect(r1.status).toBe(200);
    expect(r1.body.totalCount).toBe(1);
    expect(r1.body.list[0].name).toBe('Apple');

    const r2 = await request(app)
      .get('/products')
      .query({ page: 1, pageSize: 10, orderBy: 'recent', keyword: 'yellowDescOnly' });
    expect(r2.status).toBe(200);
    expect(r2.body.totalCount).toBe(1);
    expect(r2.body.list[0].name).toBe('Banana');

    const r3 = await request(app)
      .get('/products')
      .query({ page: 1, pageSize: 10, orderBy: 'recent', keyword: 'fruitTagOnly' });
    expect(r3.status).toBe(200);
    expect(r3.body.totalCount).toBe(1);
    expect(r3.body.list[0].name).toBe('Apple');
  });

  test('공개 조회에서는 isLiked 필드가 내려오지 않는다(로그인 안 함)', async () => {
    await prisma.product.create({
      data: { name: 'NoAuth', price: 10, description: 'x', tags: [], images: [], userId: ownerId },
    });

    const res = await request(app)
      .get('/products')
      .query({ page: 1, pageSize: 10, orderBy: 'recent' });
    expect(res.status).toBe(200);

    // list 내 isLiked가 없어야 함
    for (const item of res.body.list) {
      expect(item).not.toHaveProperty('isLiked');
      expect(item).toHaveProperty('likeCount');
    }
  });

  test('잘못된 쿼리(page가 숫자가 아님)는 400을 반환한다', async () => {
    const res = await request(app).get('/products').query({ page: 'abc', pageSize: 10 });
    expect([400, 422]).toContain(res.status);
  });

  describe('GET /products/:id (공개 상세 조회)', () => {
    test('ID로 상품 상세를 반환한다', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Detail',
          description: 'Detail desc',
          price: 123,
          tags: [],
          images: [],
          userId: ownerId,
        },
      });

      const res = await request(app).get(`/products/${product.id}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Detail');
      expect(res.body.description).toBe('Detail desc');
      expect(res.body).toHaveProperty('likeCount');
      expect(res.body).not.toHaveProperty('isLiked');
    });

    test('존재하지 않는 id면 404(또는 400)를 반환한다', async () => {
      const res = await request(app).get('/products/999999999');
      expect([404, 400]).toContain(res.status);
    });
  });

  describe('GET /products/:id/comments (공개 댓글 목록 조회)', () => {
    test('댓글이 없으면 빈 목록을 반환한다', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'NoComment',
          description: 'x',
          price: 1,
          tags: [],
          images: [],
          userId: ownerId,
        },
      });

      const res = await request(app)
        .get(`/products/${product.id}/comments`)
        .query({ cursor: 0, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ list: [], nextCursor: null });
    });

    test('cursor/limit로 페이지네이션이 된다', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'WithComments',
          description: 'x',
          price: 1,
          tags: [],
          images: [],
          userId: ownerId,
        },
      });

      const commenter = await prisma.user.create({
        data: { email: `c+${Date.now()}@ex.com`, nickname: `c_${Date.now()}`, password: 'pw' },
      });

      await prisma.comment.createMany({
        data: [
          { content: 'c1', productId: product.id, userId: commenter.id },
          { content: 'c2', productId: product.id, userId: commenter.id },
          { content: 'c3', productId: product.id, userId: commenter.id },
        ],
      });

      const res = await request(app)
        .get(`/products/${product.id}/comments`)
        .query({ cursor: 0, limit: 2 });

      expect(res.status).toBe(200);
      expect(res.body.list).toHaveLength(2);
      expect(res.body.nextCursor).toBeTruthy();
    });
  });
});
