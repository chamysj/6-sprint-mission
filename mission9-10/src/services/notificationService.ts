import { UnauthorizedError } from '../lib/errors/customErrors';
import { notificationRepo } from '../repositories/notificationRepository';
import { getIO } from '../socket';
import type { Notification as PrismaNotification } from '@prisma/client';

export class NotificationService {
  async getNotifications(userId: number): Promise<PrismaNotification[]> {
    return notificationRepo.getNotification(userId);
  }
  async getUnreadCount(userId: number): Promise<number> {
    return notificationRepo.getUnreadCount(userId);
  }
  async createNotification(userId: number, message: string): Promise<PrismaNotification> {
    const notification = await notificationRepo.create(userId, message);
    const io = getIO();
    io.to(`user-${userId}`).emit('notification', notification);
    return notification;
  }
  async markAsRead(notificationId: number, userId: number): Promise<PrismaNotification> {
    const notification = await notificationRepo.findByIds(notificationId, userId);
    if (!notification) throw new UnauthorizedError();
    return notificationRepo.updateRead(notificationId);
  }
}

export const notificationService = new NotificationService();
