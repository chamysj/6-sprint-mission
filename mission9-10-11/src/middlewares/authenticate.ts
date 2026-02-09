import { prisma } from '../lib/prismaClient';
import { verifyAccessToken } from '../lib/token';
import { ACCESS_TOKEN_COOKIE_NAME } from '../lib/constants';
import { UnauthorizedError } from '../lib/errors/customErrors';
import { NextFunction, Request, Response } from 'express';

function authenticate(options = { optional: false }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies[ACCESS_TOKEN_COOKIE_NAME];
    if (!accessToken) {
      if (options.optional) {
        return next();
      }
      return next(new UnauthorizedError());
    }
    try {
      const { userId } = verifyAccessToken(accessToken); //디코딩 된 토큰에서 user id 추출
      const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
      req.user = user;
    } catch (error) {
      if (options.optional) {
        return next();
      }
      return next(new UnauthorizedError());
    }
    next();
  };
}

export default authenticate;
