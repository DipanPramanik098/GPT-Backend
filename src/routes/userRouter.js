import express from "express";
import { logIn, logOut, signUp } from "../controllers/userController.js";
import { profile } from "node:console";

const userRouter = express.Router();

// * signUp login logout profile

userRouter.post('/signup', signUp);
userRouter.post('/login', logIn);
userRouter.post('/logout', logOut);
userRouter.get('/profile', profile);

export default userRouter;