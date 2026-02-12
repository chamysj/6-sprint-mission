"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlreadyUnlikeError = exports.AlreadyLikeError = exports.ForbiddenError = exports.BadRequestError = exports.UnauthorizedError = exports.NotFoundError = exports.BaseError = void 0;
class BaseError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = new.target.name;
        this.statusCode = statusCode;
    }
}
exports.BaseError = BaseError;
class NotFoundError extends BaseError {
    constructor(message = '존재하지 않습니다') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends BaseError {
    constructor(message = '인증이 필요합니다') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class BadRequestError extends BaseError {
    constructor(message = '잘못된 요청입니다') {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
class ForbiddenError extends BaseError {
    constructor(message = '비밀번호가 틀렸습니다') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class AlreadyLikeError extends ForbiddenError {
    constructor(message = '이미 좋아요를 눌렀습니다.') {
        super(message);
        this.name = new.target.name;
    }
}
exports.AlreadyLikeError = AlreadyLikeError;
class AlreadyUnlikeError extends ForbiddenError {
    constructor(message = '좋아요가 존재하지 않습니다.') {
        super(message);
        this.name = new.target.name;
    }
}
exports.AlreadyUnlikeError = AlreadyUnlikeError;
