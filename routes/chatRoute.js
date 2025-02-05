import express from "express";
import { Chat, Message } from "../db/models.js";
import { ObjectId } from "mongodb";
import { getIo, getSocketIdOfUser } from "../socket.js";
const chatRouter = express.Router();

chatRouter.get("/", async (req, res) => {
  try {
    const chats = await Chat.find().populate("user1 user2 lastMessage");
    res.send(chats);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error Fetching chats");
  }
});

chatRouter.post("/create", async (req, res) => {
  try {
    const chat = req.body;
    await new Chat(chat).save();
    res.status(201).send();
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating new chat.");
  }
});

chatRouter.post("/getchat", async (req, res) => {
  try {
    const { sender, receiver } = req.body;
    const data = await Chat.findOne({
      $or: [
        { $and: [{ user1: sender }, { user2: receiver }] },
        { $and: [{ user1: receiver }, { user2: sender }] },
      ],
    })
      .populate({
        path: "user1",
        select: "_id name deleted",
      })
      .populate({
        path: "user2",
        select: "_id name deleted",
      })
      .populate("lastMessage");
    let chatDetails = data;
    if (data === null) {
      const newchat = { user1: sender, user2: receiver };
      const result = await new Chat(newchat).save();
      chatDetails = await Chat.findById(result._id)
        .populate({
          path: "user1",
          select: "_id name deleted",
        })
        .populate({
          path: "user2",
          select: "_id name deleted",
        })
        .populate("lastMessage");
    }

    const chat = {
      chatId: chatDetails._id,
      lastMessage: chatDetails.lastMessage,
    };
    if (chatDetails.user1._id.toString() === sender) {
      chat.receiver = chatDetails.user2;
    } else {
      chat.receiver = chatDetails.user1;
    }
    res.send(chat);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error Fetching Chatdetails.");
  }
});

chatRouter.get("/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId: chatId }).sort({
      createdAt: 1,
    });
    res.send(messages);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching chats.");
  }
});

chatRouter.post("/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;

    const { receiverId } = req.body;
    const message = {
      chatId: chatId,
      sender: req.body.sender,
      content: req.body.content,
    };
    if (!message.chatId) {
      message.chatId = chatId;
    }
    const response = await new Message(message).save();
    const updateResponse = await Chat.findByIdAndUpdate(chatId, {
      lastMessage: response._id,
    });

    const io = getIo();
    const socketId = getSocketIdOfUser(receiverId);
    if (socketId !== null) {
      io.to(socketId).emit("receiveMessage");
      // console.log("sent receivemessage from socket io");
    }
    res.send(response);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error sending Message.");
  }
});

export default chatRouter;
