import type { Request, Response, NextFunction, RequestHandler } from 'express';

export function withAsync<T = unknown>(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<T>,
): RequestHandler {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      next(e);
    }
  };
}
