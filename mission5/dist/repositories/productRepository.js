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
exports.productRepo = void 0;
const prismaClient_1 = require("../lib/prismaClient");
class ProductRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.prisma.product.create({ data });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.prisma.product.findUniqueOrThrow({ where: { id } });
        });
    }
    findByIdWithLikes(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.prisma.product.findUniqueOrThrow({
                where: { id },
                include: {
                    _count: { select: { likes: true } },
                    likes: {
                        where: { userId: userId !== null && userId !== void 0 ? userId : -1 },
                        select: { id: true },
                    },
                },
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.prisma.product.update({ where: { id }, data });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.prisma.product.delete({ where: { id } });
        });
    }
    findProductListWithLikes(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return prismaClient_1.prisma.product.findMany({
                skip: params.skip,
                take: params.take,
                orderBy: params.orderBy,
                where: params.where,
                include: {
                    _count: { select: { likes: true } },
                    likes: {
                        where: { userId: (_a = params.userId) !== null && _a !== void 0 ? _a : -1 },
                        select: { id: true },
                    },
                },
            });
        });
    }
    count(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.prisma.product.count({ where });
        });
    }
    findRecentProduct(userId, limit, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereCondition = type === 'myUploaded' ? { userId } : { likes: { some: { userId } } };
            return prismaClient_1.prisma.product.findMany({
                where: whereCondition,
                orderBy: { createdAt: 'desc' },
                take: limit,
            });
        });
    }
    findProductList(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return prismaClient_1.prisma.product.findMany({
                skip: params.skip,
                take: params.take,
                orderBy: params.orderBy,
                where: params.where,
                include: {
                    _count: { select: { likes: true } },
                    likes: {
                        where: { userId: (_a = params.userId) !== null && _a !== void 0 ? _a : -1 },
                        select: { id: true },
                    },
                },
            });
        });
    }
}
exports.productRepo = new ProductRepository();
