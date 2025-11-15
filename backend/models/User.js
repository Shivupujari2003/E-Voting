import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  voterId: { type: String, unique: true },
  name: String,
  email: { type: String, unique: true },
  contact: String,
  password: String,
  walletAddress: String,

  faceEncodingFile: String,
  robustEncodingFile: String,

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
