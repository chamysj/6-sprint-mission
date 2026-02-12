import { create } from 'superstruct';
import { prisma } from '../lib/prismaClient.js';
import { NotFoundError } from '../lib/errors/customErrors.js';
import { IdParamsStruct } from '../structs/commonStructs.js';
import {
  CreateProductBodyStruct,
  GetProductListParamsStruct,
  UpdateProductBodyStruct,
} from '../structs/productsStruct.js';
import { CreateCommentBodyStruct, GetCommentListParamsStruct } from '../structs/commentsStruct.js';
import { UnauthorizedError } from '../lib/errors/customErrors.js';

//상품 등록
export async function createProduct(req, res) {
  const { name, description, price, tags, images } = create(req.body, CreateProductBodyStruct);
  const user = req.user;
  const product = await prisma.product.create({
    data: { name, description, price, tags, images, userId: user.id },
  });
  res.status(201).send(product);
}
//특정 상품 조회(좋아요 포함)
export async function getProduct(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const user = req.user;
  const product = await prisma.product.findUniqueOrThrow({
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
    return res.send(product);
  }
  const isLiked = product.likes?.length > 0;
  const { likes, ...productWithoutLikes } = product;
  return res.send({ ...productWithoutLikes, isLiked });
}
//상품 수정
export async function updateProduct(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const { name, description, price, tags, images } = create(req.body, UpdateProductBodyStruct);
  const user = req.user;
  const product = await prisma.product.findUniqueOrThrow({ where: { id } });
  if (product.userId !== user.id) {
    throw new UnauthorizedError();
  }
  const updatedProduct = await prisma.product.update({
    where: { id },
    data: { name, description, price, tags, images },
  });
  return res.send(updatedProduct);
}
//상품 삭제
export async function deleteProduct(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const user = req.user;
  const product = await prisma.product.findUniqueOrThrow({ where: { id } });
  if (product.userId !== user.id) {
    throw new UnauthorizedError();
  }
  await prisma.product.delete({ where: { id } });
  return res.status(204).send();
}
//상품 목록 조회(좋아요 포함)
export async function getProductList(req, res) {
  const { page, pageSize, orderBy, keyword } = create(req.query, GetProductListParamsStruct);
  const user = req.user;
  const where = keyword
    ? {
        OR: [
          { name: { contains: keyword } },
          { description: { contains: keyword } },
          { tags: { has: keyword } },
        ],
      }
    : undefined;
  const totalCount = await prisma.product.count({ where });
  const include = user
    ? {
        likes: {
          where: { userId: user.id },
          select: { id: true },
        },
      }
    : undefined;
  const products = await prisma.product.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { createdAt: 'asc' },
    where,
    include,
  });
  if (!user) {
    return res.send({ list: products, totalCount });
  }
  const productsWithIsLiked = products.map((m) => {
    const isLiked = m.likes?.length > 0;
    const { likes, ...productWithoutLikes } = m;
    return { ...productWithoutLikes, isLiked };
  });
  return res.send({
    list: productsWithIsLiked,
    totalCount,
  });
}
//댓글 등록
export async function createComment(req, res) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, CreateCommentBodyStruct);
  const user = req.user;
  await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  const comment = await prisma.comment.create({ data: { productId, content, userId: user.id } });
  return res.status(201).send(comment);
}
//상품 댓글 목록 조회
export async function getCommentList(req, res) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const { cursor, limit } = create(req.query, GetCommentListParamsStruct);

  const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
  if (!existingProduct) {
    throw new NotFoundError('product', productId);
  }

  const commentsWithCursorComment = await prisma.comment.findMany({
    cursor: cursor ? { id: cursor } : undefined,
    take: limit + 1,
    where: { productId },
  });
  const comments = commentsWithCursorComment.slice(0, limit);
  const cursorComment = commentsWithCursorComment[comments.length - 1];
  const nextCursor = cursorComment ? cursorComment.id : null;

  return res.send({
    list: comments,
    nextCursor,
  });
}
//상품 좋아요 등록
export async function likeProduct(req, res) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const user = req.user;
  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId,
      },
    },
  });
  if (existingLike) {
    return res.status(400).send({ message: '해당 상품에 이미 좋아요를 눌렀습니다.' });
  }
  await prisma.like.create({
    data: {
      userId: user.id,
      productId,
      articleId: null,
    },
  });
  return res.status(200).send({ message: `${product.name}상품에 좋아요를 눌렀습니다` });
}
//상품 좋아요 취소
export async function unlikeProduct(req, res) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const user = req.user;
  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  try {
    await prisma.like.delete({
      where: {
        //@@prisma 복합 unique key 사용, / 이로인해 한 상품, 게시물에 좋아요 중복 불가능 / ex) userId_poductId
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(400).send({ message: '해당 상품에 대한 좋아요가 존재하지 않습니다.' });
    }
    throw error;
  }
  return res.status(200).send({ message: `${product.name}상품의 좋아요를 취소했습니다` });
}
