import React from "react";

export default function ElectionCard({ election, isPast, onVote }) {
  const getRemaining = () => {
    const end = new Date(election.endTime);
    const now = new Date();
    const diff = end - now;

    if (diff < 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h remaining`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold mb-1">{election.title}</h3>
          <p className="text-gray-600">{election.description}</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            election.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {election.status === "active" ? "🔴 Active" : "✓ Closed"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        {!isPast && (
          <span className="text-sm text-gray-500">⏰ {getRemaining()}</span>
        )}
        {isPast && (
          <span className="text-sm text-gray-500">
            📊 {election.totalVotes} votes cast
          </span>
        )}

        <button
          onClick={onVote}
          className={`${
            isPast ? "bg-gray-600 hover:bg-gray-700" : "bg-blue-600 hover:bg-blue-700"
          } text-white px-6 py-2 rounded-lg transition`}
        >
          {isPast ? "View Results" : "Vote Now"}
        </button>
      </div>
    </div>
  );
}
