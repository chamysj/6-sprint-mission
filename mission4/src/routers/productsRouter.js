import express from 'express';
import { withAsync } from '../lib/withAsync.js';
import {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductList,
  createComment,
  getCommentList,
  likeProduct,
  unlikeProduct,
} from '../controllers/productsController.js';
import authenticate from '../../middlewares/authenticate.js';
import { getMyLikedProducts, getMyProductList } from '../controllers/usersController.js';

const productsRouter = express.Router();

productsRouter.get('/me', authenticate(), withAsync(getMyProductList));
productsRouter.get('/me/likes', authenticate(), withAsync(getMyLikedProducts));
productsRouter.get('/', authenticate({ optional: true }), withAsync(getProductList));
productsRouter.post('/', authenticate(), withAsync(createProduct));
productsRouter.get('/:id', authenticate({ optional: true }), withAsync(getProduct));
productsRouter.patch('/:id', authenticate(), withAsync(updateProduct));
productsRouter.delete('/:id', authenticate(), withAsync(deleteProduct));
productsRouter.post('/:id/comments', authenticate(), withAsync(createComment));
productsRouter.get('/:id/comments', withAsync(getCommentList));
productsRouter.post('/:id/like', authenticate(), withAsync(likeProduct));
productsRouter.delete('/:id/like', authenticate(), withAsync(unlikeProduct));

export default productsRouter;
