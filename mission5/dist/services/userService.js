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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const userRepository_1 = require("../repositories/userRepository");
const customErrors_1 = require("../lib/errors/customErrors");
const token_1 = require("../lib/token");
const productRepository_1 = require("../repositories/productRepository");
class UserService {
    register(nickname, email, password, image) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashedPassword = yield bcrypt_1.default.hash(password, salt);
            const user = yield userRepository_1.userRepo.create({
                nickname,
                email,
                password: hashedPassword,
                image,
            });
            const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
            return userWithoutPassword;
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository_1.userRepo.findByEmail(email);
            if (!user) {
                //이메일, 비밀번호 검증에 대한 에러를 같은 메세지로 던짐으로써 좀 더 방어적으로 설계
                throw new customErrors_1.UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다.');
            }
            const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                throw new customErrors_1.UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다.');
            }
            const tokens = (0, token_1.generateToken)(user.id);
            return { tokens, message: '로그인에 성공했습니다.' };
        });
    }
    getProfile(myId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository_1.userRepo.findById(myId);
            if (!user)
                throw new customErrors_1.UnauthorizedError('사용자를 찾을 수 없습니다.');
            const { password: _ } = user, userInfo = __rest(user, ["password"]);
            const [myProductCount, myLikeProductCount, recentProductsRaw, recentLikedProductsRaw] = yield Promise.all([
                productRepository_1.productRepo.count({ userId: myId }),
                productRepository_1.productRepo.count({ likes: { some: { userId: myId } } }),
                productRepository_1.productRepo.findProductListWithLikes({
                    skip: 0,
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    where: { userId: myId },
                    userId: myId,
                }),
                productRepository_1.productRepo.findProductListWithLikes({
                    skip: 0,
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    where: { likes: { some: { userId: myId } } },
                    userId: myId,
                }),
            ]);
            const myRecentProducts = recentProductsRaw.map((m) => {
                var _a;
                const { _count, likes } = m, rest = __rest(m, ["_count", "likes"]);
                return Object.assign(Object.assign({}, rest), { likeCount: _count.likes, isLiked: ((_a = likes === null || likes === void 0 ? void 0 : likes.length) !== null && _a !== void 0 ? _a : 0) > 0 });
            });
            const myRecentLikeProducts = recentLikedProductsRaw.map((m) => {
                var _a;
                const { _count, likes } = m, rest = __rest(m, ["_count", "likes"]);
                return Object.assign(Object.assign({}, rest), { likeCount: _count.likes, isLiked: ((_a = likes === null || likes === void 0 ? void 0 : likes.length) !== null && _a !== void 0 ? _a : 0) > 0 });
            });
            return {
                user: userInfo,
                myProducts: {
                    list: myRecentProducts,
                    totalCount: myProductCount,
                },
                myLikedProducts: {
                    list: myRecentLikeProducts,
                    totalCount: myLikeProductCount,
                },
            };
        });
    }
    updateProfile(userId, nickname, email, image) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {};
            if (nickname !== undefined)
                data.nickname = nickname;
            if (email !== undefined)
                data.email = email;
            if (image !== undefined)
                data.image = image;
            const update = yield userRepository_1.userRepo.update(userId, data);
            const { password: _ } = update, userWithoutPassword = __rest(update, ["password"]);
            return userWithoutPassword;
        });
    }
    patchPassword(userId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository_1.userRepo.findById(userId);
            if (!user) {
                throw new customErrors_1.UnauthorizedError('사용자를 찾을 수 없습니다.');
            }
            const isPasswordValid = yield bcrypt_1.default.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                throw new customErrors_1.ForbiddenError('현재 비밀번호가 올바르지 않습니다.');
            }
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashedNewPassword = yield bcrypt_1.default.hash(newPassword, salt);
            yield userRepository_1.userRepo.update(userId, { password: hashedNewPassword });
        });
    }
    getMyProductList(myId, page, pageSize, orderBy, keyword) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = Object.assign({ userId: myId }, (keyword
                ? {
                    OR: [
                        { name: { contains: keyword } },
                        { description: { contains: keyword } },
                        { tags: { has: keyword } },
                    ],
                }
                : {}));
            const [totalCount, productsRaw] = yield Promise.all([
                productRepository_1.productRepo.count(where),
                productRepository_1.productRepo.findProductListWithLikes({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { createdAt: 'asc' },
                    where,
                    userId: myId,
                }),
            ]);
            const list = productsRaw.map((m) => {
                var _a;
                const { _count, likes } = m, rest = __rest(m, ["_count", "likes"]);
                return Object.assign(Object.assign({}, rest), { likeCount: _count.likes, isLiked: ((_a = likes === null || likes === void 0 ? void 0 : likes.length) !== null && _a !== void 0 ? _a : 0) > 0 });
            });
            return { list, totalCount };
        });
    }
    refreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId;
            try {
                const payload = (0, token_1.verifyRefreshToken)(refreshToken);
                userId = payload.userId;
            }
            catch (error) {
                throw new customErrors_1.UnauthorizedError('유효하지 않은 리프레시 토큰입니다.');
            }
            const user = yield userRepository_1.userRepo.findById(userId);
            if (!user) {
                throw new customErrors_1.UnauthorizedError('존재하지 않는 사용자입니다.');
            }
            const tokens = (0, token_1.generateToken)(user.id);
            return tokens;
        });
    }
}
exports.userService = new UserService();
