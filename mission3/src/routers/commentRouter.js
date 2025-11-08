import express from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { deleteComment, patchComment } from '../controllers/commentController.js';

const commentRouter = express.Router();

commentRouter.patch('/:id', asyncHandler(patchComment));
commentRouter.delete('/:id', asyncHandler(deleteComment));

export default commentRouter;
