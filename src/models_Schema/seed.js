import { PrismaClient } from '@prisma/client';
import { ARTICLES, PRODUCTS } from './mock.js';

const prisma = new PrismaClient();

async function main() {
  //기존 데이터 삭제
  await prisma.article.deleteMany();
  await prisma.product.deleteMany();
  //목 데이터 삽입
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
