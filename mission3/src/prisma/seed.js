import { PrismaClient } from '@prisma/client';
import { ARTICLES, PRODUCTS } from './mock.js';

const prisma = new PrismaClient();

async function main() {
  await prisma.article.deleteMany();
  await prisma.product.deleteMany();
  await prisma.article.createMany({
    data: ARTICLES,
    skipDuplicates: true,
  });
  await prisma.product.createMany({
    data: PRODUCTS,
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    await prisma.$disconnect();
    process.exit(1);
  });
