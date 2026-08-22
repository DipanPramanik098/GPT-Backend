import express from "express";
import { logIn, logOut, signUp } from "../controllers/userController.js";
import { profile } from "node:console";
import authUserMiddleware from "../middleware/authUserMiddleware.js";

const userRouter = express.Router();

// * signUp login logout profile

userRouter.post('/signup', signUp);
userRouter.post('/login', logIn);
userRouter.post('/logout', logOut);
userRouter.get('/profile', authUserMiddleware, profile);

export default userRouter;