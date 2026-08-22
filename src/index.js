import express from 'express';
import 'dotenv/config';
import connectDB from './config/db.js';
import userRouter from './routes/userRouter.js';
import cookieParser from 'cookie-parser';
import chatRouter from './routes/chatRouter.js';
import messageRouter from './routes/messageRoutert.js';



const app = express();
app.use(express.json());
app.use(cookieParser());


// 
app.use('/user', userRouter);
app.use('/chat', chatRouter);
app.use('/message',messageRouter);


// * start
app.use('/', async (req, res) => {
    res.send({
        message: "This Is A Backend For AI Chat Platform"
    })
})

const startServer = async () => {
    try {
        await connectDB();
        app.listen(process.env.PORT, () => {
            console.log(`App Listen On Port No ${process.env.PORT}`);
        })
    } catch (error) {
        console.log(error);
    }
}

startServer();