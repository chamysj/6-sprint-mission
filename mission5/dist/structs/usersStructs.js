"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMyLikedProductListParamsStruct = exports.GetMyProductListParamsStruct = exports.RefreshTokenBodyStruct = exports.ChangePasswordBodyStruct = exports.LoginBodyStruct = exports.UpdateUserBodyStruct = exports.CreateUserBodyStruct = exports.userIdStruct = void 0;
const s = __importStar(require("superstruct"));
const commonStructs_1 = require("./commonStructs");
const CoercedNumber = s.coerce(s.number(), s.union([s.string(), s.number()]), (value) => Number(value));
const Integer = s.refine(CoercedNumber, 'Integer', (value) => Number.isInteger(value) && value > 0);
exports.userIdStruct = s.object({
    userId: Integer,
});
//이메일: 기본적인 이메일 형식 체크, 닉네임: 영어 + 숫자 + 한글, 2~10글자, 비밀번호: 8~16글자
const email = s.refine(s.string(), 'Email', (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
const nickname = s.refine(s.string(), 'Nickname', (value) => /^[A-Za-z0-9가-힣]{2,10}$/.test(value));
const password = s.refine(s.string(), 'Password', (value) => value.length >= 8 && value.length <= 16);
exports.CreateUserBodyStruct = s.object({
    nickname: nickname,
    email: email,
    password: password,
    image: s.optional(s.string()),
});
exports.UpdateUserBodyStruct = s.partial(exports.CreateUserBodyStruct);
exports.LoginBodyStruct = s.object({
    email: email,
    password: password,
});
exports.ChangePasswordBodyStruct = s.object({
    currentPassword: password,
    newPassword: password,
});
exports.RefreshTokenBodyStruct = s.object({
    refreshToken: s.string(),
});
exports.GetMyProductListParamsStruct = commonStructs_1.PageParamsStruct;
exports.GetMyLikedProductListParamsStruct = commonStructs_1.PageParamsStruct;
