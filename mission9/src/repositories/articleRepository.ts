import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prismaClient';
import { ArticleLikesAndCount } from '../../types/article';

export class ArticleRepository {
  async create(data: Prisma.ArticleCreateInput) {
    return prisma.article.create({ data });
  }
  async findById(id: number) {
    return prisma.article.findUniqueOrThrow({ where: { id } });
  }
  async findByIdWithLikes(id: number, userId?: number): Promise<ArticleLikesAndCount> {
    return prisma.article.findUniqueOrThrow({
      where: { id },
      include: {
        _count: { select: { likes: true } },
        likes: {
          //비로그인 시 -1을 줘서 []을 뱉도록
          where: { userId: userId ?? -1 },
          select: { id: true },
        },
      },
    });
  }
  async findArticleListWithLikes(params: {
    skip: number;
    take: number;
    orderBy: Prisma.ArticleOrderByWithRelationInput;
    where: Prisma.ArticleWhereInput;
    userId?: number;
  }): Promise<ArticleLikesAndCount[]> {
    return prisma.article.findMany({
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy,
      where: params.where,
      include: {
        _count: { select: { likes: true } },
        likes: {
          where: { userId: params.userId ?? -1 },
          select: { id: true },
        },
      },
    });
  }
  async count(where: Prisma.ArticleWhereInput) {
    return prisma.article.count({ where });
  }
  async update(id: number, data: Prisma.ArticleUpdateInput) {
    return prisma.article.update({ where: { id }, data });
  }
  async delete(id: number) {
    return prisma.article.delete({ where: { id } });
  }
}

export const articleRepo = new ArticleRepository();
