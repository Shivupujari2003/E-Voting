import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import QuickStats from "../components/QuickStats.jsx";
import ElectionCard from "../components/ElectionCard";
import VoteModal from "../components/VoteModal";
import { ethers } from "ethers";


export default function VoterDashboard() {
  const navigate = useNavigate();

  // Load user from localStorage (THIS IS SAFE, not a hook)
  const storedUser = JSON.parse(localStorage.getItem("user")) || {
    name: "User",
    walletAddress: "0x000000000000",
  };

  // All hooks must remain in SAME ORDER
  const [elections] = useState([
    {
      id: "el1",
      title: "College President Election",
      description: "Vote for the next student body president.",
      candidates: [
        { id: "c1", name: "Alice", votes: 12 },
        { id: "c2", name: "Bob", votes: 9 },
      ],
      status: "active",
    },
    {
      id: "el2",
      title: "Tech Club Leader",
      description: "Choose the next tech club head.",
      candidates: [
        { id: "c3", name: "Charlie", votes: 20 },
        { id: "c4", name: "Diana", votes: 17 },
      ],
      status: "completed",
    },
  ]);

  const [selectedElection, setSelectedElection] = useState(null);
  const [votedElections, setVotedElections] = useState([]);
  const [auditLog, setAuditLog] = useState([]);

  // 🔥 Simulate vote
  const handleVoteSuccess = async(electionId, candidateId, candidateName) => {
    setVotedElections((prev) => [...prev, electionId]);
   

    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const tx = await votingContract.connect(signer).vote(candidateId);
    await tx.wait();


    setAuditLog((prev) => [
      {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        action: "VOTE_CAST",
        electionId,
        candidateId,
        candidateName,
        txHash: "0xSTATIC_FAKE_HASH",
      },
      ...prev,
    ]);

    alert(`You voted for ${candidateName}!`);
  };

  const activeElections = elections.filter(
    (e) => e.status === "active" && !votedElections.includes(e.id)
  );

  const pastElections = elections.filter((e) => e.status !== "active");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* FIX: Pass name + wallet */}
      <TopBar
        name={storedUser.name}
        walletAddress={storedUser.walletAddress}
        onLogout={() => navigate("/")}
      />

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <Sidebar navigate={navigate} />
          <QuickStats voted={votedElections.length} auditCount={auditLog.length} />
        </aside>

        <main className="lg:col-span-3">

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">🔴 Active Elections</h2>

            {activeElections.length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
                No active elections right now.
              </div>
            ) : (
              activeElections.map((el) => (
                <ElectionCard
                  key={el.id}
                  election={el}
                  onVote={() => setSelectedElection(el)}
                />
              ))
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">📂 Past Elections</h2>

            {pastElections.map((el) => (
              <ElectionCard
                key={el.id}
                election={el}
                isPast
                onVote={() => navigate(`/results?election=${el.id}`)}
              />
            ))}
          </section>

        </main>
      </div>

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
