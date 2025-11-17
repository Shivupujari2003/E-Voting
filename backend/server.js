import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { votingContract } from "./blockchain.js";  // <-- correct import

const app = express();

// --- Ensure folders exist ---
["dataset", "encodings", "temp"].forEach((folder) => {
  const dir = path.join(process.cwd(), folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Connect DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);

// Static routes (optional)
app.use("/encodings", express.static("encodings"));
app.use("/dataset", express.static("dataset"));

const PORT = 5000;

app.listen(PORT, () =>
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
);
