import React, { useState } from "react";

export default function VoteModal({ election, onClose, onSuccess }) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const submitVote = () => {
    if (!selectedCandidate) return alert("Please select a candidate");

    onSuccess(
      election._id,
      selectedCandidate.id,
      selectedCandidate.name
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xl w-full border">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-3xl font-bold tracking-tight">Cast Your Vote</h2>
          <button
            className="text-2xl font-bold text-gray-500 hover:text-black transition"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Step — Choose Candidate */}
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Select Your Candidate</h3>

        <div className="space-y-4 mb-6">
          {election.candidates.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCandidate(c)}
              className={`p-4 border rounded-xl cursor-pointer transition shadow-sm hover:shadow-md text-lg font-medium ${
                selectedCandidate?.id === c.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 bg-white"
              }`}
            >
              {c.name}
            </div>
          ))}
        </div>

        <button
          disabled={!selectedCandidate}
          onClick={submitVote}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Submit Vote
        </button>

      </div>
    </div>
  );
}