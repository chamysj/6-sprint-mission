import { create } from 'superstruct';
import { prisma } from '../lib/prismaClient.js';
import { NotFoundError, UnauthorizedError } from '../lib/errors/customErrors.js';
import { IdParamsStruct } from '../structs/commonStructs.js';
import {
  CreateArticleBodyStruct,
  UpdateArticleBodyStruct,
  GetArticleListParamsStruct,
} from '../structs/articlesStructs.js';
import { CreateCommentBodyStruct, GetCommentListParamsStruct } from '../structs/commentsStruct.js';

//게시물 생성
export async function createArticle(req, res) {
  const { title, content, image } = create(req.body, CreateArticleBodyStruct);
  const user = req.user;
  const article = await prisma.article.create({ data: { title, content, image, userId: user.id } });
  return res.status(201).send(article);
}
//게시글 조회(좋아요 포함) , 좋아요 갯수도 포함되면 좋을듯 로직 수정할 것
export async function getArticle(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const user = req.user;
  const article = await prisma.article.findUniqueOrThrow({
    where: { id },
    include: user
      ? {
          likes: {
            where: { userId: user.id },
            select: { id: true },
          },
        }
      : undefined,
  });
  if (!user) {
    return res.send(article);
  }
  const isLiked = article.likes?.length > 0;
  const { likes, ...articleWithoutLikes } = article;
  return res.send({ ...articleWithoutLikes, isLiked });
}
//게시물 수정
export async function updateArticle(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const data = create(req.body, UpdateArticleBodyStruct);
  const user = req.user;
  const article = await prisma.article.findUniqueOrThrow({ where: { id } });
  if (article.userId !== user.id) {
    throw new UnauthorizedError();
  }
  const updateArticle = await prisma.article.update({ where: { id }, data });
  return res.send(updateArticle);
}
//게시물 삭제
export async function deleteArticle(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const user = req.user;
  const article = await prisma.article.findUniqueOrThrow({ where: { id } });
  if (article.userId !== user.id) {
    throw new UnauthorizedError();
  }
  await prisma.article.delete({ where: { id } });
  return res.status(204).send();
}
//게시글 목록 조회(좋아요 포함)
export async function getArticleList(req, res) {
  const { page, pageSize, orderBy, keyword } = create(req.query, GetArticleListParamsStruct);
  const user = req.user;
  const where = {
    title: keyword ? { contains: keyword } : undefined,
  };
  const totalCount = await prisma.article.count({ where });
  const include = user
    ? {
        likes: {
          where: { userId: user.id },
          select: { id: true },
        },
      }
    : undefined;
  const articles = await prisma.article.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { createdAt: 'asc' },
    where,
    include,
  });
  if (!user) {
    return res.send({ list: articles, totalCount });
  }
  const articlesWithIsLiked = articles.map((m) => {
    const isLiked = m.likes?.length > 0;
    const { likes, ...articleWithoutLikes } = m;
    return { ...articleWithoutLikes, isLiked };
  });
  return res.send({
    list: articlesWithIsLiked,
    totalCount,
  });
}
//댓글 등록
export async function createComment(req, res) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, CreateCommentBodyStruct);
  const user = req.user;
  await prisma.article.findUniqueOrThrow({ where: { id: articleId } });
  const comment = await prisma.comment.create({
    data: {
      articleId,
      content,
      userId: user.id,
    },
  });

  return res.status(201).send(comment);
}
//댓글 목록 조회
export async function getCommentList(req, res) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const { cursor, limit } = create(req.query, GetCommentListParamsStruct);

  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) {
    throw new NotFoundError('article', articleId);
  }

  const commentsWithCursor = await prisma.comment.findMany({
    cursor: cursor ? { id: cursor } : undefined,
    take: limit + 1,
    where: { articleId },
    orderBy: { createdAt: 'desc' },
  });
  const comments = commentsWithCursor.slice(0, limit);
  const cursorComment = commentsWithCursor[commentsWithCursor.length - 1];
  const nextCursor = cursorComment ? cursorComment.id : null;

  return res.send({
    list: comments,
    nextCursor,
  });
}
//게시글 좋아요 등록
export async function likeArticle(req, res) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const user = req.user;
  const article = await prisma.article.findUniqueOrThrow({ where: { id: articleId } });
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_articleId: {
        userId: user.id,
        articleId,
      },
    },
  });
  if (existingLike) {
    return res.status(400).send({ message: '해당 게시글에 이미 좋아요를 눌렀습니다.' });
  }
  await prisma.like.create({
    data: {
      userId: user.id,
      articleId,
    },
  });
  return res.status(200).send({ message: `${article.title}게시글에 좋아요를 눌렀습니다` });
}
//게시글 좋아요 취소
export async function unlikeArticle(req, res) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const user = req.user;
  const article = await prisma.article.findUniqueOrThrow({ where: { id: articleId } });
  try {
    await prisma.like.delete({
      where: {
        //@@prisma 복합 unique key 사용, / 이로인해 한 상품, 게시물에 좋아요 중복 불가능 / ex) userId_poductId
        userId_articleId: {
          userId: user.id,
          articleId,
        },
      },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(400).send({ message: '해당 게시글에 대한 좋아요가 존재하지 않습니다.' });
    }
    throw error;
  }
  return res.status(200).send({ message: `${article.title}게시글의 좋아요를 취소했습니다` });
}
