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
exports.likeRepo = void 0;
const prismaClient_1 = require("../lib/prismaClient");
class LikdeRepository {
    findLike(userId, target) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereCondition = 'articleId' in target
                ? { userId_articleId: { userId, articleId: target.articleId } }
                : { userId_productId: { userId, productId: target.productId } };
            return prismaClient_1.prisma.like.findUnique({
                where: whereCondition,
            });
        });
    }
    createLike(userId, target) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.prisma.like.create({ data: Object.assign({ userId }, target) });
        });
    }
    deleteLike(userId, target) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereCondition = 'articleId' in target
                ? { userId_articleId: { userId, articleId: target.articleId } }
                : { userId_productId: { userId, productId: target.productId } };
            return prismaClient_1.prisma.like.delete({
                where: whereCondition,
            });
        });
    }
}
exports.likeRepo = new LikdeRepository();
