import mongoose from "mongoose";
const electionSchema = new mongoose.Schema({
  title: String,
  description: String,
  startTime: Date,
  endTime: Date,
  status: {
    type: String,
    enum: ["draft", "active", "closed"],
    default: "draft",
  },
  candidates: [
    { id: String, name: String, address: String, votes: { type: Number, default: 0 } },
  ],
  totalVotes: { type: Number, default: 0 },
  createdBy: String,
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.model("Election", electionSchema);