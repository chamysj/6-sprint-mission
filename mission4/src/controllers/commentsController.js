import { create } from 'superstruct';
import { prisma } from '../lib/prismaClient.js';
import { UpdateCommentBodyStruct } from '../structs/commentsStruct.js';
import { UnauthorizedError } from '../lib/errors/customErrors.js';
import { IdParamsStruct } from '../structs/commonStructs.js';

//댓글 수정
export async function updateComment(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, UpdateCommentBodyStruct);
  const user = req.user;
  const comment = await prisma.comment.findUniqueOrThrow({ where: { id } });
  if (comment.userId !== user.id) {
    throw new UnauthorizedError();
  }
  const updatedComment = await prisma.comment.update({
    where: { id },
    data: { content },
  });
  return res.send(updatedComment);
}

//댓글 삭제
export async function deleteComment(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const user = req.user;
  const comment = await prisma.comment.findUniqueOrThrow({ where: { id } });
  if (comment.userId !== user.id) {
    throw new UnauthorizedError();
  }
  await prisma.comment.delete({ where: { id } });
  return res.status(204).send();
}
