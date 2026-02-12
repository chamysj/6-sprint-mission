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
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.patchPassword = patchPassword;
exports.getMyProductList = getMyProductList;
exports.refreshToken = refreshToken;
exports.getMyLikedProducts = getMyLikedProducts;
const usersStructs_1 = require("../structs/usersStructs");
const superstruct_1 = require("superstruct");
const prismaClient_1 = require("../lib/prismaClient");
const cookies_1 = require("../lib/cookies");
const constants_1 = require("../lib/constants");
const customErrors_1 = require("../lib/errors/customErrors");
const userService_1 = require("../services/userService");
//회원가입
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { nickname, email, password, image } = (0, superstruct_1.create)(req.body, usersStructs_1.CreateUserBodyStruct);
        const user = yield userService_1.userService.register(nickname, email, password, image);
        return res.status(201).send(user);
    });
}
//로그인
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = (0, superstruct_1.create)(req.body, usersStructs_1.LoginBodyStruct);
        const result = yield userService_1.userService.login(email, password);
        (0, cookies_1.setTokenCookies)(res, result.tokens.accessToken, result.tokens.refreshToken);
        return res.status(200).send({ message: result.message });
    });
}
//로그아웃
function logout(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, cookies_1.clearTokenCookies)(res);
        return res.status(200).send({ message: '로그아웃에 성공했습니다.' });
    });
}
//내 프로필 조회 (최근 등록한 상품 5개, 최근 좋아요한 상품 5개 포함)
function getProfile(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        const profile = yield userService_1.userService.getProfile(user.id);
        return res.send(profile);
    });
}
//내 프로필 수정
function updateProfile(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { nickname, email, image } = (0, superstruct_1.create)(req.body, usersStructs_1.UpdateUserBodyStruct);
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        const update = yield userService_1.userService.updateProfile(user.id, nickname, email, image);
        return res.send(update);
    });
}
//내 비밀번호 변경
function patchPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { currentPassword, newPassword } = (0, superstruct_1.create)(req.body, usersStructs_1.ChangePasswordBodyStruct);
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        yield userService_1.userService.patchPassword(user.id, currentPassword, newPassword);
        return res.status(200).send({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    });
}
//내가 등록한 상품 목록 조회 (상품이 꽤 많이 있을 경우 페이징 처리, 키워드 검색 가능)
function getMyProductList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { page, pageSize, orderBy, keyword } = (0, superstruct_1.create)(req.query, usersStructs_1.GetMyProductListParamsStruct);
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        const myProducts = yield userService_1.userService.getMyProductList(user.id, page, pageSize, orderBy, keyword);
        return res.send(myProducts);
    });
}
//토큰 갱신(리프레시)
function refreshToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const refreshToken = req.cookies[constants_1.REFRESH_TOKEN_COOKIE_NAME];
        if (!refreshToken) {
            throw new customErrors_1.UnauthorizedError('리프레시 토큰이 없습니다.');
        }
        const tokens = yield userService_1.userService.refreshToken(refreshToken);
        (0, cookies_1.setTokenCookies)(res, tokens.accessToken, tokens.refreshToken);
        return res.status(200).send({ message: '토큰이 성공적으로 갱신되었습니다.' });
    });
}
//내가 좋아요한 상품 목록 조회(상품이 꽤 많이 있을 경우 페이징 처리)
function getMyLikedProducts(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { page, pageSize, orderBy } = (0, superstruct_1.create)(req.query, usersStructs_1.GetMyLikedProductListParamsStruct);
        const user = req.user;
        if (!user) {
            throw new customErrors_1.UnauthorizedError();
        }
        const where = {
            likes: {
                some: {
                    userId: user.id,
                },
            },
        };
        const totalCount = yield prismaClient_1.prisma.product.count({ where });
        const myLikedProducts = yield prismaClient_1.prisma.product.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { createdAt: 'asc' },
            where,
        });
        return res.send({ list: myLikedProducts, totalCount });
    });
}
