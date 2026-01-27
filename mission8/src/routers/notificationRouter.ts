import express from 'express';
import authenticate from '../middlewares/authenticate';
import { withAsync } from '../lib/withAsync';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
} from '../controllers/notificationController';

const notificationRouter = express.Router();

notificationRouter.get('/', authenticate(), withAsync(getNotifications));
notificationRouter.get('/unread-count', authenticate(), withAsync(getUnreadCount));
notificationRouter.patch('/:id/read', authenticate(), withAsync(markAsRead));

export default notificationRouter;
