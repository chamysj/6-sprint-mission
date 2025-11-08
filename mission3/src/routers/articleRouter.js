import express from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import {
  validateCreateArticle,
  validateDeleteArticle,
  validateGetArticle,
  validateGetArticles,
  validatePatchArticle,
  validateCreateComment,
  getArticleComments,
} from '../controllers/articleController.js';

const articleRouter = express.Router();

articleRouter.post('/', asyncHandler(validateCreateArticle));
articleRouter.get('/:id', asyncHandler(validateGetArticle));
articleRouter.patch('/:id', asyncHandler(validatePatchArticle));
articleRouter.delete('/:id', asyncHandler(validateDeleteArticle));
articleRouter.get('/', asyncHandler(validateGetArticles));
articleRouter.post('/:id/comments', asyncHandler(validateCreateComment));
articleRouter.get('/:id/comments', asyncHandler(getArticleComments));
export default articleRouter;
