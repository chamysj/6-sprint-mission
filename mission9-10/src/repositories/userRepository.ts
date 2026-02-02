import { prisma } from '../lib/prismaClient';
import { Prisma } from '@prisma/client';

class UserRepository {
  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }
  async update(id: number, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  }
  async findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }
}

export const userRepo = new UserRepository();
