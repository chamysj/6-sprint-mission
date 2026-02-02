import { prisma } from '../../src/lib/prismaClient';

export async function createSeedUser() {
  const now = Date.now();
  return prisma.user.create({
    data: {
      email: `seed+${now}@example.com`,
      nickname: `seed_${now}`,
      password: 'seed-password',
    },
  });
}
