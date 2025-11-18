import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: "Election" },
  voterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  candidateId: String,

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Vote", voteSchema);
