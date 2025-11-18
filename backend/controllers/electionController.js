import Election from "../models/election.js";
import User from "../models/User.js";
import Vote from "../models/vote.js";

/* -------------------------------------------------------
   CREATE ELECTION (NO BLOCKCHAIN)
------------------------------------------------------- */
export const createElection = async (req, res) => {
  console.log("📩 CREATE ELECTION BODY:", req.body);

  try {
    const { candidates } = req.body;

    if (!candidates || candidates.length === 0) {
      return res.status(400).json({ error: "Candidates are required" });
    }

    // Save election in MongoDB directly
    const election = await Election.create(req.body);

    res.json({
      success: true,
      message: "Election created successfully",
      election
    });

  } catch (err) {
    console.error("❌ Election Create Error:", err);
    res.status(500).json({ error: "Failed to create election" });
  }
};


/* -------------------------------------------------------
   GET ALL ELECTIONS (AUTO-EXPIRE)
------------------------------------------------------- */
export const getElections = async (req, res) => {
  try {
    let elections = await Election.find();
    const now = Date.now();

    // Auto-mark completed elections
    const updates = elections.map(async (e) => {
      if (e.endTime && new Date(e.endTime).getTime() < now && e.status !== "completed") {
        e.status = "completed";
        await e.save();
      }
    });

    await Promise.all(updates);

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
   CAST VOTE (NO BLOCKCHAIN)
------------------------------------------------------- */
export const castVote = async (req, res) => {
  try {
    const { electionId, candidateId, userId } = req.body;

    const election = await Election.findById(electionId);
    if (!election)
      return res.status(404).json({ error: "Election not found" });

    // ------------ TIME CHECK ------------
    const now = Date.now();
    if (election.endTime && new Date(election.endTime).getTime() < now) {
      election.status = "completed";
      await election.save();
      return res.status(400).json({ error: "Election has ended" });
    }

    // ------------ CHECK IF USER ALREADY VOTED ------------
    const alreadyVoted = election.voters?.includes(userId);
    if (alreadyVoted)
      return res.status(400).json({ error: "You have already voted in this election" });

    // ------------ UPDATE MONGO ------------
    const candidate = election.candidates.find((c) => c.id === candidateId);
    if (!candidate)
      return res.status(404).json({ error: "Candidate not found" });

    candidate.votes += 1;
    election.totalVotes += 1;

    // store userId to prevent duplicate votes
    if (!election.voters) election.voters = [];
    election.voters.push(userId);

    await election.save();

    // Store vote history (optional)
    await Vote.create({
      electionId,
      voterId: userId,
      candidateId
    });

    return res.json({ success: true, election });

  } catch (err) {
    console.error("❌ Vote Error:", err);
    res.status(500).json({ error: "Failed to vote" });
  }
};


/* -------------------------------------------------------
   FETCH ELECTION RESULTS (NO BLOCKCHAIN)
------------------------------------------------------- */
// electionController.js

// Helper function to determine the winner of a single election
// electionController.js

const determineWinner = (candidates) => {
  if (!candidates || candidates.length === 0) {
    return { name: "No Candidates", votes: 0 };
  }

  // Use reduce to find the candidate with the maximum votes
  const winner = candidates.reduce((prev, current) => {
    // 🛑 FIX: Changed .voteCount to .votes to match MongoDB schema
    const currentVotes = Number(current.votes); 
    const prevVotes = Number(prev.votes);       // 🛑 FIX: Changed .voteCount to .votes

    return (currentVotes > prevVotes) ? current : prev;
  }, candidates[0]); // Start comparison with the first candidate

  // Check for ties: count how many candidates have the max vote count
  // 🛑 FIX: Changed .voteCount to .votes
  const maxVotes = Number(winner.votes); 
  const tiedCandidates = candidates.filter(c => Number(c.votes) === maxVotes); // 🛑 FIX: Changed .voteCount to .votes

  if (tiedCandidates.length > 1) {
    // If there's a tie, return the names of all tied candidates
    return {
      name: tiedCandidates.map(c => c.name).join(' & '),
      votes: maxVotes,
      status: "TIE"
    };
  }

  return {
    name: winner.name,
    votes: maxVotes,
    status: "WINNER"
  };
};


export const fetchElectionResults = async (req, res) => {
  try {
    // Fetch ALL elections and select necessary fields
    const allElections = await Election.find().select('title candidates totalVotes');

    if (!allElections || allElections.length === 0) {
      return res.status(404).json({ error: "No elections found" });
    }

    // Map the results to include the calculated winner for each election
    const resultsWithWinner = allElections.map(election => {
      const winnerData = determineWinner(election.candidates);

      return {
        _id: election._id,
        title: election.title,
        totalVotes: election.totalVotes,
        candidates: election.candidates, 
        // 💡 NEW FIELDS ADDED:
        winner: winnerData.name,
        winningVotes: winnerData.votes,
        status: winnerData.status // To clearly indicate a tie
      };
    });

    return res.json({
      success: true,
      elections: resultsWithWinner,
      totalCount: resultsWithWinner.length
    });

  } catch (err) {
    console.error("❌ All Results Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch all election results" });
  }
};