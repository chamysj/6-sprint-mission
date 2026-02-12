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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.articleService = exports.ArticleService = void 0;
const articleRepository_1 = require("../repositories/articleRepository");
const customErrors_1 = require("../lib/errors/customErrors");
const commentRepository_1 = require("../repositories/commentRepository");
const likeRepository_1 = require("../repositories/likeRepository");
const client_1 = require("@prisma/client");
//객체로 주면 콘트롤러에서 인자순서 상관없이 적용되지만, ()형태로 반환하게되면 인자순서를 서비스형태와 동일하게 넣어야 함
class ArticleService {
    createArticle(userId, title, content, image) {
        return __awaiter(this, void 0, void 0, function* () {
            return articleRepository_1.articleRepo.create({
                title,
                content,
                image,
                user: { connect: { id: userId } },
            });
        });
    }
    getArticle(articleId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const article = yield articleRepository_1.articleRepo.findByIdWithLikes(articleId, userId);
            const { likes, _count } = article, articleData = __rest(article, ["likes", "_count"]);
            const isLiked = userId ? ((_a = likes === null || likes === void 0 ? void 0 : likes.length) !== null && _a !== void 0 ? _a : 0) > 0 : undefined;
            return Object.assign(Object.assign({}, articleData), { likeCount: _count.likes, isLiked });
        });
    }
    updateArticle(articleId, userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const article = yield articleRepository_1.articleRepo.findById(articleId);
            if (article.userId !== userId) {
                throw new customErrors_1.ForbiddenError('해당 게시글에 접근 권한이 없습니다.');
            }
            return articleRepository_1.articleRepo.update(articleId, data);
        });
    }
    deleteArticle(articleId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const article = yield articleRepository_1.articleRepo.findById(articleId);
            if (article.userId !== userId) {
                throw new customErrors_1.ForbiddenError('해당 게시글에 접근 권한이 없습니다.');
            }
            yield articleRepository_1.articleRepo.delete(articleId);
        });
    }
    getArticleList(page, pageSize, orderBy, keyword, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                title: keyword ? { contains: keyword } : undefined,
            };
            const [totalCount, articles] = yield Promise.all([
                articleRepository_1.articleRepo.count(where),
                articleRepository_1.articleRepo.findArticleListWithLikes({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { createdAt: 'asc' },
                    where,
                    userId,
                }),
            ]);
            const list = articles.map((m) => {
                const { _count, likes } = m, basicArticleData = __rest(m, ["_count", "likes"]);
                const response = Object.assign(Object.assign({}, basicArticleData), { likeCount: _count.likes });
                if (!userId) {
                    return response;
                }
                const isLiked = (likes !== null && likes !== void 0 ? likes : []).length > 0;
                return Object.assign(Object.assign({}, basicArticleData), { isLiked, likeCount: _count.likes });
            });
            const response = {
                list,
                totalCount,
            };
            return response;
        });
    }
    createComment(userId, articleId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            yield articleRepository_1.articleRepo.findById(articleId);
            return commentRepository_1.commentRepo.create({
                content,
                user: { connect: { id: userId } },
                article: { connect: { id: articleId } },
            });
        });
    }
    getCommentList(articleId, limit, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            yield articleRepository_1.articleRepo.findById(articleId);
            const commentsWithCursor = yield commentRepository_1.commentRepo.findCommentListQuery({ articleId }, limit, cursor);
            const comments = commentsWithCursor.slice(0, limit);
            const cursorComment = commentsWithCursor[commentsWithCursor.length - 1];
            const nextCursor = cursorComment ? cursorComment.id : null;
            return { list: comments, nextCursor };
        });
    }
    //like , unlike 둘다 message를 반환해버려서 이게..프로미스로 타입 설정하는 것이 의미가 있는지...로직 수정 생각해봐야할 듯
    likeArticle(userId, articleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const article = yield articleRepository_1.articleRepo.findById(articleId);
            const existingLike = yield likeRepository_1.likeRepo.findLike(userId, { articleId });
            if (existingLike) {
                throw new customErrors_1.AlreadyLikeError();
            }
            yield likeRepository_1.likeRepo.createLike(userId, { articleId });
            return { message: `${article.title}게시글에 좋아요를 눌렀습니다.` };
        });
    }
    unlikeArticle(userId, articleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const article = yield articleRepository_1.articleRepo.findById(articleId);
            try {
                yield likeRepository_1.likeRepo.deleteLike(userId, { articleId });
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                    throw new customErrors_1.AlreadyUnlikeError();
                }
                throw error;
            }
            return { message: `${article.title}게시글의 좋아요를 취소했습니다` };
        });
    }
}
exports.ArticleService = ArticleService;
exports.articleService = new ArticleService();
