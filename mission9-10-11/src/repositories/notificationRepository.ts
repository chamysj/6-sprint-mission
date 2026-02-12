import { prisma } from '../lib/prismaClient';

export class NotificationRepository {
  async getNotification(userId: number) {
    return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }
  async getUnreadCount(userId: number) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }
  async create(userId: number, message: string) {
    return prisma.notification.create({ data: { userId, message } });
  }
  async findByIds(notificationId: number, userId: number) {
    return prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
  }
  async updateRead(notificationId: number) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }
}

export const notificationRepo = new NotificationRepository();
