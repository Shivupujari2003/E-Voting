import mongoose from "mongoose";
const voteSchema = new mongoose.Schema({
  electionId: String,
  voterId: String,
  candidateId: String,
  txHash: String,
  blockNumber: Number,
  confidence: Number,
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.model("Vote", voteSchema);