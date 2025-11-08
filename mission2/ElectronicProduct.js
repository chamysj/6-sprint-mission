import { Product } from './product.js';
/* 부모: Product
   자식: EletronicProduct */
export class ElectronicProduct extends Product {
  constructor(
    name,
    description,
    price,
    tags = [],
    images = [],
    favoriteCount = 0,
    manufacturer = '' //제조사
  ) {
    super(name, description, price, tags, images, favoriteCount); //부모 호출
    this.manufacturer = manufacturer; //제조사 상속 및 초기화
  }
}
