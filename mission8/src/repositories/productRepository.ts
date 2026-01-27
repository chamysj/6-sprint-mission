import { ProductLikesAndCount } from '../../types/product';
import { prisma } from '../lib/prismaClient';
import { Prisma } from '@prisma/client';
import type { ProductRecentType } from '../../types/product';

class ProductRepository {
  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data });
  }
  async findById(id: number) {
    return prisma.product.findUniqueOrThrow({ where: { id } });
  }
  async findByIdWithLikes(id: number, userId?: number): Promise<ProductLikesAndCount> {
    return prisma.product.findUniqueOrThrow({
      where: { id },
      include: {
        _count: { select: { likes: true } },
        likes: {
          where: { userId: userId ?? -1 },
          select: { id: true },
        },
      },
    });
  }
  async update(id: number, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data });
  }
  async delete(id: number) {
    return prisma.product.delete({ where: { id } });
  }
  async findProductListWithLikes(params: {
    skip: number;
    take: number;
    orderBy: Prisma.ProductOrderByWithRelationInput;
    where: Prisma.ProductWhereInput;
    userId?: number;
  }): Promise<ProductLikesAndCount[]> {
    return prisma.product.findMany({
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
  async count(where: Prisma.ProductWhereInput) {
    return prisma.product.count({ where });
  }
  async findRecentProduct(userId: number, limit: number, type: ProductRecentType) {
    const whereCondition = type === 'myUploaded' ? { userId } : { likes: { some: { userId } } };
    return prisma.product.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export const productRepo = new ProductRepository();
