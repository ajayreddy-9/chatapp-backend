//authRouter.js

import express, { request } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { User } from "../db/models.js";
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone || !email || !password) {
      return res.status(400).send({ error: "All fields are required" });
    }
    const existingUser = await User.findOne({ phone: phone });
    if (existingUser) {
      return res
        .status(400)
        .send({ error: "An user with the same phone number exists" });
    }
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, phone, password: hashedPassword });
    const response = await newUser.save();
    res
      .status(201)
      .send({ message: "User created successfully", user: response });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message || "Error creating user.");
  }
});

authRouter.post("/signin", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).send({ error: "All fields are required" });
    }
    const existingUser = await User.findOne({ phone: phone });
    if (!existingUser) {
      return res
        .status(400)
        .send({ error: "No user found with given phone number." });
    }
    const isPasswordMatched = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (isPasswordMatched) {
      const payload = {
        phone: phone,
      };
      const jwtToken = jwt.sign(payload, process.env.JWTSECRETKEY);
      res.cookie("userToken2", jwtToken, { path: "/auth/getuser" });
      res.send({ jwtToken });
    } else {
      res.send("Password Not Matched");
    }
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message || "Error signing in.");
  }
});

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log(req.headers);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }
    const jwtToken = authHeader.split(" ")[1];
    jwt.verify(jwtToken, process.env.JWTSECRETKEY, async (error, payload) => {
      if (error) {
        return res.status(401).send("Invalid access token.");
      } else {
        console.log(payload);
        req.phone = payload.phone;
        next();
      }
    });
    // const decoded = jwt.verify(jwtToken, process.env.JWTSECRETKEY);
    // console.log(decoded);
    // next();
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message || "Error verifing token.");
  }
};

authRouter.get("/getuser", authenticateToken, async (req, res) => {
  try {
    const { phone } = req;
    const user = await User.findOne({ phone: phone }, { password: 0 });
    if (!user) {
      return res.status(401).send("Invalid access token.");
    } else {
      return res.status(200).send(user);
    }
  } catch (err) {
    console.log(err);
    res.status(400).send("Error fetching user details.");
  }
});

export default authRouter;
