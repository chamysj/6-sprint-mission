"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commnetService = exports.CommentService = void 0;
const commentRepository_1 = require("../repositories/commentRepository");
const customErrors_1 = require("../lib/errors/customErrors");
class CommentService {
    updateComment(commentId, userId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield commentRepository_1.commentRepo.findById(commentId);
            if (comment.userId !== userId) {
                throw new customErrors_1.ForbiddenError('해당 댓글을 수정할 권한이 없습니다.');
            }
            return commentRepository_1.commentRepo.update(commentId, content);
        });
    }
    deleteComment(commentId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield commentRepository_1.commentRepo.findById(commentId);
            if (comment.userId !== userId) {
                throw new customErrors_1.ForbiddenError('해당 댓글을 삭제할 권한이 없습니다.');
            }
            yield commentRepository_1.commentRepo.delete(commentId);
        });
    }
}
exports.CommentService = CommentService;
exports.commnetService = new CommentService();
