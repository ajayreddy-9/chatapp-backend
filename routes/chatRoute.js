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

// 6798d7a6954a33c6cc4b33dc ajay
// 6798d7be954a33c6cc4b33e0 chandu
// 6798d7d4954a33c6cc4b33e3 sathvika
// 6798d8c1450b54500b771849 vamshi

//ajay user1
// other user2
// 6798dbf415724bf6510989ed chandu
// 6798dc0115724bf6510989ef sathvika
// 6798dc0815724bf6510989f1 vamshi
