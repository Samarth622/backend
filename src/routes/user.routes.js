import { Router } from "express";
import {
    loginUser,
    logoutUser,
    // userProfile,
    profileUser,
    registerUser,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

export const userRouter = Router();

userRouter.route("/signup").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/profile").get(profileUser);
userRouter.route("/editProfile").put(profileUser);

userRouter.route("/logout").post(logoutUser);
