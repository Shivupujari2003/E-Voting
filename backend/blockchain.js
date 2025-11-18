import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const Voting = require("./contracts/Voting.json");

// Connect to Ganache
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");

// Get signer #0 (Ganache first account)
const signer = await provider.getSigner(0);

// Create contract instance
export const votingContract = new ethers.Contract(
  process.env.VOTING_CONTRACT,
  Voting.abi,
  signer
);

console.log("Backend Signer (Ganache Account #0):", await signer.getAddress());
