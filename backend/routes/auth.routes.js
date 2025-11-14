import express from "express";
import User from "../models/user.js";
import Election from "../models/election.js";
import Application from "../models/application.js";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// -------------------- AUTH --------------------

// REGISTER
router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, contact, password, walletAddress } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const user = new User({ name, email, contact, password, walletAddress });
    await user.save();
    execSync(`py -3.11 ../face_recognition/data_collection.py ${name}`, { stdio: "inherit" });
    execSync(`py -3.11 ../face_recognition/feature_encoding.py ${id}`, { stdio: "inherit" });
    res.status(201).json({ message: "Registration successful", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password, walletAddress } = req.body;

    let user;
    if (email && password) {
      user = await User.findOne({ email, password });
      if (!user) return res.status(401).json({ error: "Invalid email or password" });
    } else if (walletAddress) {
      user = await User.findOne({ walletAddress });
      if (!user) return res.status(401).json({ error: "Wallet not registered" });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN LOGIN
router.post("/auth/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, password, role: "admin" });
    if (!admin) return res.status(401).json({ error: "Invalid admin credentials" });

    const token = jwt.sign({ id: admin._id, email: admin.email, role: admin.role }, JWT_SECRET, { expiresIn: "24h" });

    res.json({ message: "Admin login successful", token, user: admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- USER --------------------

// GET PROFILE
router.get("/user/profile", async (req, res) => {
  try {
    // token verification could be added here
    const userId = req.userId; 
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE PROFILE
router.put("/user/profile", async (req, res) => {
  try {
    const userId = req.userId;
    const { email, contact } = req.body;
    const user = await User.findByIdAndUpdate(userId, { email, contact }, { new: true });
    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE FACE
router.post("/user/face-update", async (req, res) => {
  try {
    const userId = req.userId;
    // Implement actual face update logic
    res.json({ message: "Face update simulated for user " + userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- ELECTIONS --------------------

// GET ELECTIONS
router.get("/elections", async (req, res) => {
  try {
    const elections = await Election.find();
    res.json(elections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE ELECTION
router.post("/elections", async (req, res) => {
  try {
    const election = new Election(req.body);
    await election.save();
    res.status(201).json({ message: "Election created", election });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ELECTION
router.delete("/elections/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Election.findByIdAndDelete(id);
    res.json({ message: "Election deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CAST VOTE
router.post("/elections/:id/vote", async (req, res) => {
  try {
    const { id } = req.params;
    const { candidateId } = req.body;

    const election = await Election.findById(id);
    if (!election) return res.status(404).json({ error: "Election not found" });

    // Update candidate votes
    const candidate = election.candidates.id(candidateId);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    candidate.votes += 1;
    election.totalVotes += 1;
    await election.save();

    const txHash = "0x" + Math.floor(Math.random() * 1e16).toString(16); // simulate blockchain tx
    res.json({ message: "Vote cast", txHash, updatedElection: election });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ELECTION RESULTS
router.get("/elections/:id/results", async (req, res) => {
  try {
    const { id } = req.params;
    const election = await Election.findById(id);
    if (!election) return res.status(404).json({ error: "Election not found" });
    res.json(election);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- APPLICATIONS --------------------

// GET APPLICATIONS
router.get("/applications", async (req, res) => {
  try {
    const applications = await Application.find();
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// HANDLE APPLICATION (approve/reject)
router.patch("/applications/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const app = await Application.findByIdAndUpdate(id, { status }, { new: true });
    res.json({ message: "Application updated", application: app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;



router.post("/face/verify", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  try {
    console.log(`🔍 Verifying face for ID: ${id}`);
    let result = "FAILED";

    // Loop until face recognition succeeds
    while (result === "FAILED") {
      // This will run your Python script; stdio: "inherit" prints output to server console
      result = execSync(`py -3.11 ../face_recognition/face_recog.py ${id}`, {
        stdio: "inherit",
      }).toString().trim();
    }

    return res.json({ success: true, message: "Face verified successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});
