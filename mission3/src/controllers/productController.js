import { create } from 'superstruct';
import {
  CreateProductStruct,
  IdParamsStruct,
  PatchProductStruct,
} from '../structs/productStructs.js';
import { PrismaClient } from '@prisma/client';
import { CreateCommentStruct } from '../structs/commentStructs.js';

const prisma = new PrismaClient();

export async function validateCreateProduct(req, res) {
  const data = create(req.body, CreateProductStruct);
  const product = await prisma.product.create({ data });
  return res.status(201).send(product);
}

export async function validateGetProduct(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const product = await prisma.product.findUnique({ where: { id } });
  return res.send(product);
}

export async function validatePatchProduct(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const data = create(req.body, PatchProductStruct);
  await prisma.product.findUnique({ where: { id } });
  const updateProduct = await prisma.product.update({ where: { id }, data });
  return res.json({ message: '수정에 성공했습니다.', data: updateProduct });
}

export async function validateDeleteProduct(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const product = await prisma.product.findUnique({ where: { id } });
  return res.json({ message: '삭제에 성공했습니다.', data: product });
}

export async function validateGetProducts(req, res) {
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
          { name: { contains: findWord, mode: 'insensitive' } },
          { description: { contains: findWord, mode: 'insensitive' } },
        ],
      }
    : {};
  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip: parseInt(offset),
    take: parseInt(limit),
  });
  return res.send(products);
}

export async function validateCreateComment(req, res) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const { content, nickname } = create(req.body, CreateCommentStruct);
  const nick = String(nickname ?? '').trim();
  if (!nick) {
    return res.status(400).json({ message: 'nickname을 작성해주세요.' });
  }
  const anon = await prisma.nickname.upsert({
    where: { nickname: nick },
    update: {},
    create: { nickname: nick },
  });
  const productComment = await prisma.productComment.create({
    data: {
      content,
      product: { connect: { id: productId } },
      nickname: { connect: { id: anon.id } },
      nicknameText: anon.nickname,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      nickname: true,
      nicknameText: true,
    },
  });
  return res.status(201).json({ message: '댓글 등록에 성공했습니다.', data: productComment });
}

export async function getProductComments(req, res) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit ?? '10', 10)));
  const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
  const findOptions = {
    where: { productId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    select: {
      id: true,
      content: true,
      createdAt: true,
    },
  };
  if (cursor) {
    findOptions.cursor = { id: cursor };
    findOptions.skip = 1;
  }
  const rows = await prisma.productComment.findMany(findOptions);
  const hasMore = rows.length > limit;
  const results = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? results[results.length - 1].id : null;
  return res.json({ data: results, nextCursor, hasMore });
}
