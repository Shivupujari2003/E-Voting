import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const Voting = require("./contracts/Voting.json");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

export const votingContract = new ethers.Contract(
  process.env.VOTING_CONTRACT,
  Voting.abi,
  signer
);
