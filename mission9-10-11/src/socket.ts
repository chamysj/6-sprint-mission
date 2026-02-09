import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyAccessToken } from './lib/token';
import { UnauthorizedError } from './lib/errors/customErrors';

let io: SocketIOServer | null = null;

export const initSocket = (Server: HttpServer) => {
  io = new SocketIOServer(Server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.accessToken;
      if (!token) return next(new UnauthorizedError());
      const { userId } = verifyAccessToken(token);
      if (!userId) return next(new UnauthorizedError());
      socket.data.userId = userId;
      next();
    } catch (e) {
      next(new UnauthorizedError());
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log('User connected', socket.id);
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined room user-${userId}`);
  });
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO 서버가 초기화되지 않았습니다.');
  }
  return io;
};
