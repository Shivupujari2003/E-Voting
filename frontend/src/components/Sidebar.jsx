import React from "react";

export default function Sidebar({ navigate }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <nav className="space-y-2">
        <button className="w-full text-left px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold">
          🗳 Elections
        </button>

        <button
          onClick={() => navigate("/results")}
          className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition"
        >
          📊 Results
        </button>

        <button
          onClick={() => navigate("/audit-log")}
          className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition"
        >
          🔍 Audit Log
        </button>

        <button
          onClick={() => navigate("/profile")}
          className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition"
        >
          👤 Profile
        </button>

        <button
          onClick={() => navigate("/apply-candidate")}
          className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition"
        >
          📝 Apply as Candidate
        </button>
      </nav>
    </div>
  );
}
