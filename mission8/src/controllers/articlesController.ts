import { create } from 'superstruct';
import { UnauthorizedError } from '../lib/errors/customErrors';
import { IdParamsStruct } from '../structs/commonStructs';
import {
  CreateArticleBodyStruct,
  UpdateArticleBodyStruct,
  GetArticleListParamsStruct,
} from '../structs/articlesStructs';
import { CreateCommentBodyStruct, GetCommentListParamsStruct } from '../structs/commentsStruct';
import { Request, Response } from 'express';
import { articleService } from '../services/articleService';

//게시물 생성
export async function createArticle(req: Request, res: Response) {
  const { title, content, image } = create(req.body, CreateArticleBodyStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const article = await articleService.createArticle(user.id, title, content, image);
  return res.status(201).send(article);
}
// 게시글 조회(좋아요 포함)
export async function getArticle(req: Request, res: Response) {
  const { id } = create(req.params, IdParamsStruct);
  const user = req.user;
  const article = await articleService.getArticle(id, user?.id);
  return res.send(article);
}
//게시물 수정
export async function updateArticle(req: Request, res: Response) {
  const { id } = create(req.params, IdParamsStruct);
  const data = create(req.body, UpdateArticleBodyStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const updated = await articleService.updateArticle(id, user.id, data);
  return res.send(updated);
}
//게시물 삭제
export async function deleteArticle(req: Request, res: Response) {
  const { id } = create(req.params, IdParamsStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  await articleService.deleteArticle(id, user.id);
  return res.status(204).send();
}

//게시글 목록 조회(좋아요 포함)
export async function getArticleList(req: Request, res: Response) {
  const { page, pageSize, orderBy, keyword } = create(req.query, GetArticleListParamsStruct);
  const user = req.user;
  const articles = await articleService.getArticleList(page, pageSize, orderBy, keyword, user?.id);
  return res.send(articles);
}
//댓글 등록
export async function createComment(req: Request, res: Response) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, CreateCommentBodyStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const comment = await articleService.createComment(user.id, articleId, content);
  return res.status(201).send(comment);
}
//댓글 목록 조회
export async function getCommentList(req: Request, res: Response) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const { cursor, limit } = create(req.query, GetCommentListParamsStruct);
  const commnetsList = await articleService.getCommentList(articleId, limit, cursor);
  return res.send(commnetsList);
}
//게시글 좋아요 등록
export async function likeArticle(req: Request, res: Response) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const articleLike = await articleService.likeArticle(user.id, articleId);
  return res.status(200).send(articleLike);
}

//게시글 좋아요 취소
export async function unlikeArticle(req: Request, res: Response) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const articleUnlike = await articleService.unlikeArticle(user.id, articleId);
  return res.status(200).send(articleUnlike);
}
