import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export class BaseError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends BaseError {
  constructor(message = '존재하지 않습니다') {
    super(message, 404);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = '인증이 필요합니다') {
    super(message, 401);
  }
}

export class BadRequestError extends BaseError {
  constructor(message = '잘못된 요청입니다') {
    super(message, 400);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = '비밀번호가 틀렸습니다') {
    super(message, 403);
  }
}

export class AlreadyLikeError extends ForbiddenError {
  constructor(message = '이미 좋아요를 눌렀습니다.') {
    super(message);
    this.name = new.target.name;
  }
}

export class AlreadyUnlikeError extends ForbiddenError {
  constructor(message = '좋아요가 존재하지 않습니다.') {
    super(message);
    this.name = new.target.name;
  }
}
