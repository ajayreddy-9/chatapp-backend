import express from "express";
import { Chat, User } from "../db/models.js";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { authenticateToken } from "./authRouter.js";

const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
  try {
    const { deleted = false } = req.query;
    const users = await User.find({ deleted: deleted });
    res.send(users);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error Fetching Users.");
  }
});

userRouter.post("/create", async (req, res) => {
  res.send("This path is change to /auth/signup");
  // try {
  //   const user = req.body;
  //   const dbUser = await User.exists({ phone: user.phone });
  //   if (dbUser) {
  //     res.status(400).send("An user with the same phone number exists");
  //   } else {
  //     await new User(user).save();
  //     res.status(201).send("User Created Successfully");
  //   }
  // } catch (err) {
  //   console.log(err);
  //   res.status(500).send(err || "Error creating User.");
  // }
});

userRouter.put("/update/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = req.body;
    await User.findByIdAndUpdate(userId, updatedUser);
    res.send("User details updated successfully.");
  } catch (err) {
    console.log(err);
    res.status(500).send(err || "Error updating User.");
  }
});

userRouter.delete("/delete/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndUpdate(userId, { deleted: true });
    res.send("User deleted successfully.");
  } catch (err) {
    console.log(err);
    res.status(500).send(err || "Error deleting User.");
  }
});

userRouter.get("/:userId/chats", async (req, res) => {
  try {
    let { userId } = req.params;
    const data = await Chat.find({
      $or: [{ user1: userId }, { user2: userId }],
      lastMessage: { $exists: true },
    })
      .populate({
        path: "user1",
        select: "_id name deleted",
      })
      .populate({
        path: "user2",
        select: "_id name deleted",
      })
      .populate("lastMessage")
      .sort({
        "lastMessage.createdAt": -1,
      });

    data.sort(
      (a, b) =>
        new Date(b.lastMessage?.createdAt || 0) -
        new Date(a.lastMessage?.createdAt || 0)
    );
    // console.log(data);
    const chats = data.map((item) => {
      const newChat = {
        chatId: item._id,
        lastMessage: item.lastMessage,
        blockedBy: item.blockedBy,
      };
      if (item.user1._id.toString() === userId) {
        newChat.receiver = item.user2;
      } else {
        newChat.receiver = item.user1;
      }
      if (item?.blockedBy?.length > 0) {
        newChat.blockedStatus = true;
      } else {
        newChat.blockedStatus = false;
      }
      return newChat;
    });
    res.send(chats);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching chats.");
  }
});

userRouter.post("/:userId/block/:chatId", async (req, res) => {
  try {
    const { chatId, userId } = req.params;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { blockedBy: new ObjectId(userId) } },
      { new: true, select: "blockedBy" }
    );

    res.send(updatedChat);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error blocking user.");
  }
});

userRouter.post("/:userId/unblock/:chatId", async (req, res) => {
  try {
    const { chatId, userId } = req.params;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { blockedBy: new ObjectId(userId) } },
      { new: true, select: "blockedBy" }
    );

    res.send(updatedChat);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error unblocking user.");
  }
});

export default userRouter;
// userRouter.post("/:userId/block/:chatId/", async (req, res) => {
//   try {
//     const { chatId, userId } = req.params;
//     let data = await Chat.find(
//       {
//         $and: [
//           { _id: chatId },
//           { $or: [{ user1: userId }, { user2: userId }] },
//         ],
//       },
//       { blockedBy: 1, _id: 0 }
//     );
//     const { blockedBy } = data[0];
//     let prevBlockedList = [...blockedBy];
//     let blocked = false;
//     for (let index = 0; index < prevBlockedList.length; index++) {
//       if (prevBlockedList[index].toString() === userId) {
//         blocked = true;
//         break;
//       }
//     }
//     if (!blocked) {
//       prevBlockedList = [...prevBlockedList, new ObjectId(userId)];
//       data = await Chat.findByIdAndUpdate(
//         chatId,
//         {
//           blockedBy: prevBlockedList,
//         },
//         { new: true }
//       );
//     }

//     res.send(data);
//   } catch (err) {
//     console.log(err);
//     res.status(500).send("Error blocking user.");
//   }
// });

// userRouter.post("/:userId/unblock/:chatId/", async (req, res) => {
//   try {
//     const { chatId, userId } = req.params;
//     let data = await Chat.find(
//       {
//         $and: [
//           { _id: chatId },
//           { $or: [{ user1: userId }, { user2: userId }] },
//         ],
//       },
//       { blockedBy: 1, _id: 0 }
//     );
//     const { blockedBy } = data[0];
//     let prevBlockedList = [...blockedBy];
//     let blocked = -1;
//     for (let index = 0; index < prevBlockedList.length; index++) {
//       if (prevBlockedList[index].toString() === userId) {
//         blocked = index;
//         break;
//       }
//     }
//     console.log(prevBlockedList);
//     if (blocked !== -1) {
//       prevBlockedList = [
//         ...prevBlockedList.slice(0, blocked),
//         ...prevBlockedList.slice(blocked + 1),
//       ];
//       console.log(prevBlockedList, blocked);
//       data = await Chat.findByIdAndUpdate(
//         chatId,
//         {
//           blockedBy: prevBlockedList,
//         },
//         { new: true }
//       );
//     }

//     res.send(data);
//   } catch (err) {
//     console.log(err);
//     res.status(500).send("Error unblocking user.");
//   }
// });
