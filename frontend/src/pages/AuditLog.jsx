import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AuditLogPage() {
  const navigate = useNavigate();

  // 🔹 Mock audit logs (since AppContext removed)
  const [auditLogs] = useState([
    {
      id: 1,
      timestamp: Date.now(),
      actionType: "VOTE_CAST",
      actor: "0x1234abcd....5678",
      details: "User voted for Candidate Alice in Election #1",
      status: "success",
    },
    {
      id: 2,
      timestamp: Date.now() - 500000,
      actionType: "CANDIDATE_APPROVED",
      actor: "admin@voting.com",
      details: "Admin approved candidate 'John Doe'",
      status: "approved",
    },
    {
      id: 3,
      timestamp: Date.now() - 2500000,
      actionType: "FACE_AUTH_SUCCESS",
      actor: "0x99ab12ef...8877",
      details: "Face authentication successful",
      status: "success",
    },
  ]);

  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // 🔍 Filtering logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchesType =
      filterType === "all" ||
      log.actionType.toLowerCase().includes(filterType.toLowerCase());

    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesSearch;
  });

  // 🎨 Badge color
  const getActionColor = (type) => {
    if (type.includes("VOTE")) return "bg-blue-100 text-blue-800";
    if (type.includes("APPROVED") || type.includes("SUCCESS"))
      return "bg-green-100 text-green-800";
    if (type.includes("FAILED") || type.includes("REJECTED"))
      return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  // 📥 Export CSV
  const exportCSV = () => {
    const csv = [
      ["Timestamp", "Action Type", "Actor", "Details", "Status"],
      ...filteredLogs.map((log) => [
        new Date(log.timestamp).toLocaleString(),
        log.actionType,
        log.actor,
        log.details,
        log.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "audit_log.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 bg-white hover:bg-gray-100 px-4 py-2 rounded-lg shadow-sm transition"
        >
          ← Back
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">🔍 Audit Log</h2>

            <button
              onClick={exportCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              📥 Export CSV
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 font-medium">Filter by Action Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
              >
                <option value="all">All Actions</option>
                <option value="vote">Votes</option>
                <option value="face">Face Authentication</option>
                <option value="candidate">Candidate Actions</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by actor or details..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left">Timestamp</th>
                  <th className="px-4 py-3 text-left">Action Type</th>
                  <th className="px-4 py-3 text-left">Actor</th>
                  <th className="px-4 py-3 text-left">Details</th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-200">
                    <td className="px-4 py-3 text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(
                          log.actionType
                        )}`}
                      >
                        {log.actionType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">
                      {log.actor.length > 20
                        ? log.actor.substring(0, 10) + "..."
                        : log.actor}
                    </td>
                    <td className="px-4 py-3 text-sm">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No audit logs found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
