import express from 'express';
import authUserMiddleware from '../middleware/authUserMiddleware';
import { getMessage, sendMessage } from '../controllers/messageController';

const messageRouter = express.Router();

// sendmessage, getMessage


messageRouter.use(authUserMiddleware);

//
//first message
messageRouter.post('/', sendMessage);
// 
messageRouter.get('/getmessage/:chatId', getMessage);;
messageRouter.post('/sendmessage/:chatId', sendMessage);

export default messageRouter;