import { ProductLikesAndCount } from '../../types/product';
import { productRepo } from '../repositories/productRepository';
import { Product } from '@prisma/client';
import type { ProductListResponse, ProductResponse } from '../../types/product';
import { ForbiddenError } from '../lib/errors/customErrors';
import { commentRepo } from '../repositories/commentRepository';
import type { Comment } from '@prisma/client';
import type { CursorPaginated } from '../../types/cursorPaginated';
import { AlreadyLikeError, AlreadyUnlikeError } from '../lib/errors/customErrors';
import { likeRepo } from '../repositories/likeRepository';
import { Prisma } from '@prisma/client';

//인자 순서가 옵셔널 다음 필수파라미터가 들어오면 컴파일에러가 발생함
//객체로 묶어 보내기, 이러면 필수인 userid의 파라미터 순서를 바꾸지 않아도 됨
export class ProductService {
  async createProduct(params: {
    name: string;
    description: string;
    price: number;
    tags?: string[];
    images?: string[];
    userId: number;
  }): Promise<Product> {
    const { name, description, price, tags, images, userId } = params;
    return productRepo.create({
      name,
      description,
      price,
      tags: tags ?? [],
      images: images ?? [],
      user: { connect: { id: userId } },
    });
  }
  async getProduct(productId: number, userId?: number): Promise<ProductResponse> {
    const product: ProductLikesAndCount = await productRepo.findByIdWithLikes(productId, userId);
    const { likes, _count, ...productData } = product;
    const isLiked = userId ? (likes?.length ?? 0) > 0 : undefined;
    return { ...productData, likeCount: _count.likes, isLiked };
  }
  async updateProduct(
    productId: number,
    userId: number,
    data: {
      name?: string;
      description?: string;
      price?: number;
      tags?: string[];
      images?: string[];
    },
  ): Promise<Product> {
    const product = await productRepo.findById(productId);
    if (product.userId !== userId) {
      throw new ForbiddenError('해당 상품에 접근 권한이 없습니다.');
    }
    return productRepo.update(productId, data);
  }
  async deleteProduct(productId: number, userId: number): Promise<void> {
    const product = await productRepo.findById(productId);
    if (product.userId !== userId) {
      throw new ForbiddenError('해당 상품에 접근 권한이 없습니다.');
    }
    await productRepo.delete(productId);
  }
  async getProductList(
    page: number,
    pageSize: number,
    orderBy?: 'recent' | 'desc' | 'asc',
    keyword?: string,
    userId?: number,
  ): Promise<ProductListResponse> {
    const where = keyword
      ? {
          OR: [
            { name: { contains: keyword } },
            { description: { contains: keyword } },
            { tags: { has: keyword } },
          ],
        }
      : {};
    const [totalCount, products] = await Promise.all([
      productRepo.count(where),
      productRepo.findProductListWithLikes({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { createdAt: 'asc' },
        where,
        userId,
      }),
    ]);
    const list: ProductResponse[] = products.map((m) => {
      const { _count, likes, ...basicProductData } = m;
      const response: ProductResponse = {
        ...basicProductData,
        likeCount: _count.likes,
      };
      if (!userId) {
        return response;
      }
      const isLiked = (likes ?? []).length > 0;
      return { ...basicProductData, isLiked, likeCount: _count.likes };
    });
    const response: ProductListResponse = {
      list,
      totalCount,
    };
    return response;
  }
  async createComment(userId: number, productId: number, content: string): Promise<Comment> {
    await productRepo.findById(productId);
    return commentRepo.create({
      content,
      user: { connect: { id: userId } },
      product: { connect: { id: productId } },
    });
  }
  async getCommentList(
    productId: number,
    limit: number,
    cursor?: number,
  ): Promise<CursorPaginated<Comment>> {
    await productRepo.findById(productId);
    const commentsWithCursor = await commentRepo.findCommentListQuery({ productId }, limit, cursor);
    const comments = commentsWithCursor.slice(0, limit);
    const cursorComment = commentsWithCursor[commentsWithCursor.length - 1];
    const nextCursor = cursorComment ? cursorComment.id : null;
    return { list: comments, nextCursor };
  }
  async likeProduct(userId: number, productId: number): Promise<{ message: string }> {
    const product = await productRepo.findById(productId);
    const existingLike = await likeRepo.findLike(userId, { productId });
    if (existingLike) {
      throw new AlreadyLikeError();
    }
    await likeRepo.createLike(userId, { productId });
    return { message: `${product.name}상품에 좋아요를 눌렀습니다.` };
  }
  async unlikeProduct(userId: number, productId: number): Promise<{ message: string }> {
    const product = await productRepo.findById(productId);
    try {
      await likeRepo.deleteLike(userId, { productId });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AlreadyUnlikeError();
      }
      throw error;
    }
    return { message: `${product.name}상품의 좋아요를 취소했습니다` };
  }
}

export const productService = new ProductService();
