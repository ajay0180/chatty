import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getUserForSideBar,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";

const messageRoutes = express.Router();

messageRoutes.get("/users", protectRoute, getUserForSideBar);
messageRoutes.get("/:id", protectRoute, getMessages);
messageRoutes.post("/send/:id", protectRoute, sendMessage);

export default messageRoutes;
