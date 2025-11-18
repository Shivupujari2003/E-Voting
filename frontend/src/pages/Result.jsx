// pages/AllResults.js (Recommended new file name)
import React, { useEffect, useState } from "react";
// We no longer need useLocation or URLSearchParams since we fetch ALL results
import { useNavigate } from "react-router-dom"; 
// 💡 FIX: Explicitly specify the .js extension for module resolution
import { fetchElectionResults } from "../services/api.js"; 

export default function AllResults() { // Renamed component
  const navigate = useNavigate();

  const [elections, setElections] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAllResults = async () => {
      try {
        const data = await fetchElectionResults(); 
        
        if (!data || data.error || !data.elections) {
          setError(data?.error || "Failed to load all election results");
        } else {
          // Store the array of elections returned from the backend
          setElections(data.elections); 
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching all results");
      } finally {
        setLoading(false);
      }
    };

    loadAllResults();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) return <div className="p-8 text-center">Loading all election results...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  
  if (elections.length === 0) 
    return <div className="p-8 text-center">No elections have been finalized yet.</div>;


  // The component now maps through the list of elections
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        
        <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
            🗳️ Final Election Results
        </h1>
        <hr className="mb-8" />

        {/* --- Loop Through All Elections --- */}
        <div className="space-y-8">
          {elections.map((election) => (
            // The election object now contains pre-calculated 'winner', 'winningVotes', and 'status'
            <div 
              key={election._id} 
              className="bg-white rounded-xl shadow-lg p-6 border-l-8 border-blue-500"
            >
              <h2 className="text-3xl font-bold mb-2 text-blue-800">{election.title}</h2>
              <p className="text-gray-600 mb-4">Total Votes: <span className="font-bold">{election.totalVotes}</span></p>

              {/* Winner Block */}
              <div 
                className={`p-4 rounded-lg flex justify-between items-center ${
                  election.status === "TIE" 
                    ? "bg-red-100 border-red-500 border-2" 
                    : "bg-green-100 border-green-500 border-2"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    {election.status === "TIE" ? "Tied Candidates" : "Election Winner"}
                  </p>
                  <p className="text-2xl font-extrabold text-gray-800">
                    {election.winner} 
                    {election.status === "WINNER" && <span className="ml-2">🏆</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">Winning/Tied Votes</p>
                  <p className="text-3xl font-bold text-green-700">{election.winningVotes}</p>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mt-6 mb-3">📊 Candidate Votes</h3>
              <div className="space-y-3">
                {election.candidates.map((candidate) => {
                  // Use candidate.votes from the backend's corrected structure
                  const percentage = election.totalVotes
                    ? ((candidate.votes / election.totalVotes) * 100).toFixed(1) 
                    : 0;
                  // Use candidate.votes for comparison
                  const isWinnerOrTied = Number(candidate.votes) === election.winningVotes; 

                  return (
                    <div
                      key={candidate.id}
                      className={`p-3 rounded-lg border ${
                        isWinnerOrTied ? "bg-yellow-50 border-yellow-300" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">{candidate.name}</span>
                        <span className="font-bold">
                          {/* Display candidate.votes */}
                          {candidate.votes} votes ({percentage}%)
                        </span>
                      </div>

                      <div className="bg-gray-300 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}