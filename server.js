import express from "express";
import cors from "cors";
import "dotenv/config";
import userRouter from "./routes/userRoute.js";
import chatRouter from "./routes/chatRoute.js";
import authRouter from "./routes/authRouter.js";
import http from "http";
import { getIo, initializeSocket } from "./socket.js";

const app = express();
const server = http.createServer(app);
initializeSocket(server);

app.use(cors({ credentials: true, methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());
app.use("/users", userRouter);
app.use("/chats", chatRouter);
app.use("/auth/", authRouter);

app.get("/ping", (req, res) => {
  try {
    console.log("ping");
    res.send("Pinging");
  } catch (err) {
    console.log(err);
    res.send(err || "error");
  }
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`server started at http://localhost:${process.env.PORT || 3000}`);
  setInterval(async () => {
    await fetch(`${process.env.HOST_URI}/ping`);
  }, 300000);
});
