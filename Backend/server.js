import express from "express";
import cors from "cors";
import "dotenv/config";
import userRouter from "./routes/userRoute.js";
import chatRouter from "./routes/chatRoute.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/users", userRouter);
app.use("/chats", chatRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log("server started at http://localhost:3000");
});
