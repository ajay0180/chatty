import express from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const authRoutes = express.Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.put("/update-profile", protectRoute, updateProfile);

//This route is used in auto-login functionality, where user need not to login manually and will be logged in automatically, if browser has valid token and also used to check 'Session validation before sensitive actions'.
authRoutes.get("/check", protectRoute, checkAuth);

export default authRoutes;
