import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import QuickStats from "../components/QuickStats.jsx";
import ElectionCard from "../components/ElectionCard";
import VoteModal from "../components/VoteModal";

import { ethers } from "ethers";
import Voting from "../contracts/Voting.json"; // ABI
import { getElections } from "../services/api"; // Backend elections API

export default function VoterDashboard() {
  const navigate = useNavigate();

  // Logged-in user details
  const storedUser = JSON.parse(localStorage.getItem("user")) || {
    name: "User",
    walletAddress: "0x000000000000",
  };

  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [votedElections, setVotedElections] = useState([]);
  const [auditLog, setAuditLog] = useState([]);

  // ============================================================
  // 🔥 Fetch Elections From Backend (backend gives RAW ARRAY)
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      const response = await getElections();
      console.log("Backend response:", response);

      if (response.error) {
        console.error("Error fetching elections:", response.error);
      } else {
        // Backend returns `[ {...}, {...} ]`
        setElections(response || []);
      }
    };

    fetchData();
  }, []);

  // ============================================================
  // 🔥 Blockchain Vote Function (works with Vite env)
  // ============================================================
  const voteOnBlockchain = async (candidateId) => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not installed!");
        return null;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // ⭐ FIX: Vite env variable
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

      const contract = new ethers.Contract(contractAddress, Voting.abi, signer);

      const tx = await contract.vote(candidateId);
      const receipt = await tx.wait();

      return receipt;
    } catch (err) {
      console.error("Blockchain vote error:", err);
      alert("⚠ Voting failed. Check console.");
      return null;
    }
  };

  // ============================================================
  // 🔥 Handle Vote Completion
  // ============================================================
  const handleVoteSuccess = async (electionId, candidateId, candidateName) => {
    const receipt = await voteOnBlockchain(candidateId);
    if (!receipt) return;

    setVotedElections((prev) => [...prev, electionId]);

    setAuditLog((prev) => [
      {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        action: "VOTE_CAST",
        electionId,
        candidateId,
        candidateName,
        txHash: receipt.hash,
      },
      ...prev,
    ]);

    alert(`You voted for ${candidateName}!`);
  };

  // ============================================================
  // 🔥 Filter elections (use _id)
  // ============================================================
  const activeElections = elections.filter(
    (e) => e.status === "active" && !votedElections.includes(e._id)
  );

  const pastElections = elections.filter((e) => e.status !== "active");

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* Header */}
      <TopBar
        name={storedUser.name}
        walletAddress={storedUser.walletAddress}
        onLogout={() => navigate("/")}
      />

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <Sidebar navigate={navigate} />
          <QuickStats voted={votedElections.length} auditCount={auditLog.length} />
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">

          {/* Active Elections */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">🔴 Active Elections</h2>

            {activeElections.length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
                No active elections right now.
              </div>
            ) : (
              activeElections.map((el) => (
                <ElectionCard
                  key={el._id}
                  election={el}
                  onVote={() => setSelectedElection(el)}
                />
              ))
            )}
          </section>

          {/* Past Elections */}
          <section>
            <h2 className="text-2xl font-bold mb-4">📂 Past Elections</h2>

            {pastElections.map((el) => (
              <ElectionCard
                key={el._id}
                election={el}
                isPast
                onVote={() => navigate(`/results?election=${el._id}`)}
              />
            ))}
          </section>

        </main>
      </div>

      {/* Vote Modal */}
      {selectedElection && (
        <VoteModal
          election={selectedElection}
          onClose={() => setSelectedElection(null)}
          onSuccess={handleVoteSuccess}
        />
      )}
    </div>
  );
}
