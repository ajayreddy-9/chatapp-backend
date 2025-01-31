import mongoose, { mongo } from "mongoose";
import db from "./connection.js";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
});
export const User = mongoose.model("User", userSchema);

const chatSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Types.ObjectId,
      ref: User,
      required: true,
    },
    user2: {
      type: mongoose.Types.ObjectId,
      ref: User,
      required: true,
    },
    lastMessage: {
      type: mongoose.Types.ObjectId,
      ref: "Message",
    },
    blockedBy: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
    ],
  },
  { timestamps: true }
);
export const Chat = mongoose.model("Chat", chatSchema);

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Types.ObjectId,
      ref: User,
      required: true,
    },
    chatId: {
      type: mongoose.Types.ObjectId,
      ref: Chat,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
