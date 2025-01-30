import mongoose from "mongoose";
import "dotenv/config";
const uri = process.env.MONGODBURI;

try {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Successfully connected to MongoDB!");
} catch (err) {
  console.error("MongoDB connection error:", err);
}

export default mongoose.connection;
