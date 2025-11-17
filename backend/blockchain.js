import { ethers } from "ethers";
import Voting from "./contracts/Voting.json" assert { type: "json" };

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

export const votingContract = new ethers.Contract(
  process.env.VOTING_CONTRACT,
  Voting.abi,
  signer
);
