import express from 'express';
import authUserMiddleware from '../middleware/authUserMiddleware';
import { getMessage, sendMessage } from '../controllers/messageController';

const messageRouter = express.Router();

// sendmessage, getMessage


messageRouter.use(authUserMiddleware);

messageRouter.post('/getmessage/:chatId', getMessage);;
messageRouter.delete('/sendmessage', sendMessage);

export default messageRouter;