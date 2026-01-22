import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prismaClient';

export class CommentRepository {
  async create(data: Prisma.CommentCreateInput) {
    return prisma.comment.create({ data });
  }
  async findCommentListQuery(
    whereCondition: { articleId: number } | { productId: number },
    limit: number,
    cursor?: number,
  ) {
    return prisma.comment.findMany({
      cursor: cursor ? { id: cursor } : undefined,
      take: limit + 1,
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
    });
  }
  async findById(id: number) {
    return prisma.comment.findUniqueOrThrow({ where: { id } });
  }
  async update(id: number, content?: string) {
    return prisma.comment.update({ where: { id }, data: { content } });
  }
  async delete(id: number) {
    return prisma.comment.delete({ where: { id } });
  }
}

export const commentRepo = new CommentRepository();
