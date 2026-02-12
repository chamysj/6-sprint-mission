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
exports.createArticle = createArticle;
exports.getArticle = getArticle;
exports.updateArticle = updateArticle;
exports.deleteArticle = deleteArticle;
exports.getArticleList = getArticleList;
exports.createComment = createComment;
exports.getCommentList = getCommentList;
exports.likeArticle = likeArticle;
exports.unlikeArticle = unlikeArticle;
const superstruct_1 = require("superstruct");
const customErrors_1 = require("../lib/errors/customErrors");
const commonStructs_1 = require("../structs/commonStructs");
const articlesStructs_1 = require("../structs/articlesStructs");
const commentsStruct_1 = require("../structs/commentsStruct");
const articleService_1 = require("../services/articleService");
//게시물 생성
function createArticle(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { title, content, image } = (0, superstruct_1.create)(req.body, articlesStructs_1.CreateArticleBodyStruct);
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        const article = yield articleService_1.articleService.createArticle(user.id, title, content, image);
        return res.status(201).send(article);
    });
}
// 게시글 조회(좋아요 포함)
function getArticle(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
        const user = req.user;
        const article = yield articleService_1.articleService.getArticle(id, user === null || user === void 0 ? void 0 : user.id);
        return res.send(article);
    });
}
//게시물 수정
function updateArticle(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
        const data = (0, superstruct_1.create)(req.body, articlesStructs_1.UpdateArticleBodyStruct);
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        const updated = yield articleService_1.articleService.updateArticle(id, user.id, data);
        return res.send(updated);
    });
}
//게시물 삭제
function deleteArticle(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        yield articleService_1.articleService.deleteArticle(id, user.id);
        return res.status(204).send();
    });
}
//게시글 목록 조회(좋아요 포함)
function getArticleList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { page, pageSize, orderBy, keyword } = (0, superstruct_1.create)(req.query, articlesStructs_1.GetArticleListParamsStruct);
        const user = req.user;
        const articles = yield articleService_1.articleService.getArticleList(page, pageSize, orderBy, keyword, user === null || user === void 0 ? void 0 : user.id);
        return res.send(articles);
    });
}
//댓글 등록
function createComment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: articleId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
        const { content } = (0, superstruct_1.create)(req.body, commentsStruct_1.CreateCommentBodyStruct);
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        const comment = yield articleService_1.articleService.createComment(user.id, articleId, content);
        return res.status(201).send(comment);
    });
}
//댓글 목록 조회
function getCommentList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: articleId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
        const { cursor, limit } = (0, superstruct_1.create)(req.query, commentsStruct_1.GetCommentListParamsStruct);
        const commnetsList = yield articleService_1.articleService.getCommentList(articleId, limit, cursor);
        return res.send(commnetsList);
    });
}
//게시글 좋아요 등록
function likeArticle(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: articleId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        const articleLike = yield articleService_1.articleService.likeArticle(user.id, articleId);
        return res.status(200).send(articleLike);
    });
}
//게시글 좋아요 취소
function unlikeArticle(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: articleId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        const articleUnlike = yield articleService_1.articleService.unlikeArticle(user.id, articleId);
        return res.status(200).send(articleUnlike);
    });
}
