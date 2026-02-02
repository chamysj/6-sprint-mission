import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prismaClient';
import { createSeedUser } from './utils.ts/createUser';
import { cleanDb, disconnectDb } from './utils.ts/cleanDb';

jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

describe('인증이 필요하지 않은 게시글 API 통합 테스트', () => {
  let ownerId: number;

  beforeAll(async () => {
    await cleanDb();
    const owner = await createSeedUser();
    ownerId = owner.id;
  });

  beforeEach(async () => {
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.article.deleteMany();
  });

  afterAll(async () => {
    await cleanDb();
    await disconnectDb();
  });

  describe('GET /articles (공개 조회)', () => {
    it('게시글이 없으면 { list: [], totalCount: 0 }을 반환한다', async () => {
      const res = await request(app).get('/articles');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ list: [], totalCount: 0 });
    });

    it('여러 개의 게시글이 있으면 list/totalCount를 올바르게 반환한다', async () => {
      await prisma.article.createMany({
        data: [
          { title: '글1', content: '내용1', image: null, userId: ownerId },
          { title: '글2', content: '내용2', image: null, userId: ownerId },
        ],
      });

      const res = await request(app)
        .get('/articles')
        .query({ page: 1, pageSize: 10, orderBy: 'recent' });

      expect(res.status).toBe(200);
      expect(res.body.totalCount).toBe(2);
      expect(res.body.list).toHaveLength(2);
      expect(res.body.list).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ title: '글1', content: '내용1' }),
          expect.objectContaining({ title: '글2', content: '내용2' }),
        ]),
      );
    });

    it('page/pageSize로 페이징이 된다', async () => {
      await prisma.article.createMany({
        data: [
          { title: 'A1', content: 'C1', image: null, userId: ownerId },
          { title: 'A2', content: 'C2', image: null, userId: ownerId },
          { title: 'A3', content: 'C3', image: null, userId: ownerId },
          { title: 'A4', content: 'C4', image: null, userId: ownerId },
          { title: 'A5', content: 'C5', image: null, userId: ownerId },
        ],
      });

      const res1 = await request(app)
        .get('/articles')
        .query({ page: 1, pageSize: 2, orderBy: 'recent' });
      expect(res1.status).toBe(200);
      expect(res1.body.totalCount).toBe(5);
      expect(res1.body.list).toHaveLength(2);

      const res2 = await request(app)
        .get('/articles')
        .query({ page: 2, pageSize: 2, orderBy: 'recent' });
      expect(res2.status).toBe(200);
      expect(res2.body.totalCount).toBe(5);
      expect(res2.body.list).toHaveLength(2);

      // 실제로 다른 페이지인지 확인
      expect(res1.body.list[0].id).not.toBe(res2.body.list[0].id);
    });

    it("orderBy='asc' 같은 값은 허용되지 않아 400을 반환한다(Struct 기준)", async () => {
      const res = await request(app)
        .get('/articles')
        .query({ page: 1, pageSize: 10, orderBy: 'asc' });

      expect(res.status).toBe(400);
    });

    it('keyword 검색은 title/content에 매칭되면 포함된다', async () => {
      await prisma.article.createMany({
        data: [
          { title: 'Apple Story', content: 'fresh', image: null, userId: ownerId },
          { title: 'Banana', content: 'yellowDescOnly', image: null, userId: ownerId },
          { title: 'Car', content: 'vehicle', image: null, userId: ownerId },
        ],
      });

      const r1 = await request(app)
        .get('/articles')
        .query({ page: 1, pageSize: 10, orderBy: 'recent', keyword: 'Apple' });
      expect(r1.status).toBe(200);
      expect(r1.body.totalCount).toBe(1);
      expect(r1.body.list[0].title).toContain('Apple');

      const r2 = await request(app)
        .get('/articles')
        .query({ page: 1, pageSize: 10, orderBy: 'recent', keyword: 'yellowDescOnly' });
      expect(r2.status).toBe(200);
      expect(r2.body.totalCount).toBe(1);
      expect(r2.body.list[0].title).toBe('Banana');
    });

    it('잘못된 쿼리(page가 숫자가 아님)는 400(또는 스펙 코드)을 반환한다', async () => {
      const res = await request(app).get('/articles').query({ page: 'abc', pageSize: 10 });
      expect([400, 422]).toContain(res.status);
    });
  });

  describe('GET /articles/:id (공개 상세 조회)', () => {
    it('ID로 게시글 상세를 반환한다', async () => {
      const article = await prisma.article.create({
        data: { title: 'Detail', content: 'Detail content', image: null, userId: ownerId },
      });

      const res = await request(app).get(`/articles/${article.id}`);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Detail');
      expect(res.body.content).toBe('Detail content');
    });

    it('존재하지 않는 id면 404(또는 400)를 반환한다', async () => {
      const res = await request(app).get('/articles/999999999');
      expect([404, 400]).toContain(res.status);
    });
  });

  describe('GET /articles/:id/comments (공개 댓글 목록 조회)', () => {
    it('댓글이 없으면 빈 목록을 반환한다', async () => {
      const article = await prisma.article.create({
        data: { title: 'A', content: 'C', image: null, userId: ownerId },
      });

      const res = await request(app)
        .get(`/articles/${article.id}/comments`)
        .query({ cursor: 0, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ list: [], nextCursor: null });
    });

    it('cursor/limit로 페이지네이션이 된다(구현되어 있다면)', async () => {
      const article = await prisma.article.create({
        data: { title: 'A', content: 'C', image: null, userId: ownerId },
      });

      const commenter = await prisma.user.create({
        data: { email: `c+${Date.now()}@ex.com`, nickname: `c_${Date.now()}`, password: 'pw' },
      });

      await prisma.comment.createMany({
        data: [
          { content: 'c1', articleId: article.id, userId: commenter.id },
          { content: 'c2', articleId: article.id, userId: commenter.id },
          { content: 'c3', articleId: article.id, userId: commenter.id },
        ],
      });

      const res = await request(app)
        .get(`/articles/${article.id}/comments`)
        .query({ cursor: 0, limit: 2 });

      expect(res.status).toBe(200);
      expect(res.body.list).toHaveLength(2);
      expect(res.body.nextCursor).toBeTruthy();
    });
  });
});
