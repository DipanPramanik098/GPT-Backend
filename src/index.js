import express from 'express';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import userRouter from './routes/userRouter.js';
dotenv.config();
import cookieParser from 'cookie-parser';



const app = express();
app.use(express.json());
app.use(cookieParser());


// 
app.use('/user', userRouter);

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