import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";    
import TopBar from "../components/TopBar";
import QuickStats from "../components/QuickStats.jsx";
import ElectionCard from "../components/ElectionCard";
import VoteModal from "../components/VoteModal";
import { getElections, castVote } from "../services/api";

export default function VoterDashboard() {
  const navigate = useNavigate();

  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [votedElections, setVotedElections] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getElections();
        setElections(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVoteSuccess = async (electionId, candidateId, candidateName) => {
    try {
      const { txHash, updatedElection } = await castVote(electionId, candidateId);

      // Mark election as voted
      setVotedElections((prev) => [...prev, electionId]);

      // Update local election
      setElections((prev) =>
        prev.map((e) => (e.id === electionId ? updatedElection : e))
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
    } catch (err) {
      alert("Failed to cast vote: " + err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading elections...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const activeElections = elections.filter(
    (e) => e.status === "active" && !votedElections.includes(e.id)
  );
  const pastElections = elections.filter((e) => e.status !== "active");

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
