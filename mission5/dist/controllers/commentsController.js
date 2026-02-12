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
exports.updateComment = updateComment;
exports.deleteComment = deleteComment;
const superstruct_1 = require("superstruct");
const commentsStruct_1 = require("../structs/commentsStruct");
const customErrors_1 = require("../lib/errors/customErrors");
const commonStructs_1 = require("../structs/commonStructs");
const commentService_1 = require("../services/commentService");
//댓글 수정
function updateComment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: commentId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
        const { content } = (0, superstruct_1.create)(req.body, commentsStruct_1.UpdateCommentBodyStruct);
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        const updatedComment = yield commentService_1.commnetService.updateComment(commentId, user.id, content);
        return res.send(updatedComment);
    });
}
//댓글 삭제
function deleteComment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: commentId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        yield commentService_1.commnetService.deleteComment(commentId, user.id);
        return res.status(204).send();
    });
}
