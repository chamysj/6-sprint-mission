import express from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import {
  validateCreateProduct,
  validateDeleteProduct,
  validateGetProduct,
  validateGetProducts,
  validatePatchProduct,
  validateCreateComment,
  getProductComments,
} from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.post('/', asyncHandler(validateCreateProduct));
productRouter.get('/:id', asyncHandler(validateGetProduct));
productRouter.patch('/:id', asyncHandler(validatePatchProduct));
productRouter.delete('/:id', asyncHandler(validateDeleteProduct));
productRouter.get('/', asyncHandler(validateGetProducts));
productRouter.post('/:id/comments', asyncHandler(validateCreateComment));
productRouter.get('/:id/comments', asyncHandler(getProductComments));
export default productRouter;
