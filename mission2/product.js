export class Product {
  #favoriteCount; //캡슐화
  constructor(
    name,
    description,
    price,
    tags = [],
    images = [],
    favoriteCount = 0
  ) {
    this.name = name; //상품명
    this.description = description; //상품 설명
    this.price = price; //판매 가격
    this.tags = tags; //해시태그
    this.images = images; //이미지
    this.#favoriteCount = favoriteCount; //찜하기 수
  }
  //찜하기 수 (증가)
  favorite() {
    this.#favoriteCount += 1;
  }
  getfavoriteCount() {
    return this.#favoriteCount;
  }
}
