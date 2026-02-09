import { create } from 'superstruct';
import { IdParamsStruct } from '../structs/commonStructs';
import {
  CreateProductBodyStruct,
  GetProductListParamsStruct,
  UpdateProductBodyStruct,
} from '../structs/productsStruct';
import { CreateCommentBodyStruct, GetCommentListParamsStruct } from '../structs/commentsStruct';
import { UnauthorizedError } from '../lib/errors/customErrors';
import { Request, Response } from 'express';
import { productService } from '../services/productService';

//상품 등록
export async function createProduct(req: Request, res: Response) {
  const { name, description, price, tags, images } = create(req.body, CreateProductBodyStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const product = await productService.createProduct({
    name,
    description,
    price,
    tags,
    images,
    userId: user.id,
  });
  return res.status(201).send(product);
}
//특정 상품 조회(좋아요 포함)
export async function getProduct(req: Request, res: Response) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const user = req.user;
  const product = await productService.getProduct(productId, user?.id);
  return res.send(product);
}
//상품 수정
export async function updateProduct(req: Request, res: Response) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const data = create(req.body, UpdateProductBodyStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const updatedProduct = await productService.updateProduct(productId, user.id, data);
  return res.send(updatedProduct);
}
//상품 삭제
export async function deleteProduct(req: Request, res: Response) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  await productService.deleteProduct(productId, user.id);
  return res.status(204).send();
}
//상품 목록 조회(좋아요 포함)
export async function getProductList(req: Request, res: Response) {
  const { page, pageSize, orderBy, keyword } = create(req.query, GetProductListParamsStruct);
  const user = req.user;
  const products = await productService.getProductList(page, pageSize, orderBy, keyword, user?.id);
  return res.send(products);
}

//댓글 등록
export async function createComment(req: Request, res: Response) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, CreateCommentBodyStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const comment = await productService.createComment(user.id, productId, content);
  return res.status(201).send(comment);
}
//상품 댓글 목록 조회
export async function getCommentList(req: Request, res: Response) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const { cursor, limit } = create(req.query, GetCommentListParamsStruct);
  const commentList = await productService.getCommentList(productId, limit, cursor);
  return res.send(commentList);
}
//상품 좋아요 등록
export async function likeProduct(req: Request, res: Response) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const productLike = await productService.likeProduct(user.id, productId);
  return res.status(200).send(productLike);
}
//상품 좋아요 취소
export async function unlikeProduct(req: Request, res: Response) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const productUnliked = await productService.unlikeProduct(user.id, productId);
  return res.send(productUnliked);
}
