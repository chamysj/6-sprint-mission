import { articleRepo } from '../repositories/articleRepository';
import { ArticleLikesAndCount, ArticleListResponse, ArticleResponse } from '../../types/article';
import { AlreadyLikeError, AlreadyUnlikeError, ForbiddenError } from '../lib/errors/customErrors';
import { commentRepo } from '../repositories/commentRepository';
import { likeRepo } from '../repositories/likeRepository';
import { Prisma, Article, Comment } from '@prisma/client';
import type { CursorPaginated } from '../../types/cursorPaginated';

//객체로 주면 콘트롤러에서 인자순서 상관없이 적용되지만, ()형태로 반환하게되면 인자순서를 서비스형태와 동일하게 넣어야 함
export class ArticleService {
  async createArticle(
    userId: number,
    title: string,
    content: string,
    image?: string | null,
  ): Promise<Article> {
    return articleRepo.create({
      title,
      content,
      image,
      user: { connect: { id: userId } },
    });
  }
  async getArticle(articleId: number, userId?: number): Promise<ArticleResponse> {
    const article: ArticleLikesAndCount = await articleRepo.findByIdWithLikes(articleId, userId);
    const { likes, _count, ...articleData } = article;
    const isLiked = userId ? (likes?.length ?? 0) > 0 : undefined;
    return { ...articleData, likeCount: _count.likes, isLiked };
  }
  async updateArticle(
    articleId: number,
    userId: number,
    data: { title?: string; content?: string; image?: string | null },
  ): Promise<Article> {
    const article = await articleRepo.findById(articleId);
    if (article.userId !== userId) {
      throw new ForbiddenError('해당 게시글에 접근 권한이 없습니다.');
    }
    return articleRepo.update(articleId, data);
  }
  async deleteArticle(articleId: number, userId: number): Promise<void> {
    const article = await articleRepo.findById(articleId);
    if (article.userId !== userId) {
      throw new ForbiddenError('해당 게시글에 접근 권한이 없습니다.');
    }
    await articleRepo.delete(articleId);
  }
  async getArticleList(
    page: number,
    pageSize: number,
    orderBy?: 'recent' | 'desc' | 'asc',
    keyword?: string,
    userId?: number,
  ): Promise<ArticleListResponse> {
    const where = {
      title: keyword ? { contains: keyword } : undefined,
    };
    const [totalCount, articles] = await Promise.all([
      articleRepo.count(where),
      articleRepo.findArticleListWithLikes({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { createdAt: 'asc' },
        where,
        userId,
      }),
    ]);
    const list: ArticleResponse[] = articles.map((m) => {
      const { _count, likes, ...basicArticleData } = m;
      const response: ArticleResponse = {
        ...basicArticleData,
        likeCount: _count.likes,
      };
      if (!userId) {
        return response;
      }
      const isLiked = (likes ?? []).length > 0;
      return { ...basicArticleData, isLiked, likeCount: _count.likes };
    });
    const response: ArticleListResponse = {
      list,
      totalCount,
    };
    return response;
  }
  async createComment(userId: number, articleId: number, content: string): Promise<Comment> {
    await articleRepo.findById(articleId);
    return commentRepo.create({
      content,
      user: { connect: { id: userId } },
      article: { connect: { id: articleId } },
    });
  }
  async getCommentList(
    articleId: number,
    limit: number,
    cursor?: number,
  ): Promise<CursorPaginated<Comment>> {
    await articleRepo.findById(articleId);
    const commentsWithCursor = await commentRepo.findCommentListQuery({ articleId }, limit, cursor);
    const comments = commentsWithCursor.slice(0, limit);
    const cursorComment = commentsWithCursor[commentsWithCursor.length - 1];
    const nextCursor = cursorComment ? cursorComment.id : null;
    return { list: comments, nextCursor };
  }
  //like , unlike 둘다 message를 반환해버려서 이게..프로미스로 타입 설정하는 것이 의미가 있는지...로직 수정 생각해봐야할 듯
  async likeArticle(userId: number, articleId: number): Promise<{ message: string }> {
    const article = await articleRepo.findById(articleId);
    const existingLike = await likeRepo.findLike(userId, { articleId });
    if (existingLike) {
      throw new AlreadyLikeError();
    }
    await likeRepo.createLike(userId, { articleId });
    return { message: `${article.title}게시글에 좋아요를 눌렀습니다.` };
  }
  async unlikeArticle(userId: number, articleId: number): Promise<{ message: string }> {
    const article = await articleRepo.findById(articleId);
    try {
      await likeRepo.deleteLike(userId, { articleId });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AlreadyUnlikeError();
      }
      throw error;
    }
    return { message: `${article.title}게시글의 좋아요를 취소했습니다` };
  }
}
export const articleService = new ArticleService();
