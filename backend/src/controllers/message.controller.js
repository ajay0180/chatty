import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUserForSideBar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUser = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    return res.status(200).json({ users: filteredUser });
  } catch (e) {
    console.log("error in getUserForSideBar", e.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { receiverId: myId, senderId: userToChatId },
      ],
    });

    return res.status(200).json({ messages });
  } catch (error) {
    console.log("error in getMessage controller", error.message);
    return res.status(500).json({ message: "internal server error" });
  }
};
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    //todo: socket.io implementation...
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(200).json({ newMessage });
  } catch (error) {
    console.log("error in sendMessage controller", error.message);
    return res.status(500).json({ message: "internal server error" });
  }
};
