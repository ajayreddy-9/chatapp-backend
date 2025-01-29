import express from "express";
import { Chat, User } from "../db/models.js";
import mongoose from "mongoose";
const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error Fetching Users.");
  }
});

userRouter.post("/create", async (req, res) => {
  try {
    const user = req.body;
    const dbUser = await User.exists({ phone: user.phone });
    if (dbUser) {
      res.status(400).send("An user with the same phone number exists");
    } else {
      await new User(user).save();
      res.status(201).send("User Created Successfully");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err || "Error creating User.");
  }
});

userRouter.get("/:userId/chats", async (req, res) => {
  try {
    let { userId } = req.params;
    const data = await Chat.find({
      $or: [{ user1: userId }, { user2: userId }],
    })
      .populate({ path: "user1", select: "_id name" })
      .populate({ path: "user2", select: "_id name" })
      .populate("lastMessage");
    const chats = data.map((item) => {
      const newChat = { chatId: item._id, lastMessage: item.lastMessage };
      if (item.user1._id.toString() === userId) {
        newChat.receiver = item.user2;
      } else {
        newChat.receiver = item.user1;
      }
      return newChat;
    });
    res.send(chats);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching chats.");
  }
});

export default userRouter;
