import { prisma } from '../../src/lib/prismaClient';

// 테스트 DB 정리 함수
// FK 제약 때문에 "자식 -> 부모" 순서로 삭제해야 함
// 스키마 기준: Like/Notification/Comment -> Product/Article -> User
export async function cleanDb() {
  await prisma.like.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.product.deleteMany();
  await prisma.article.deleteMany();
  await prisma.user.deleteMany();
}
// 테스트 종료 시 prisma 연결 종료
export async function disconnectDb() {
  await prisma.$disconnect();
}
