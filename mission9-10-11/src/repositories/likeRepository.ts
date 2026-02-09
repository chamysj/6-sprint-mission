import { LikeTarget } from '../../types/like';
import { prisma } from '../lib/prismaClient';

class LikdeRepository {
  async findLike(userId: number, target: LikeTarget) {
    const whereCondition =
      'articleId' in target
        ? { userId_articleId: { userId, articleId: target.articleId } }
        : { userId_productId: { userId, productId: target.productId } };
    return prisma.like.findUnique({
      where: whereCondition,
    });
  }
  async createLike(userId: number, target: LikeTarget) {
    return prisma.like.create({ data: { userId, ...target } });
  }
  async deleteLike(userId: number, target: LikeTarget) {
    const whereCondition =
      'articleId' in target
        ? { userId_articleId: { userId, articleId: target.articleId } }
        : { userId_productId: { userId, productId: target.productId } };
    return prisma.like.delete({
      where: whereCondition,
    });
  }
  async getLikers(target: LikeTarget) {
    const whereCondition =
      'articleId' in target ? { articleId: target.articleId } : { productId: target.productId };
    return prisma.like.findMany({
      where: whereCondition,
      select: { userId: true },
    });
  }
}

export const likeRepo = new LikdeRepository();
