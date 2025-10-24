

const { ethers } = require("hardhat");
const prompt = require("prompt-sync")({ sigint: true });
const { execSync } = require("child_process");

// --------------------------
// Face Recognition Helpers (OFF-CHAIN)
// --------------------------
function collectFaceData(id) {
  console.log(`📸 Collecting face data for ID: ${id}`);
  execSync(`py -3.11 ../face_recognition/data_collection.py ${id}`, { stdio: "inherit" });
}

function encodeFaceData(id) {
  console.log(`⚙️ Encoding face data for ID: ${id}`);
  execSync(`py -3.11 ../face_recognition/feature_encoding.py ${id}`, { stdio: "inherit" });
}

function verifyFace(id) {
  console.log(`🔍 Verifying face for ID: ${id}`);
  let result = "FAILED";
  while (result === "FAILED") {
    result = execSync(`py -3.11 ../face_recognition/face_recog.py ${id}`, { stdio: "inherit" });
  }
  return true; // returns true once recognition succeeds
}

// --------------------------
// Blockchain Helpers (ON-CHAIN)
// --------------------------
async function withRetry(fn, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.code === "ECONNRESET" || err.reason?.includes("insufficient funds")) {
        console.warn(`⚠️ Attempt ${i + 1} failed: ${err.code || err.reason}. Retrying...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error("❌ Max retries reached. Ganache may have stopped.");
}

async function main() {
  const numVoters = parseInt(prompt("Enter number of voters: "));
  if (isNaN(numVoters) || numVoters < 1) {
    console.log("Invalid number of voters.");
    return;
  }

  // Blockchain setup
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");
  const [admin] = await ethers.getSigners();

  const Voting = await ethers.getContractFactory("Voting");
  const voting = await withRetry(() => Voting.connect(admin).deploy());
  await voting.deployed();
  console.log("\n✅ Voting contract deployed at:", voting.address);

  // Add candidates
  const candidates = ["Alice", "Bob"];
  for (const name of candidates) {
    await withRetry(() => voting.connect(admin).addCandidate(name));
  }
  console.log("✅ Candidates added:", candidates.join(", "));

  // Register voters (off-chain + on-chain combined)
  const voters = [];
  for (let i = 0; i < numVoters; i++) {
    const wallet = ethers.Wallet.createRandom().connect(provider);
    voters.push(wallet);

    // Fund voter
    await withRetry(() =>
      admin.sendTransaction({
        to: wallet.address,
        value: ethers.utils.parseEther("1")
      })
    );

    // Face Recognition (OFF-CHAIN)
    const id = prompt("Enter your ID for registration: ");
    collectFaceData(id);
    encodeFaceData(id);

    // Blockchain Registration (ON-CHAIN)
    await withRetry(() => voting.connect(admin).registerVoter(wallet.address));
    console.log(`✅ Voter ${i + 1} registered on-chain: ${wallet.address}`);
  }

  // Start election
  await withRetry(() => voting.connect(admin).startElection());
  console.log("\n🚀 Election started!\n");

  // Voting phase
  for (let i = 0; i < voters.length; i++) {
    const vid = prompt(`\nVoter ${i + 1} (${voters[i].address}), enter your ID for verification: `);

    // Face Recognition (OFF-CHAIN)
    verifyFace(vid);

    // Voting (ON-CHAIN)
    let candidateId;
    while (true) {
      candidateId = parseInt(prompt(`Enter candidate ID to vote (1-${candidates.length}): `));
      if (candidateId >= 1 && candidateId <= candidates.length) break;
      console.log("❌ Invalid candidate ID. Try again.");
    }

    await withRetry(() => voting.connect(voters[i]).vote(candidateId));
    console.log(`🗳️ Voter ${voters[i].address} voted for candidate ${candidateId}`);
  }

  // Results
  console.log("\n📊 Election Results:");
  for (let i = 1; i <= candidates.length; i++) {
    const candidate = await voting.getCandidate(i);
    console.log(`Candidate ${i}: ${candidate[0]}, Votes: ${candidate[1].toString()}`);
  }
}

// Global error catcher
main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
});
