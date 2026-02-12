import bcrypt from 'bcrypt';
import { userRepo } from '../repositories/userRepository';
import type { Prisma, User } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../lib/errors/customErrors';
import { generateToken, verifyRefreshToken } from '../lib/token';
import { productRepo } from '../repositories/productRepository';
import type { ProductListResponse } from '../../types/product';
import { ProfileResponse } from '../../types/user';

class UserService {
  async register(
    nickname: string,
    email: string,
    password: string,
    image?: string,
  ): Promise<Omit<User, 'password'>> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await userRepo.create({
      nickname,
      email,
      password: hashedPassword,
      image,
    });
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  async login(
    email: string,
    password: string,
  ): Promise<{ tokens: { accessToken: string; refreshToken: string }; message: string }> {
    const user = await userRepo.findByEmail(email);
    if (!user) {
      //이메일, 비밀번호 검증에 대한 에러를 같은 메세지로 던짐으로써 좀 더 방어적으로 설계
      throw new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    const tokens = generateToken(user.id);
    return { tokens, message: '로그인에 성공했습니다.' };
  }
  async getProfile(myId: number): Promise<ProfileResponse> {
    const user = await userRepo.findById(myId);
    if (!user) throw new UnauthorizedError('사용자를 찾을 수 없습니다.');
    const { password: _, ...userInfo } = user;
    const [myProductCount, myLikeProductCount, recentProductsRaw, recentLikedProductsRaw] =
      await Promise.all([
        productRepo.count({ userId: myId }),
        productRepo.count({ likes: { some: { userId: myId } } }),
        productRepo.findProductListWithLikes({
          skip: 0,
          take: 5,
          orderBy: { createdAt: 'desc' },
          where: { userId: myId },
          userId: myId,
        }),
        productRepo.findProductListWithLikes({
          skip: 0,
          take: 5,
          orderBy: { createdAt: 'desc' },
          where: { likes: { some: { userId: myId } } },
          userId: myId,
        }),
      ]);
    const myRecentProducts = recentProductsRaw.map((m) => {
      const { _count, likes, ...rest } = m;
      return {
        ...rest,
        likeCount: _count.likes,
        isLiked: (likes?.length ?? 0) > 0,
      };
    });
    const myRecentLikeProducts = recentLikedProductsRaw.map((m) => {
      const { _count, likes, ...rest } = m;
      return {
        ...rest,
        likeCount: _count.likes,
        isLiked: (likes?.length ?? 0) > 0,
      };
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
  }

  async updateProfile(
    userId: number,
    nickname?: string,
    email?: string,
    image?: string | null,
  ): Promise<Omit<User, 'password'>> {
    const data: Prisma.UserUpdateInput = {};
    if (nickname !== undefined) data.nickname = nickname;
    if (email !== undefined) data.email = email;
    if (image !== undefined) data.image = image;
    const update = await userRepo.update(userId, data);
    const { password: _, ...userWithoutPassword } = update;
    return userWithoutPassword;
  }
  async patchPassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedError('사용자를 찾을 수 없습니다.');
    }
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new ForbiddenError('현재 비밀번호가 올바르지 않습니다.');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    await userRepo.update(userId, { password: hashedNewPassword });
  }
  async getMyProductList(
    myId: number,
    page: number,
    pageSize: number,
    orderBy?: 'recent' | 'desc' | 'asc',
    keyword?: string,
  ): Promise<ProductListResponse> {
    const where = {
      userId: myId,
      ...(keyword
        ? {
            OR: [
              { name: { contains: keyword } },
              { description: { contains: keyword } },
              { tags: { has: keyword } },
            ],
          }
        : {}),
    };
    const [totalCount, productsRaw] = await Promise.all([
      productRepo.count(where),
      productRepo.findProductListWithLikes({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { createdAt: 'asc' },
        where,
        userId: myId,
      }),
    ]);
    const list = productsRaw.map((m) => {
      const { _count, likes, ...rest } = m;
      return {
        ...rest,
        likeCount: _count.likes,
        isLiked: (likes?.length ?? 0) > 0,
      };
    });
    return { list, totalCount };
  }
  async refreshToken(refreshToken: string) {
    let userId: number;
    try {
      const payload = verifyRefreshToken(refreshToken);
      userId = payload.userId;
    } catch (error) {
      throw new UnauthorizedError('유효하지 않은 리프레시 토큰입니다.');
    }
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedError('존재하지 않는 사용자입니다.');
    }
    const tokens = generateToken(user.id);
    return tokens;
  }
  async getMyLikedProducts(
    myId: number,
    page: number,
    pageSize: number,
    orderBy?: 'recent' | 'desc' | 'asc',
  ): Promise<ProductListResponse> {
    const where = {
      likes: {
        some: {
          userId: myId,
        },
      },
    };
    const [totalCount, productsRaw] = await Promise.all([
      productRepo.count(where),
      productRepo.findProductListWithLikes({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { createdAt: 'asc' },
        where,
        userId: myId,
      }),
    ]);
    const list = productsRaw.map((m) => {
      const { _count, likes, ...rest } = m;
      return {
        ...rest,
        likeCount: _count.likes,
        isLiked: (likes?.length ?? 0) > 0,
      };
    });
    return { list, totalCount };
  }
}

export const userService = new UserService();
