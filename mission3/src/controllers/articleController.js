import { CreateArticleStruct, PatchArticleStruct } from '../structs/articleStructs.js';
import { create } from 'superstruct';
import { PrismaClient } from '@prisma/client';
import { IdParamsStruct } from '../structs/productStructs.js';
import { CreateCommentStruct } from '../structs/commentStructs.js';

const prisma = new PrismaClient();

export async function validateCreateArticle(req, res) {
  const data = create(req.body, CreateArticleStruct);
  const article = await prisma.article.create({ data });
  return res.status(201).send(article);
}

export async function validateGetArticle(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const article = await prisma.article.findUnique({ where: { id } });
  return res.send(article);
}

export async function validatePatchArticle(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const data = create(req.body, PatchArticleStruct);
  await prisma.article.findUnique({ where: { id } });
  const updateArticle = await prisma.article.update({ where: { id }, data });
  return res.json({ message: '수정에 성공했습니다.', data: updateArticle });
}

export async function validateDeleteArticle(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const article = await prisma.article.findUnique({ where: { id } });
  return res.json({ message: '삭제에 성공했습니다.', data: article });
}

export async function validateGetArticles(req, res) {
  const { offset = 0, limit = 10, order = 'newest', includeWord = '' } = req.query;
  let orderBy;
  switch (order) {
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
  }
  const findWord = String(includeWord || '').trim();
  const where = findWord
    ? {
        OR: [
          { title: { contains: findWord, mode: 'insensitive' } },
          { content: { contains: findWord, mode: 'insensitive' } },
        ],
      }
    : {};
  const articles = await prisma.article.findMany({
    where,
    orderBy,
    skip: parseInt(offset),
    take: parseInt(limit),
  });
  return res.send(articles);
}

export async function validateCreateComment(req, res) {
  const { id: articleId } = create(req.params, IdParamsStruct); //구조 분해 할당
  const { content, nickname } = create(req.body, CreateCommentStruct);
  const nick = String(nickname ?? '').trim();
  if (!nick) {
    return res
      .status(400) //400은 요청이 잘못된 문법이거나, 유청값이 유효하지 않을 때
      .json({ message: 'nickname을 작성해주세요.' });
  }
  const anon = await prisma.nickname.upsert({
    //nicknmae 컬럼에 @unique같은 제약이 있어야 upsert가 올바르게 작동함
    where: { nickname: nick }, // 스키마 필드명이 `nickname`일 때
    update: {},
    create: { nickname: nick },
  });
  const articleComment = await prisma.articleComment.create({
    data: {
      content,
      article: { connect: { id: articleId } }, // article 연결 , connect는 prisma의 관계 api임
      nickname: { connect: { id: anon.id } }, // nickname 연결 , connect는 의도를 명확히 함, 관계 대상의 레코드 존재여부를 명시적으로 체크하는 장점이 있음
      nicknameText: anon.nickname, //프리즈마 스튜디오에서 nickname확인하기 위함임
    },
    //select지정하지 않으면 기본 스칼라 필드 반환, include나 select는 관계를 포함함
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      nickname: true,
      nicknameText: true,
    },
  });
  return res.status(201).json({ message: '댓글 등록에 성공했습니다.', data: articleComment });
}

/*커서 페이지네이션이 무한 스크롤로 이해하고있습니다. 비유를 하자면 일종의 책갈피를 꽂아두고 이후에 생성된(desc니까 내림차순) 
댓글을 불러오도록 하는 것으로 이해했습니다. 그런데 여기서 잘 이해가 되지 않는 것은 다음페이지를 불러오는 로직인데 hasmore로
limit +1 해서, 있다면 불러오고 없다면 false를 반환하는 것, 다음 커서를 불러올 때 그 커서가 다시 레코드에 포함되니까 옵션으로 skip =1을 준것이 맞을까요
그리고 마지막 커서는 자동으로 db를 통해 지정?되는 것으로 이해를 했는데요. 그것도 맞을까요? 이 기능이 prisma studio에서 showing에 해당하는 기능인가요?
ai로 학습하고 로직생각해보고 코드 수정 및 디벨롭 하다보니 가끔 이게 맞나 싶은 것들이 있어서 주석 남겨봅니다ㅠ
또 ai는 옵셔널체이닝, 널리시 코얼레싱?을 굉장이 많이 쓰더라구요. 실무에서도 많이 쓰이나요?*/

export async function getArticleComments(req, res) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit ?? '10', 10)));
  const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
  const findOptions = {
    where: { articleId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1, // hasMore 판별용으로 하나 더 불러오기
    select: {
      id: true,
      content: true,
      createdAt: true,
    },
  };
  if (cursor) {
    findOptions.cursor = { id: cursor };
    findOptions.skip = 1; // cursor로 지정된 레코드는 결과에서 제외
  }
  const rows = await prisma.articleComment.findMany(findOptions);
  const hasMore = rows.length > limit;
  const results = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? results[results.length - 1].id : null;
  return res.json({ data: results, nextCursor, hasMore });
}
