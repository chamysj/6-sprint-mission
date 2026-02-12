# 의존성 설치
FROM node:22-alpine AS deps
WORKDIR /app
COPY mission9-10-11/package*.json ./
RUN npm ci

# 소스 복사 후 빌드
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY mission9-10-11/ ./
RUN npm run prisma:generate
RUN npm run build

# runtime 실행에 필요한 것만 복사
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/public ./public

# 컨테이너에서 3000 포트 사용
EXPOSE 3000

CMD ["node", "dist/src/main.js"]
