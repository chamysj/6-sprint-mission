import express from 'express';
import cors from 'cors';
import articlesRouter from './routers/articlesRouter';
import productsRouter from './routers/productsRouter';
import commentsRouter from './routers/commentsRouter';
import imagesRouter from './routers/imagesRouter';
import usersRouter from './routers/usersRouter';
import { defaultNotFoundHandler, globalErrorHandler } from './controllers/errorController';
import cookieParser from 'cookie-parser';
import notificationRouter from './routers/notificationRouter';
import { setupStatic } from './lib/setupStatic';

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
setupStatic(app);

app.use('/articles', articlesRouter);
app.use('/products', productsRouter);
app.use('/comments', commentsRouter);
app.use('/images', imagesRouter);
app.use('/users', usersRouter);
app.use('/notifications', notificationRouter);

app.use(defaultNotFoundHandler);
app.use(globalErrorHandler);

export default app;
