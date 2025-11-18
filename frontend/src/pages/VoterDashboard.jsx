import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import QuickStats from "../components/QuickStats.jsx";
import ElectionCard from "../components/ElectionCard";
import VoteModal from "../components/VoteModal";

import { castVote, getElections } from "../services/api";

export default function VoterDashboard() {
  const navigate = useNavigate();

  // ⭐ Get logged-in user from local storage
  const storedUser = JSON.parse(localStorage.getItem("user")) || {
    name: "Unknown User",
    _id: null,
  };

  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [votedElections, setVotedElections] = useState([]);
  const [auditLog, setAuditLog] = useState([]);

  // ============================================================
  // 🔥 Fetch Elections From Backend
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      const response = await getElections();
      console.log("Elections:", response);

      if (!response.error) {
        setElections(response);
      }
    };

    fetchData();
  }, []);

  // ============================================================
  // 🔥 SIMPLE BACKEND VOTE (NO BLOCKCHAIN)
  // ============================================================
  const voteOnBackend = async (electionId, candidateId) => {
    try {
      const res = await castVote(electionId, candidateId, storedUser._id);
      return res;
    } catch (err) {
      console.error("Vote error:", err);
      alert("⚠ Voting failed!");
      return null;
    }
  };

  // ============================================================
  // 🔥 After Vote Success
  // ============================================================
  const handleVoteSuccess = async (electionId, candidateId, candidateName) => {
    const result = await voteOnBackend(electionId, candidateId);

    console.log("🔍 Vote response:", result);

    if (!result || result.error) {
      alert("Vote failed: " + (result.error || "Unknown error"));
      return;
    }

    // Mark election as voted
    setVotedElections((prev) => [...prev, electionId]);

    // Add to audit log
    setAuditLog((prev) => [
      {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        action: "VOTE_CAST",
        electionId,
        candidateId,
        candidateName,
      },
      ...prev,
    ]);

    alert(`You voted for ${candidateName}!`);
  };

  // ============================================================
  // 🔥 Sorting elections
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
