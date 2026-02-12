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
exports.productService = exports.ProductService = void 0;
const productRepository_1 = require("../repositories/productRepository");
const customErrors_1 = require("../lib/errors/customErrors");
const commentRepository_1 = require("../repositories/commentRepository");
const customErrors_2 = require("../lib/errors/customErrors");
const likeRepository_1 = require("../repositories/likeRepository");
const client_1 = require("@prisma/client");
//인자 순서가 옵셔널 다음 필수파라미터가 들어오면 컴파일에러가 발생함
//객체로 묶어 보내기, 이러면 필수인 userid의 파라미터 순서를 바꾸지 않아도 됨
class ProductService {
    createProduct(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, description, price, tags, images, userId } = params;
            return productRepository_1.productRepo.create({
                name,
                description,
                price,
                tags: tags !== null && tags !== void 0 ? tags : [],
                images: images !== null && images !== void 0 ? images : [],
                user: { connect: { id: userId } },
            });
        });
    }
    getProduct(productId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const product = yield productRepository_1.productRepo.findByIdWithLikes(productId, userId);
            const { likes, _count } = product, productData = __rest(product, ["likes", "_count"]);
            const isLiked = userId ? ((_a = likes === null || likes === void 0 ? void 0 : likes.length) !== null && _a !== void 0 ? _a : 0) > 0 : undefined;
            return Object.assign(Object.assign({}, productData), { likeCount: _count.likes, isLiked });
        });
    }
    updateProduct(productId, userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield productRepository_1.productRepo.findById(productId);
            if (product.userId !== userId) {
                throw new customErrors_1.ForbiddenError('해당 상품에 접근 권한이 없습니다.');
            }
            return productRepository_1.productRepo.update(productId, data);
        });
    }
    deleteProduct(productId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield productRepository_1.productRepo.findById(productId);
            if (product.userId !== userId) {
                throw new customErrors_1.ForbiddenError('해당 상품에 접근 권한이 없습니다.');
            }
            yield productRepository_1.productRepo.delete(productId);
        });
    }
    getProductList(page, pageSize, orderBy, keyword, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = keyword
                ? {
                    OR: [
                        { name: { contains: keyword } },
                        { description: { contains: keyword } },
                        { tags: { has: keyword } },
                    ],
                }
                : {};
            const [totalCount, products] = yield Promise.all([
                productRepository_1.productRepo.count(where),
                productRepository_1.productRepo.findProductListWithLikes({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { createdAt: 'asc' },
                    where,
                    userId,
                }),
            ]);
            const list = products.map((m) => {
                const { _count, likes } = m, basicProductData = __rest(m, ["_count", "likes"]);
                const response = Object.assign(Object.assign({}, basicProductData), { likeCount: _count.likes });
                if (!userId) {
                    return response;
                }
                const isLiked = (likes !== null && likes !== void 0 ? likes : []).length > 0;
                return Object.assign(Object.assign({}, basicProductData), { isLiked, likeCount: _count.likes });
            });
            const response = {
                list,
                totalCount,
            };
            return response;
        });
    }
    createComment(userId, productId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            yield productRepository_1.productRepo.findById(productId);
            return commentRepository_1.commentRepo.create({
                content,
                user: { connect: { id: userId } },
                product: { connect: { id: productId } },
            });
        });
    }
    getCommentList(productId, limit, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            yield productRepository_1.productRepo.findById(productId);
            const commentsWithCursor = yield commentRepository_1.commentRepo.findCommentListQuery({ productId }, limit, cursor);
            const comments = commentsWithCursor.slice(0, limit);
            const cursorComment = commentsWithCursor[commentsWithCursor.length - 1];
            const nextCursor = cursorComment ? cursorComment.id : null;
            return { list: comments, nextCursor };
        });
    }
    likeProduct(userId, productId) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield productRepository_1.productRepo.findById(productId);
            const existingLike = yield likeRepository_1.likeRepo.findLike(userId, { productId });
            if (existingLike) {
                throw new customErrors_2.AlreadyLikeError();
            }
            yield likeRepository_1.likeRepo.createLike(userId, { productId });
            return { message: `${product.name}상품에 좋아요를 눌렀습니다.` };
        });
    }
    unlikeProduct(userId, productId) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield productRepository_1.productRepo.findById(productId);
            try {
                yield likeRepository_1.likeRepo.deleteLike(userId, { productId });
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                    throw new customErrors_2.AlreadyUnlikeError();
                }
                throw error;
            }
            return { message: `${product.name}상품의 좋아요를 취소했습니다` };
        });
    }
}
exports.ProductService = ProductService;
exports.productService = new ProductService();
