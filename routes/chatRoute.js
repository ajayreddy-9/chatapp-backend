import express from "express";
import { Chat, Message } from "../db/models.js";
import { ObjectId } from "mongodb";
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

// chatRouter.post("/message", async (req, res) => {
//   try {
//     const message = req.body;
//     await new Message(message).save();
//     res.status(201).send();
//   } catch (err) {
//     console.log(err);
//     res.status(500).send("Error sending message.");
//   }
// });

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
    const message = req.body;
    if (!message.chatId) {
      message.chatId = chatId;
    }
    const response = await new Message(message).save();
    const updateResponse = await Chat.findByIdAndUpdate(chatId, {
      lastMessage: response._id,
    });
    // console.log(updateResponse);
    res.send(response);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error sending Message.");
  }
});

export default chatRouter;

// 679b4fdc0e6c3ab0a94894ef ajay
// 679b51aa0e6c3ab0a9489509 sathvika
// 679b51e70e6c3ab0a948950f varsha
// 679b52930e6c3ab0a9489517 shiva
// 679b52b60e6c3ab0a948951b vishnu
