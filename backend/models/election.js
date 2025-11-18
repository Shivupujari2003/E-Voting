import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema({
  id: String,
  name: String,
  votes: { type: Number, default: 0 },
});

const ElectionSchema = new mongoose.Schema({
  title: String,
  description: String,
  startTime: String,
  endTime: String,
  status: { type: String, default: "active" }, // active | completed

  candidates: [CandidateSchema],

  totalVotes: { type: Number, default: 0 },

  // NEW FIELD for simple voting system
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

export default mongoose.model("Election", ElectionSchema);
