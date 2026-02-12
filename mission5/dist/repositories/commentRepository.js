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
exports.commentRepo = exports.CommentRepository = void 0;
const prismaClient_1 = require("../lib/prismaClient");
class CommentRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.prisma.comment.create({ data });
        });
    }
    findCommentListQuery(whereCondition, limit, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.prisma.comment.findMany({
                cursor: cursor ? { id: cursor } : undefined,
                take: limit + 1,
                where: whereCondition,
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.prisma.comment.findUniqueOrThrow({ where: { id } });
        });
    }
    update(id, content) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.prisma.comment.update({ where: { id }, data: { content } });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.prisma.comment.delete({ where: { id } });
        });
    }
}
exports.CommentRepository = CommentRepository;
exports.commentRepo = new CommentRepository();
