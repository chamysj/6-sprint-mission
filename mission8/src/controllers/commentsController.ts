import { create } from 'superstruct';
import { UpdateCommentBodyStruct } from '../structs/commentsStruct';
import { UnauthorizedError } from '../lib/errors/customErrors';
import { IdParamsStruct } from '../structs/commonStructs';
import { Request, Response } from 'express';
import { commnetService } from '../services/commentService';

//댓글 수정
export async function updateComment(req: Request, res: Response) {
  const { id: commentId } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, UpdateCommentBodyStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const updatedComment = await commnetService.updateComment(commentId, user.id, content);
  return res.send(updatedComment);
}

//댓글 삭제
export async function deleteComment(req: Request, res: Response) {
  const { id: commentId } = create(req.params, IdParamsStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  await commnetService.deleteComment(commentId, user.id);
  return res.status(204).send();
}
