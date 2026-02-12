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
const prismaClient_1 = require("../lib/prismaClient");
const token_1 = require("../lib/token");
const constants_1 = require("../lib/constants");
const customErrors_1 = require("../lib/errors/customErrors");
function authenticate(options = { optional: false }) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const accessToken = req.cookies[constants_1.ACCESS_TOKEN_COOKIE_NAME];
        if (!accessToken) {
            if (options.optional) {
                return next();
            }
            return next(new customErrors_1.UnauthorizedError());
        }
        try {
            const { userId } = (0, token_1.verifyAccessToken)(accessToken); //디코딩 된 토큰에서 user id 추출
            const user = yield prismaClient_1.prisma.user.findUniqueOrThrow({ where: { id: userId } });
            req.user = user;
        }
        catch (error) {
            if (options.optional) {
                return next();
            }
            return next(new customErrors_1.UnauthorizedError());
        }
        next();
    });
}
exports.default = authenticate;
