# 스프린트 미션5

- 미션8 소켓io를 활용한 알림 api 기능 개발

## 추가된 주요 기능

- 자신의 알림 목록 조회
- 자신이 읽지 않은 알림 개수 조회
- 자신의 알림 읽음 처리
- 클라이언트 실시간 알림 기능
- 좋아요한 상품의 가격 변동 알림
- 자신이 작성한 게시글의 댓글 알림

## ERD 다이어그램

```mermaid
erDiagram
  USER {
    Int id PK
    String email "UNIQUE"
    String nickname "UNIQUE"
    String image "nullable"
    String password
    DateTime createdAt
    DateTime updatedAt
  }

  ARTICLE {
    Int id PK
    String title
    String content
    String image "nullable"
    DateTime createdAt
    DateTime updatedAt
    Int userId FK
  }

  PRODUCT {
    Int id PK
    String name
    String description
    Int price
    String[] tags
    String[] images
    DateTime createdAt
    DateTime updatedAt
    Int userId FK
  }

  COMMENT {
    Int id PK
    String content
    Int productId FK "nullable"
    Int articleId FK "nullable"
    DateTime createdAt
    DateTime updatedAt
    Int userId FK
  }

  LIKE {
    Int id PK
    Int userId FK
    Int productId FK "nullable"
    Int articleId FK "nullable"
    DateTime createdAt
  }

  NOTIFICATION {
    Int id PK
    Int userId FK
    String message
    Boolean isRead
    DateTime createdAt
  }

  USER ||--o{ ARTICLE : writes
  USER ||--o{ PRODUCT : sells
  USER ||--o{ COMMENT : writes
  USER ||--o{ LIKE : creates
  USER ||--o{ NOTIFICATION : receives

  ARTICLE ||--o{ COMMENT : has
  PRODUCT ||--o{ COMMENT : has

  ARTICLE ||--o{ LIKE : likedBy
  PRODUCT ||--o{ LIKE : likedBy

```

- 한 유저는 같은 Product/Article 에 한 번만 좋아요를 누를 수 있습니다. (unique 제약)

## 프로젝트 구조

```
mission8
├── prisma
│   ├── migrations
│   └── schema.prisma
├── public
│   └──socket-client-test.html
├── src
│   ├── controllers
│   │   ├── articlesController.ts
│   │   ├── commentsController.ts
│   │   ├── errorController.ts
│   │   ├── imagesController.ts
│   │   ├── notificationController.ts
│   │   ├── productsController.ts
│   │   └── usersController.ts
│   │
│   ├── lib
│   │   ├── errors
│   │   │   ├── customErrors.ts
│   │   │   └── errorUtils.ts
│   │   ├── constants.ts
│   │   ├── cookies.ts
│   │   ├── prismaClient.ts
│   │   ├── token.ts
│   │   └── withAsync.ts
│   │
│   ├── middlewares
│   │   └── authenticate.ts
│   │
│   ├── repositories
│   │   ├── articleRepository.ts
│   │   ├── commentRepository.ts
│   │   ├── likeRepository.ts
│   │   ├── notificationRepository.ts
│   │   ├── productRepository.ts
│   │   └── userRepository.ts
│   │
│   ├── routers
│   │   ├── articlesRouter.ts
│   │   ├── commentsRouter.ts
│   │   ├── imagesRouter.ts
│   │   ├── notificationRepository.ts
│   │   ├── productsRouter.ts
│   │   └── usersRouter.ts
│   │
│   ├── services
│   │   ├── articleService.ts
│   │   ├── commentService.ts
│   │   ├── imageService.ts
│   │   ├── notificationService.ts
│   │   ├── productService.ts
│   │   └── userService.ts
│   │
│   ├── structs
│   │   ├── articlesStructs.ts
│   │   ├── commentsStructs.ts
│   │   ├── commonStructs.ts
│   │   ├── productsStructs.ts
│   │   └── usersStructs.ts
│   │
│   ├── socket.ts
│   └── main.ts
│
├── tests
├── types
├── package.json
├── package-lock.json
└── readme.md
```
