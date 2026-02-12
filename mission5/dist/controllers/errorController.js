"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultNotFoundHandler = defaultNotFoundHandler;
exports.globalErrorHandler = globalErrorHandler;
const superstruct_1 = require("superstruct");
const customErrors_1 = require("../lib/errors/customErrors");
const client_1 = require("@prisma/client");
const errorUtils_1 = require("../lib/errors/errorUtils");
//404 처리 미들웨어
function defaultNotFoundHandler(req, res, next) {
    return res.status(404).send({ message: '존재하지 않습니다' });
}
//전역 에러 처리 미들웨어(400,401,403,404,500)
function globalErrorHandler(err, req, res, next) {
    if (err instanceof superstruct_1.StructError || err instanceof customErrors_1.BadRequestError) {
        return res.status(400).send({ message: '잘못된 요청입니다' });
    }
    if ((0, errorUtils_1.isSyntaxJsonError)(err)) {
        return res.status(400).send({ message: '잘못된 요청입니다' });
    }
    if (err instanceof customErrors_1.UnauthorizedError) {
        return res.status(401).json({ message: err.message });
    }
    if (err instanceof customErrors_1.ForbiddenError) {
        return res.status(403).json({ message: err.message });
    }
    if (err instanceof customErrors_1.NotFoundError) {
        return res.status(404).send({ message: err.message });
    }
    //프리즈마 코드 에러, 그 외 known 에러 500처리
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
            return res.status(404).json({ message: '존재하지 않습니다' });
        }
        if (err.code === 'P2002') {
            return res.status(400).json({ message: '잘못된 요청입니다' });
        }
        return res.status(500).json({ message: '데이터 처리 중 오류가 발생했습니다' });
    }
    console.error(err);
    return res.status(500).send({ message: '데이터 처리 중 오류가 발생했습니다' });
}
