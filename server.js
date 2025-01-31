import express from "express";
import cors from "cors";
import "dotenv/config";
import userRouter from "./routes/userRoute.js";
import chatRouter from "./routes/chatRoute.js";
import authRouter from "./routes/authRouter.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/users", userRouter);
app.use("/chats", chatRouter);
app.use("/auth/", authRouter);

app.use("/ping", (req, res) => {
  try {
    console.log("ping");
    res.send("Pinging");
  } catch (err) {
    console.log(err);
    res.send(err || "error");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("server started at http://localhost:3000");
  setInterval(async () => {
    await fetch("https://chatapp-backend-isfi.onrender.com/ping");
  }, 300000);
});
