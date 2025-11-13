import React from "react";

export default function QuickStats({ voted, auditCount }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <h3 className="font-semibold mb-4">📊 Quick Stats</h3>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">Elections Participated</p>
          <p className="text-2xl font-bold text-blue-600">{voted}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Votes Cast</p>
          <p className="text-2xl font-bold text-green-600">{voted}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Audit Logs</p>
          <p className="text-2xl font-bold text-purple-600">{auditCount}</p>
        </div>
      </div>
    </div>
  );
}
