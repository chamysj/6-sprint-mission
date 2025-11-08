import { create } from 'superstruct';
import { PrismaClient } from '@prisma/client';
import { CommentIdStruct, PatchCommentStruct } from '../structs/commentStructs.js';

const prisma = new PrismaClient();

async function findCommentModel(id) {
  const article = await prisma.articleComment.findUnique({
    where: { id },
    select: { id: true },
  });
  if (article) return 'article';

  const product = await prisma.productComment.findUnique({
    where: { id },
    select: { id: true },
  });
  if (product) return 'product';

  return null;
}

export async function patchComment(req, res) {
  const { id } = create(req.params, CommentIdStruct);
  const { content } = create(req.body, PatchCommentStruct);
  const trimmed = String(content ?? '').trim();
  const model = await findCommentModel(id);
  const include = { nickname: { select: { nickname: true } } };
  const updated =
    model === 'article'
      ? await prisma.articleComment.update({ where: { id }, data: { content: trimmed }, include })
      : await prisma.productComment.update({ where: { id }, data: { content: trimmed }, include });
  const displayNickname = updated.nickname?.nickname ?? updated.nicknameText ?? null;

  return res.json({
    message: '수정됨',
    data: {
      id: updated.id,
      content: updated.content,
      nickname: displayNickname,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    },
  });
}

export async function deleteComment(req, res) {
  const { id } = create(req.params, CommentIdStruct);
  const model = await findCommentModel(id);
  const include = { nickname: { select: { nickname: true } } };
  const deleted =
    model === 'article'
      ? await prisma.articleComment.delete({ where: { id }, include })
      : await prisma.productComment.delete({ where: { id }, include });
  const displayNickname = deleted.nickname?.nickname ?? deleted.nicknameText ?? null;

  return res.json({
    message: '삭제됨',
    data: {
      id: deleted.id,
      content: deleted.content,
      nickname: displayNickname,
      createdAt: deleted.createdAt,
      updatedAt: deleted.updatedAt,
    },
  });
}
