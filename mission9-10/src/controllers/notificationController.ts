import { Request, Response } from 'express';
import { UnauthorizedError } from '../lib/errors/customErrors';
import { notificationService } from '../services/notificationService';
import { IdParamsStruct } from '../structs/commonStructs';
import { create } from 'superstruct';

export async function getNotifications(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const notifications = await notificationService.getNotifications(user.id);
  return res.send(notifications);
}

export async function getUnreadCount(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const count = await notificationService.getUnreadCount(user.id);
  return res.send({ count });
}

export async function markAsRead(req: Request, res: Response) {
  const { id: notificationId } = create(req.params, IdParamsStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const notification = await notificationService.markAsRead(notificationId, user.id);
  return res.send(notification);
}
