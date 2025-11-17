import Election from "../models/election.js";

/* -------------------------------------------------------
   CREATE ELECTION
------------------------------------------------------- */
export const createElection = async (req, res) => {
  console.log("📩 CREATE ELECTION BODY:", req.body);

  try {
    const election = await Election.create(req.body);
    res.json({ success: true, election });
  } catch (err) {
    console.log("❌ Election Create Error:", err);
    res.status(500).json({ error: "Failed to create election" });
  }
};

/* -------------------------------------------------------
   GET ALL ELECTIONS  (AUTO-EXPIRE)
------------------------------------------------------- */
export const getElections = async (req, res) => {
  try {
    let elections = await Election.find();
    const now = Date.now();

    // Auto-mark as completed if time passed
    const updates = elections.map(async (e) => {
      if (e.endTime && new Date(e.endTime).getTime() < now && e.status !== "completed") {
        e.status = "completed";
        await e.save();
      }
    });

    await Promise.all(updates);

    // Fetch updated list again
    elections = await Election.find();

    res.json(elections);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch elections" });
  }
};

/* -------------------------------------------------------
   DELETE ELECTION
------------------------------------------------------- */
export const deleteElection = async (req, res) => {
  try {
    await Election.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete election" });
  }
};

/* -------------------------------------------------------
   CAST VOTE  (BLOCK IF EXPIRED)
------------------------------------------------------- */
export const castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;

    const election = await Election.findById(electionId);
    if (!election)
      return res.status(404).json({ error: "Election not found" });

    // Auto-expire based on time
    const now = Date.now();
    if (election.endTime && new Date(election.endTime).getTime() < now) {
      election.status = "completed";
      await election.save();
      return res.status(400).json({ error: "Election has ended" });
    }

    const candidate = election.candidates.find((c) => c.id === candidateId);
    if (!candidate)
      return res.status(404).json({ error: "Candidate not found" });

    candidate.votes += 1;
    election.totalVotes += 1;

    await election.save();

    res.json({ success: true, election });
  } catch (err) {
    console.log("❌ Vote Error:", err);
    res.status(500).json({ error: "Failed to vote" });
  }
};
