import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();

  // Read electionId from URL: /results?election=1
  const query = new URLSearchParams(location.search);
  const electionId = Number(query.get("election")) || 1;

  // Mock elections (same format as dashboard)
  const elections = [
    {
      id: 1,
      title: "Student Council President 2025",
      description: "Election for new president.",
      status: "closed",
      totalVotes: 12,
      endTime: new Date(Date.now() - 86400000),
      txHash: "0xABC123RESULTHASH",
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
      status: "closed",
      totalVotes: 45,
      endTime: new Date(Date.now() - 86400000 * 2),
      txHash: "0xXYZ987HASH2",
      candidates: [
        { id: 201, name: "Dana", votes: 25 },
        { id: 202, name: "Ethan", votes: 20 },
      ],
    },
  ];

  const election = elections.find((e) => e.id === electionId);
  if (!election) return <div className="p-8 text-center">Election not found</div>;

  const maxVotes = Math.max(...election.candidates.map((c) => c.votes));

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="container mx-auto px-4 py-10 max-w-4xl">

        <button
          onClick={() => navigate(-1)}
          className="mb-6 bg-white hover:bg-gray-100 px-4 py-2 rounded-lg shadow transition"
        >
          ← Back
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-2">{election.title}</h2>
          <p className="text-gray-600 mb-6">{election.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Total Votes</p>
              <p className="text-3xl font-bold text-blue-600">{election.totalVotes}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Candidates</p>
              <p className="text-3xl font-bold text-green-600">
                {election.candidates.length}
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-2xl font-bold text-purple-600">{election.status}</p>
            </div>
          </div>

          {/* Vote Distribution */}
          <h3 className="text-2xl font-bold mb-4">📊 Vote Distribution</h3>

          <div className="space-y-4 mb-10">
            {election.candidates.map((candidate) => {
              const percentage =
                election.totalVotes > 0
                  ? ((candidate.votes / election.totalVotes) * 100).toFixed(1)
                  : 0;

              const isWinner = candidate.votes === maxVotes;

              return (
                <div
                  key={candidate.id}
                  className={`p-4 rounded-lg border ${
                    isWinner ? "bg-yellow-100 border-yellow-500" : "bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isWinner && <span className="text-xl">🏆</span>}
                      <span className="font-semibold">{candidate.name}</span>
                    </div>

                    <span className="font-bold">
                      {candidate.votes} votes ({percentage}%)
                    </span>
                  </div>

                  <div className="bg-gray-300 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Blockchain Info */}
          <h3 className="text-2xl font-bold mb-4">🔗 Blockchain Verification</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Election Transaction Hash</p>
                <p className="font-mono text-blue-600 break-all">
                  {election.txHash}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Block Number</p>
                <p className="font-mono">#{Math.floor(Math.random() * 900000)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Finalized</p>
                <p className="font-semibold">
                  ✓ Finalized on{" "}
                  {new Date(election.endTime).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
