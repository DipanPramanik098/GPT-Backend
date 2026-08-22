import express from "express";
import { deleteProfile, logIn, logOut, signUp, profile } from "../controllers/userController.js";
import authUserMiddleware from "../middleware/authUserMiddleware.js";

const userRouter = express.Router();

// * signUp login logout profile

userRouter.post('/signup', signUp);
userRouter.post('/login', logIn);
userRouter.post('/logout', logOut);
userRouter.get('/profile', authUserMiddleware, profile);
userRouter.delete('/deleteprofile/:userId', authUserMiddleware, deleteProfile);

export default userRouter;