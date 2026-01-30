import { Prisma, Article, Comment } from '@prisma/client';

type ArticleLikesAndCount = Prisma.ArticleGetPayload<{
  include: {
    _count: {
      select: {
        likes: true;
      };
    };
    likes: {
      select: {
        id: true;
      };
    };
  };
}>;

//db는 주방 냉장고, 클라이언트는 손님, dto는 서빙되는 접시(플레이팅된 요리)
//DTO 주방에서 재료를 꺼내 손님이 먹기 좋게 가공, 예쁜 그릇에 담은 상태
//기술적인 의미로는 데이터베이스에 저장된 원본 데이터와 클라이언트가 실제로 받는 데이터의 모양이 다를때 dto사용

// DB/내부 모델을 ‘그대로’ 밖으로 내보내지 않고,
// 외부(프론트/외부 API)가 쓰기 좋은 모양으로
// 한 번 가공해서 내보내는 역할을 하는 타입/객체

interface ArticleResponse extends Article {
  likeCount: number;
  isLiked?: boolean;
}

interface ArticleListResponse {
  list: ArticleResponse[];
  totalCount: number;
}
