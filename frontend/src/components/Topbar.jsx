import React from "react";

export default function TopBar({ onLogout }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👤</span>
          <div>
            <p className="font-semibold">Logged in User</p>
            <p className="text-sm text-gray-500 font-mono">0xAbc123...789</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
