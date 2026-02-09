import { Prisma, Product } from '@prisma/client';

type ProductLikesAndCount = Prisma.ProductGetPayload<{
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

type ProductRecentType = 'myUploaded' | 'myliked';

interface ProductResponse extends Product {
  likeCount: number;
  isLiked?: boolean;
}

interface ProductListResponse {
  list: ProductResponse[];
  totalCount: number;
}
