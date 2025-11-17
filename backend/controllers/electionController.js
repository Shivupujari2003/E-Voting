import Election from "../models/Election.js";
import { votingContract } from "../blockchain.js";  // adjust path as needed
import User from "../models/User.js";
export const createElection = async (req, res) => {
  console.log("📩 CREATE ELECTION BODY:", req.body);

  try {
    const { candidates } = req.body;

    if (!candidates || candidates.length === 0) {
      return res.status(400).json({ error: "Candidates are required" });
    }

    /* 🔥 1️⃣ Add candidates to Blockchain BEFORE saving DB */
    for (const c of candidates) {
      console.log("📤 Adding candidate to blockchain:", c.name);

      const tx = await votingContract.addCandidate(c.name);
      await tx.wait(); // wait for blockchain confirmation
    }

    console.log("✅ All candidates added to blockchain");


      const users = await User.find({}, "walletAddress");

    console.log(`👥 Registering ${users.length} voters on blockchain`);

    for (const user of users) {
      if (!user.walletAddress) continue;

      try {
        const tx = await votingContract.registerVoter(user.walletAddress);
        await tx.wait();
        console.log(`   🟢 Registered: ${user.walletAddress}`);
      } catch (err) {
        console.log(`   🔴 Already registered or error: ${user.walletAddress}`);
      }
    }

    console.log("✅ All voters registered on blockchain");


    /* 🔥 2️⃣ Start election on Blockchain */
    const startTx = await votingContract.startElection();
    await startTx.wait();

    console.log("🚀 Election started on blockchain");

    /* 🔥 3️⃣ Save election in MongoDB */
    const election = await Election.create(req.body);

    /* 🔥 4️⃣ Respond */
    res.json({
      success: true,
      message: "Election created and started on blockchain",
      election
    });

  } catch (err) {
    console.error("❌ Election Create Error:", err);
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
    const { electionId, candidateId, walletAddress } = req.body;

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

    // ------------ MONGO UPDATE ------------
    const candidate = election.candidates.find((c) => c.id === candidateId);
    if (!candidate)
      return res.status(404).json({ error: "Candidate not found" });

    candidate.votes += 1;
    election.totalVotes += 1;

    await election.save();

    // ------------ BLOCKCHAIN VOTE ------------
    try {
      console.log("📤 Casting vote on blockchain...");
      const tx = await votingContract.connect(walletAddress).vote(Number(candidateId));
      await tx.wait();
      console.log("✅ Blockchain vote successful");
    } catch (bcErr) {
      console.error("⚠ Blockchain Vote Failed:", bcErr);
      // We still allow Mongo success but notify blockchain failure
    }

    res.json({ success: true, election });

  } catch (err) {
    console.log("❌ Vote Error:", err);
    res.status(500).json({ error: "Failed to vote" });
  }
};

export const fetchElectionResults = async (req, res) => {
  try {
    // ---------- BLOCKCHAIN LOGIC ----------
    const count = await votingContract.candidatesCount();

    let bcResults = [];
    for (let i = 1; i <= count; i++) {
      const c = await votingContract.candidates(i);

      bcResults.push({
        id: Number(i),
        name: c.name,
        votes: Number(c.voteCount)
      });
    }

    let totalVotes = bcResults.reduce((acc, c) => acc + c.votes, 0);

    // ---------- SEND RESULTS ----------
    res.json({
      success: true,
      candidates: bcResults,
      totalVotes
    });

  } catch (err) {
    console.error("Error fetching results:", err);
    res.status(500).json({ error: "Failed to fetch election results" });
  }
};