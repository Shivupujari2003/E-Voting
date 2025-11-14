import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  contact: String,
  password: String,
  walletAddress: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ["voter", "admin"], default: "voter" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
