// backend/server.js (ESM version)
import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI ||
      "mongodb+srv://sagarib1710_db_user:sagarbangari@cluster0.jmxbee5.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// ====== Models ======
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  contact: String,
  walletAddress: { type: String, unique: true, sparse: true },
  password: String,
  role: { type: String, enum: ["voter", "admin"], default: "voter" },
  faceVerified: Boolean,
  faceEmbedding: [Number],
  createdAt: { type: Date, default: Date.now },
});

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

const voteSchema = new mongoose.Schema({
  electionId: String,
  voterId: String,
  candidateId: String,
  txHash: String,
  blockNumber: Number,
  confidence: Number,
  createdAt: { type: Date, default: Date.now },
});

const auditSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  actionType: String,
  actor: String,
  walletAddress: String,
  electionId: String,
  details: String,
  status: String,
  txHash: String,
});

const User = mongoose.model("User", userSchema);
const Election = mongoose.model("Election", electionSchema);
const Vote = mongoose.model("Vote", voteSchema);
const AuditLog = mongoose.model("AuditLog", auditSchema);

// ===== Middleware =====
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// ========== ROUTES ==========

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, contact, walletAddress } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });

    user = new User({
      name,
      email,
      contact,
      walletAddress,
      faceVerified: true,
      faceEmbedding: Array(128).fill(Math.random()),
    });

    await user.save();

    await AuditLog.create({
      actionType: "REGISTRATION",
      actor: walletAddress,
      walletAddress,
      details: `User ${name} registered`,
      status: "success",
    });

    broadcast({ type: "new_user", data: { userId: user._id, name, email } });

    const token = jwt.sign(
      { id: user._id, email, role: "voter" },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      userId: user._id,
      token,
      message: "Registration successful",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, walletAddress } = req.body;
    let user;

    if (email && password) {
      user = await User.findOne({ email, password });
      if (!user)
        return res.status(401).json({ error: "Invalid email or password" });
    } else if (walletAddress) {
      user = await User.findOne({ walletAddress });
      if (!user) return res.status(401).json({ error: "Wallet not registered" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== WebSockets =====
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);

  ws.on("close", () => clients.delete(ws));
});

function broadcast(data) {
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket running`);
});
