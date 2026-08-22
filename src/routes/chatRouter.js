import express from 'express';
import { createChat, deleteChat, getRecentTwentyChat, getSingleChat } from '../controllers/chatController.js';
import authUserMiddleware from '../middleware/authUserMiddleware.js';

const chatRouter = express.Router();


// authenticate first

chatRouter.use(authUserMiddleware);

// get recentchat - top 20 , getSinglehat, createChat, deleteChat

chatRouter.post('/createchat', createChat);
chatRouter.get('/getrecentchat', getRecentTwentyChat);
chatRouter.get('/:chatId', getSingleChat);
chatRouter.delete('/deletechat/:chatId', deleteChat);

export default chatRouter;