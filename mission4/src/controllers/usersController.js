import {
  CreateUserBodyStruct,
  UpdateUserBodyStruct,
  LoginBodyStruct,
  ChangePasswordBodyStruct,
  GetMyProductListParamsStruct,
  GetMyLikedProductListParamsStruct,
} from '../structs/usersStructs.js';
import bcrypt from 'bcrypt';
import { create } from 'superstruct';
import { prisma } from '../lib/prismaClient.js';
import { generateToken, verifyRefreshToken } from '../lib/token.js';
import { clearTokenCookies, setTokenCookies } from '../lib/cookies.js';
import { REFRESH_TOKEN_COOKIE_NAME } from '../lib/constants.js';

//회원가입
export async function register(req, res) {
  const { nickname, email, password, image } = create(req.body, CreateUserBodyStruct);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await prisma.user.create({
    data: { nickname, email, password: hashedPassword, image },
  });
  const { password: _, ...userWithoutPassword } = user;
  return res.status(201).send(userWithoutPassword);
}
//로그인
export async function login(req, res) {
  const { email, password } = create(req.body, LoginBodyStruct);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).send({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).send({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
  }
  const { accessToken, refreshToken } = generateToken(user.id);
  setTokenCookies(res, accessToken, refreshToken);
  return res.status(200).send({ message: '로그인에 성공했습니다.' });
}
//로그아웃
export async function logout(req, res) {
  clearTokenCookies(res);
  return res.status(200).send({ message: '로그아웃에 성공했습니다.' });
}
//내 프로필 조회 (최근 등록한 상품 5개, 최근 좋아요한 상품 5개 포함)
export async function getProfile(req, res) {
  const user = req.user;
  const { password: _, ...userWithoutPassword } = user;
  const [myProducts, likeProducts] = await Promise.all([
    prisma.product.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.product.findMany({
      where: {
        likes: {
          some: {
            userId: user.id,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);
  return res.status(200).send({
    user: userWithoutPassword,
    myRecentProducts: myProducts,
    myRecentLikeProducts: likeProducts,
  });
}
//내 프로필 수정
export async function updateProfile(req, res) {
  const { nickname, email, image } = create(req.body, UpdateUserBodyStruct);
  const user = req.user;
  //undefined 값은 덮어쓰지 않도록 처리
  const data = {};
  if (nickname) data.nickname = nickname;
  if (email) data.email = email;
  if (image) data.image = image;
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data,
  });
  const { password: _, ...userWithoutPassword } = updatedUser;
  return res.status(200).send(userWithoutPassword);
}
//내 비밀번호 변경
export async function patchPassword(req, res) {
  const { currentPassword, newPassword } = create(req.body, ChangePasswordBodyStruct);
  const user = req.user;
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    return res.status(401).send({ message: '현재 비밀번호가 올바르지 않습니다.' });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedNewPassword = await bcrypt.hash(newPassword, salt);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNewPassword },
  });
  return res.status(200).send({ message: '비밀번호가 성공적으로 변경되었습니다.' });
}
//내가 등록한 상품 목록 조회 (상품이 꽤 많이 있을 경우 페이징 처리, 키워드 검색 가능)
export async function getMyProductList(req, res) {
  const { page, pageSize, orderBy, keyword } = create(req.query, GetMyProductListParamsStruct);
  const user = req.user;
  //프리즈마 where 객체를 만들기 위한 키워드 조건(삼항연산자) / (키워드 있으면 스프레드로 펼쳐서 추가, 없으면 undefined로 무시)
  const whereKeyword = keyword
    ? {
        OR: [
          { name: { contains: keyword } },
          { description: { contains: keyword } },
          { tags: { has: keyword } }, //태그는 배열이므로 has 사용
        ],
      }
    : undefined;
  const totalCount = await prisma.product.count({ where: { userId: user.id, ...whereKeyword } });
  const myProducts = await prisma.product.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { createdAt: 'asc' },
    where: { userId: user.id, ...whereKeyword },
  });
  return res.send({
    list: myProducts,
    totalCount,
  });
}
//토큰 갱신(리프레시)
export async function refreshToken(req, res) {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
  if (!refreshToken) {
    return res.status(401).send({ message: '리프레시 토큰이 없습니다.' });
  }
  try {
    const { userId } = verifyRefreshToken(refreshToken);
    const { accessToken: accessToken, refreshToken: newRefreshToken } = generateToken(userId);
    setTokenCookies(res, accessToken, newRefreshToken);
    return res.status(200).send({ message: '토큰이 성공적으로 갱신되었습니다.' });
  } catch (error) {
    return res.status(401).send({ message: '유효하지 않은 리프레시 토큰입니다.' });
  }
}
//내가 좋아요한 상품 목록 조회(상품이 꽤 많이 있을 경우 페이징 처리)
export async function getMyLikedProducts(req, res) {
  const { page, pageSize, orderBy } = create(req.query, GetMyLikedProductListParamsStruct);
  const user = req.user;
  const where = {
    likes: {
      some: {
        userId: user.id,
      },
    },
  };
  const totalCount = await prisma.product.count({ where });
  const myLikedProducts = await prisma.product.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { createdAt: 'asc' },
    where,
  });
  return res.send({ list: myLikedProducts, totalCount });
}
