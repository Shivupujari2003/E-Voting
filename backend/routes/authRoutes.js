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
  fetchElectionResults
} from "../controllers/electionController.js";

import {
  // updateUserProfile,
  // updateUserFace,
  fetchUserProfile
} from "../controllers/profileController.js";

const router = express.Router();

/* AUTH */
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-face", verifyFace);
router.post("/check-wallet", checkWalletExists);

/* ELECTION (MATCHING FRONTEND) */
router.post("/election/create", createElection);              // CREATE
router.get("/election/all", getElections);                 // GET ALL
router.delete("/election/:id", deleteElection);        // DELETE
router.post("/election/vote", castVote);               // VOTE
router.get("/election/:id/results", fetchElectionResults); // RESULTS

/* PROFILE */
router.get("/user/:userId", fetchUserProfile);
// router.put("/user/:userId", updateUserProfile);
// router.put("/user/:userId/face", updateUserFace);

export default router;
