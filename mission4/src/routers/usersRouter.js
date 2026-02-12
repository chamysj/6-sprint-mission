import express from 'express';
import { withAsync } from '../lib/withAsync.js';
import {
  register,
  login,
  logout,
  getProfile,
  patchPassword,
  updateProfile,
  refreshToken,
} from '../controllers/usersController.js';
import authenticate from '../../middlewares/authenticate.js';

const usersRouter = express.Router();

usersRouter.post('/register', withAsync(register));
usersRouter.post('/login', withAsync(login));
usersRouter.post('/logout', withAsync(logout));
usersRouter.post('/refresh', withAsync(refreshToken));
usersRouter.get('/me', authenticate(), withAsync(getProfile));
usersRouter.patch('/me', authenticate(), withAsync(updateProfile));
usersRouter.patch('/me/password', authenticate(), withAsync(patchPassword));

//경로 설점 like 확인
export default usersRouter;
