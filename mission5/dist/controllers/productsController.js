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
exports.createProduct = createProduct;
exports.getProduct = getProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.getProductList = getProductList;
exports.createComment = createComment;
exports.getCommentList = getCommentList;
exports.likeProduct = likeProduct;
exports.unlikeProduct = unlikeProduct;
const superstruct_1 = require("superstruct");
const commonStructs_1 = require("../structs/commonStructs");
const productsStruct_1 = require("../structs/productsStruct");
const commentsStruct_1 = require("../structs/commentsStruct");
const customErrors_1 = require("../lib/errors/customErrors");
const productService_1 = require("../services/productService");
//상품 등록
function createProduct(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, description, price, tags, images } = (0, superstruct_1.create)(req.body, productsStruct_1.CreateProductBodyStruct);
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        const product = yield productService_1.productService.createProduct({
            name,
            description,
            price,
            tags,
            images,
            userId: user.id,
        });
        return res.status(201).send(product);
    });
}
//특정 상품 조회(좋아요 포함)
function getProduct(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: productId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
        const user = req.user;
        const product = yield productService_1.productService.getProduct(productId, user === null || user === void 0 ? void 0 : user.id);
        return res.send(product);
    });
}
//상품 수정
function updateProduct(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: productId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
        const data = (0, superstruct_1.create)(req.body, productsStruct_1.UpdateProductBodyStruct);
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        const updatedProduct = yield productService_1.productService.updateProduct(productId, user.id, data);
        return res.send(updatedProduct);
    });
}
//상품 삭제
function deleteProduct(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: productId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        yield productService_1.productService.deleteProduct(productId, user.id);
        return res.status(204).send();
    });
}
//상품 목록 조회(좋아요 포함)
function getProductList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { page, pageSize, orderBy, keyword } = (0, superstruct_1.create)(req.query, productsStruct_1.GetProductListParamsStruct);
        const user = req.user;
        const products = yield productService_1.productService.getProductList(page, pageSize, orderBy, keyword, user === null || user === void 0 ? void 0 : user.id);
        return res.send(products);
    });
}
//댓글 등록
function createComment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: productId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
        const { content } = (0, superstruct_1.create)(req.body, commentsStruct_1.CreateCommentBodyStruct);
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        const comment = yield productService_1.productService.createComment(user.id, productId, content);
        return res.status(201).send(comment);
    });
}
//상품 댓글 목록 조회
function getCommentList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: productId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
        const { cursor, limit } = (0, superstruct_1.create)(req.query, commentsStruct_1.GetCommentListParamsStruct);
        const commentList = yield productService_1.productService.getCommentList(productId, limit, cursor);
        return res.send(commentList);
    });
}
//상품 좋아요 등록
function likeProduct(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: productId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        const productLike = yield productService_1.productService.likeProduct(user.id, productId);
        return res.status(200).send(productLike);
    });
}
//상품 좋아요 취소
function unlikeProduct(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: productId } = (0, superstruct_1.create)(req.params, commonStructs_1.IdParamsStruct);
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        const productUnliked = yield productService_1.productService.unlikeProduct(user.id, productId);
        return res.send(productUnliked);
    });
}
