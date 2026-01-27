import express from 'express';
import { withAsync } from '../lib/withAsync';
import {
  register,
  login,
  logout,
  getProfile,
  patchPassword,
  updateProfile,
  refreshToken,
} from '../controllers/usersController';
import authenticate from '../middlewares/authenticate';

const usersRouter = express.Router();

usersRouter.post('/register', withAsync(register));
usersRouter.post('/login', withAsync(login));
usersRouter.post('/logout', withAsync(logout));
usersRouter.post('/refresh', withAsync(refreshToken));
usersRouter.get('/me', authenticate(), withAsync(getProfile));
usersRouter.patch('/me', authenticate(), withAsync(updateProfile));
usersRouter.patch('/me/password', authenticate(), withAsync(patchPassword));

export default usersRouter;
