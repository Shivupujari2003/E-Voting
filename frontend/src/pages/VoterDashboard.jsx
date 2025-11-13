import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";    
import TopBar from "../components/TopBar";
import QuickStats from "../components/QuickStats.jsx";
import ElectionCard from "../components/ElectionCard";
import VoteModal from "../components/VoteModal";

export default function VoterDashboard() {
  const navigate = useNavigate();

  // MOCK ELECTIONS
  const [elections, setElections] = useState([
    {
      id: 1,
      title: "Student Council President 2025",
      description: "Election for new president.",
      endTime: new Date(Date.now() + 86400000),
      status: "active",
      totalVotes: 12,
      candidates: [
        { id: 101, name: "Alice", votes: 6 },
        { id: 102, name: "Bob", votes: 4 },
        { id: 103, name: "Chris", votes: 2 },
      ],
    },
    {
      id: 2,
      title: "Open Source Council",
      description: "Vote for open-source representatives.",
      endTime: new Date(Date.now() - 86400000),
      status: "closed",
      totalVotes: 45,
      candidates: [
        { id: 201, name: "Dana", votes: 25 },
        { id: 202, name: "Ethan", votes: 20 },
      ],
    },
  ]);

  const [selectedElection, setSelectedElection] = useState(null);
  const [votedElections, setVotedElections] = useState([]);
  const [auditLog, setAuditLog] = useState([]);

  const activeElections = elections.filter(
    (e) => e.status === "active" && !votedElections.includes(e.id)
  );
  const pastElections = elections.filter((e) => e.status !== "active");

  const handleVoteSuccess = (electionId, txHash, candidateId, candidateName) => {
    setVotedElections((prev) => [...prev, electionId]);

    // Update local votes
    setElections((prev) =>
      prev.map((e) =>
        e.id === electionId
          ? {
              ...e,
              totalVotes: e.totalVotes + 1,
              candidates: e.candidates.map((c) =>
                c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
              ),
            }
          : e
      )
    );

    // Add audit log entry
    setAuditLog((prev) => [
      {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        action: "VOTE_CAST",
        electionId,
        candidateId,
        candidateName,
        txHash,
      },
      ...prev,
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <TopBar onLogout={() => navigate("/")} />

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">

        <aside className="lg:col-span-1">
          <Sidebar navigate={navigate} />
          <QuickStats voted={votedElections.length} auditCount={auditLog.length} />
        </aside>

        <main className="lg:col-span-3">
          {/* Active Elections */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">🔴 Active Elections</h2>
            {activeElections.length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
                No active elections right now.
              </div>
            ) : (
              activeElections.map((e) => (
                <ElectionCard key={e.id} election={e} onVote={() => setSelectedElection(e)} />
              ))
            )}
          </section>

          {/* Past Elections */}
          <section>
            <h2 className="text-2xl font-bold mb-4">📂 Past Elections</h2>
            {pastElections.map((e) => (
              <ElectionCard
                key={e.id}
                election={e}
                isPast
                onVote={() => navigate(`/results?election=${e.id}`)}
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
