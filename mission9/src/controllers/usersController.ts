import {
  CreateUserBodyStruct,
  UpdateUserBodyStruct,
  LoginBodyStruct,
  ChangePasswordBodyStruct,
  GetMyProductListParamsStruct,
  GetMyLikedProductListParamsStruct,
} from '../structs/usersStructs';
import { create } from 'superstruct';
import { clearTokenCookies, setTokenCookies } from '../lib/cookies';
import { REFRESH_TOKEN_COOKIE_NAME } from '../lib/constants';
import { Request, Response } from 'express';
import { UnauthorizedError } from '../lib/errors/customErrors';
import { userService } from '../services/userService';

//회원가입
export async function register(req: Request, res: Response) {
  const { nickname, email, password, image } = create(req.body, CreateUserBodyStruct);
  const user = await userService.register(nickname, email, password, image);
  return res.status(201).send(user);
}
//로그인
export async function login(req: Request, res: Response) {
  const { email, password } = create(req.body, LoginBodyStruct);
  const result = await userService.login(email, password);
  setTokenCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
  return res.status(200).send({ message: result.message });
}
//로그아웃
export async function logout(req: Request, res: Response) {
  clearTokenCookies(res);
  return res.status(200).send({ message: '로그아웃에 성공했습니다.' });
}
//내 프로필 조회 (최근 등록한 상품 5개, 최근 좋아요한 상품 5개 포함)
export async function getProfile(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const profile = await userService.getProfile(user.id);
  return res.send(profile);
}
//내 프로필 수정
export async function updateProfile(req: Request, res: Response) {
  const { nickname, email, image } = create(req.body, UpdateUserBodyStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const update = await userService.updateProfile(user.id, nickname, email, image);
  return res.send(update);
}
//내 비밀번호 변경
export async function patchPassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = create(req.body, ChangePasswordBodyStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  await userService.patchPassword(user.id, currentPassword, newPassword);
  return res.status(200).send({ message: '비밀번호가 성공적으로 변경되었습니다.' });
}
//내가 등록한 상품 목록 조회 (상품이 꽤 많이 있을 경우 페이징 처리, 키워드 검색 가능)
export async function getMyProductList(req: Request, res: Response) {
  const { page, pageSize, orderBy, keyword } = create(req.query, GetMyProductListParamsStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const myProducts = await userService.getMyProductList(user.id, page, pageSize, orderBy, keyword);
  return res.send(myProducts);
}
//토큰 갱신(리프레시)
export async function refreshToken(req: Request, res: Response) {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
  if (!refreshToken) {
    throw new UnauthorizedError('리프레시 토큰이 없습니다.');
  }
  const tokens = await userService.refreshToken(refreshToken);
  setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
  return res.status(200).send({ message: '토큰이 성공적으로 갱신되었습니다.' });
}
//내가 좋아요한 상품 목록 조회(상품이 꽤 많이 있을 경우 페이징 처리)
export async function getMyLikedProducts(req: Request, res: Response) {
  const { page, pageSize, orderBy } = create(req.query, GetMyLikedProductListParamsStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const myLikedProducts = await userService.getMyLikedProducts(user.id, page, pageSize, orderBy);
  return res.send(myLikedProducts);
}
