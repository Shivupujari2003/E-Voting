import express from "express";
import {
  registerUser,
  loginUser,
  verifyFace,
  checkWalletExists
} from "../controllers/authController.js";

import {
  createElection,
  getElections,
  deleteElection,
  castVote,
  getElectionResults
} from "../controllers/electionController.js";

const router = express.Router();

/* AUTH */
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-face", verifyFace);
router.post("/check-wallet", checkWalletExists);

/* ELECTION (MATCHING FRONTEND) */
router.post("/election", createElection);              // CREATE
router.get("/election", getElections);                 // GET ALL
router.delete("/election/:id", deleteElection);        // DELETE
router.post("/election/vote", castVote);               // VOTE
router.get("/election/:id/results", getElectionResults); // RESULTS

export default router;
