import express from 'express';
import cors from 'cors';
import path from 'path';
import { PORT, PUBLIC_PATH, STATIC_PATH } from './lib/constants';
import articlesRouter from './routers/articlesRouter';
import productsRouter from './routers/productsRouter';
import commentsRouter from './routers/commentsRouter';
import imagesRouter from './routers/imagesRouter';
import usersRouter from './routers/usersRouter';
import { defaultNotFoundHandler, globalErrorHandler } from './controllers/errorController';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { initSocket } from './socket';
import notificationRouter from './routers/notificationRouter';

const app = express();
const server = createServer(app);

initSocket(server);

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(STATIC_PATH, express.static(path.resolve(process.cwd(), PUBLIC_PATH)));

app.use('/articles', articlesRouter);
app.use('/products', productsRouter);
app.use('/comments', commentsRouter);
app.use('/images', imagesRouter);
app.use('/users', usersRouter);
app.use('/notifications', notificationRouter);

app.use(defaultNotFoundHandler);
app.use(globalErrorHandler);

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
