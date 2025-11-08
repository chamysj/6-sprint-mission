import express from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import multer from 'multer';
import { imageUpload } from '../controllers/imageController.js';

const imageRouter = express.Router();
const upload = multer({ dest: 'uploads/' });

imageRouter.post('/', upload.single('attachment'), asyncHandler(imageUpload));

export { imageRouter };
