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

import { fetchUserProfile } from "../controllers/profileController.js";

const router = express.Router();

/* AUTH */
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-face", verifyFace);
router.post("/check-wallet", checkWalletExists);

/* ELECTION */
router.post("/election/create", createElection);
router.get("/election/all", getElections);

router.post("/election/vote", castVote);  
// router.get("/election/results", fetchElectionResults);
router.get("/election/all-results", fetchElectionResults);


router.delete("/election/:id", deleteElection); 

/* PROFILE */
router.get("/user/:userId", fetchUserProfile);

export default router;
