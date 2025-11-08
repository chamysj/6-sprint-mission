import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import commentRouter from './routers/commentRouter.js';
import productRouter from './routers/productRouter.js';
import articleRouter from './routers/articleRouter.js';
import { imageRouter } from './routers/imageRouter.js';
import { PUBLIC_PATH, STATIC_PATH } from './lib/constants.js';
import path from 'path';
import { errorHandler } from './controllers/errorController.js';

const PORT = 3000;
const app = express();

app.use(express.json());
app.use(cors());
app.use(STATIC_PATH, express.static(path.resolve(process.cwd(), PUBLIC_PATH)));

const prisma = new PrismaClient();

app.use('/articles', articleRouter);
app.use('/comments', commentRouter);
app.use('/products', productRouter);
app.use('/images', imageRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log('Server Started');
});
