import { commentRepo } from '../repositories/commentRepository';
import { ForbiddenError } from '../lib/errors/customErrors';
import { Comment } from '@prisma/client';

export class CommentService {
  async updateComment(commentId: number, userId: number, content?: string): Promise<Comment> {
    const comment = await commentRepo.findById(commentId);
    if (comment.userId !== userId) {
      throw new ForbiddenError('해당 댓글을 수정할 권한이 없습니다.');
    }
    return commentRepo.update(commentId, content);
  }
  async deleteComment(commentId: number, userId: number): Promise<void> {
    const comment = await commentRepo.findById(commentId);
    if (comment.userId !== userId) {
      throw new ForbiddenError('해당 댓글을 삭제할 권한이 없습니다.');
    }
    await commentRepo.delete(commentId);
  }
}

export const commnetService = new CommentService();
