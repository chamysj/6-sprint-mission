import * as s from 'superstruct';
import { PageParamsStruct } from './commonStructs.js';

const CoercedNumber = s.coerce(s.number(), s.union([s.string(), s.number()]), (value) =>
  Number(value),
);
const Integer = s.refine(CoercedNumber, 'Integer', (value) => Number.isInteger(value) && value > 0);

export const userIdStruct = s.object({
  userId: Integer,
});
//이메일: 기본적인 이메일 형식 체크, 닉네임: 영어 + 숫자 + 한글, 2~10글자, 비밀번호: 8~16글자
const email = s.refine(s.string(), 'Email', (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
const nickname = s.refine(s.string(), 'Nickname', (value) =>
  /^[A-Za-z0-9가-힣]{2,10}$/.test(value),
);
const password = s.refine(
  s.string(),
  'Password',
  (value) => value.length >= 8 && value.length <= 16,
);

export const CreateUserBodyStruct = s.object({
  nickname: nickname,
  email: email,
  password: password,
  image: s.optional(s.string()),
});

export const UpdateUserBodyStruct = s.partial(CreateUserBodyStruct);

export const LoginBodyStruct = s.object({
  email: email,
  password: password,
});

export const ChangePasswordBodyStruct = s.object({
  currentPassword: password,
  newPassword: password,
});

export const RefreshTokenBodyStruct = s.object({
  refreshToken: s.string(),
});

export const GetMyProductListParamsStruct = PageParamsStruct;

export const GetMyLikedProductListParamsStruct = PageParamsStruct;
