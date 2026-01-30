import { productService } from '../src/services/productService';
import { productRepo } from '../src/repositories/productRepository';
import { likeRepo } from '../src/repositories/likeRepository';
import { commentRepo } from '../src/repositories/commentRepository';
import { notificationService } from '../src/services/notificationService';

jest.mock('../src/repositories/productRepository', () => ({
  productRepo: {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdWithLikes: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findProductListWithLikes: jest.fn(),
    count: jest.fn(),
  },
}));

jest.mock('../src/repositories/likeRepository', () => ({
  likeRepo: {
    findLike: jest.fn(),
    createLike: jest.fn(),
    deleteLike: jest.fn(),
    getLikers: jest.fn(),
  },
}));

jest.mock('../src/repositories/commentRepository', () => ({
  commentRepo: {
    create: jest.fn(),
    findCommentListQuery: jest.fn(),
  },
}));

jest.mock('../src/services/notificationService', () => ({
  notificationService: {
    createNotification: jest.fn(),
  },
}));

const mockedProductRepo = productRepo as jest.Mocked<typeof productRepo>;
const mockedLikeRepo = likeRepo as jest.Mocked<typeof likeRepo>;
const mockedCommentRepo = commentRepo as jest.Mocked<typeof commentRepo>;
const mockedNotificationService = notificationService as jest.Mocked<typeof notificationService>;

describe('ProductService (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createProduct: tags/images가 없으면 빈 배열로 저장한다', async () => {
    mockedProductRepo.create.mockResolvedValueOnce({
      id: 1,
      name: 'P',
      description: 'D',
      price: 100,
      tags: [],
      images: [],
      userId: 1,
    } as any);

    await productService.createProduct({
      name: 'P',
      description: 'D',
      price: 100,
      userId: 1,
    });

    expect(mockedProductRepo.create).toHaveBeenCalledWith({
      name: 'P',
      description: 'D',
      price: 100,
      tags: [],
      images: [],
      user: { connect: { id: 1 } },
    });
  });

  test('getProduct: 비로그인은 isLiked 키가 내려오지 않는다', async () => {
    mockedProductRepo.findByIdWithLikes.mockResolvedValueOnce({
      id: 1,
      name: 'P',
      description: 'D',
      price: 100,
      tags: [],
      images: [],
      userId: 1,
      likes: [],
      _count: { likes: 0 },
    } as any);

    const res = await productService.getProduct(1);

    expect(res.likeCount).toBe(0);
    expect(res).not.toHaveProperty('isLiked');
  });

  test('updateProduct: 가격 변경 시 좋아요 누른 유저에게 알림을 보낸다', async () => {
    mockedProductRepo.findById.mockResolvedValueOnce({
      id: 1,
      name: 'P',
      description: 'D',
      price: 100,
      tags: [],
      images: [],
      userId: 1,
    } as any);
    mockedProductRepo.update.mockResolvedValueOnce({
      id: 1,
      name: 'P',
      description: 'D',
      price: 200,
      tags: [],
      images: [],
      userId: 1,
    } as any);
    mockedLikeRepo.getLikers.mockResolvedValueOnce([{ userId: 2 }, { userId: 1 }]);

    await productService.updateProduct(1, 1, { price: 200 });

    expect(mockedNotificationService.createNotification).toHaveBeenCalledTimes(1);
    expect(mockedNotificationService.createNotification).toHaveBeenCalledWith(
      2,
      '관심 상품 "P"의 가격이 변동되었습니다.',
    );
  });

  test('getProductList: 로그인 유저는 isLiked를 포함한다', async () => {
    mockedProductRepo.count.mockResolvedValueOnce(1);
    mockedProductRepo.findProductListWithLikes.mockResolvedValueOnce([
      {
        id: 1,
        name: 'P',
        description: 'D',
        price: 100,
        tags: [],
        images: [],
        userId: 1,
        likes: [{ id: 99 }],
        _count: { likes: 1 },
      },
    ] as any);

    const res = await productService.getProductList(1, 10, 'recent', undefined, 1);

    expect(res.totalCount).toBe(1);
    expect(res.list[0].isLiked).toBe(true);
    expect(res.list[0].likeCount).toBe(1);
  });

  test('createComment: 댓글이 등록된다', async () => {
    mockedProductRepo.findById.mockResolvedValue({
      id: 1,
      name: 'P',
      description: 'D',
      price: 100,
      tags: [],
      images: [],
      userId: 1,
    } as any);
    mockedCommentRepo.create.mockResolvedValueOnce({
      id: 10,
      content: 'c1',
    } as any);

    const res = await productService.createComment(1, 1, 'c1');

    expect(res).toHaveProperty('id', 10);
    expect(mockedCommentRepo.create).toHaveBeenCalledWith({
      content: 'c1',
      user: { connect: { id: 1 } },
      product: { connect: { id: 1 } },
    });
  });
});
