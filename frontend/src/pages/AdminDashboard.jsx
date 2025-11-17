import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";
import { getElections, createElection, deleteElection } from "../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("create");
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newElection, setNewElection] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    candidates: [],
  });

  const [candidateName, setCandidateName] = useState("");

  /* ------------------------------------------------------
      AUTO REFRESH DATA EVERY 10 SECONDS
  ------------------------------------------------------- */
  useEffect(() => {
    loadElections();
    const interval = setInterval(loadElections, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadElections = async () => {
    setLoading(true);
    const data = await getElections();
    if (!data.error) setElections(data);
    setLoading(false);
  };

  /* ------------------------------------------------------
      ADD CANDIDATE
  ------------------------------------------------------- */
  const addCandidate = () => {
    if (!candidateName.trim()) return;

    setNewElection({
      ...newElection,
      candidates: [
        ...newElection.candidates,
        { id: Date.now().toString(), name: candidateName, votes: 0 },
      ],
    });

    setCandidateName("");
  };

  /* ------------------------------------------------------
      CREATE ELECTION
  ------------------------------------------------------- */
  const handleCreateElection = async () => {
    if (!newElection.title || newElection.candidates.length < 2) {
      alert("Add title and at least 2 candidates.");
      return;
    }

    if (!newElection.startTime || !newElection.endTime) {
      alert("Please select start & end time.");
      return;
    }

    const res = await createElection(newElection);

    if (res.success) {
      alert("Election created!");
      setNewElection({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        candidates: [],
      });
      loadElections();
    } else {
      alert(res.error || "Failed to create election");
    }
  };

  /* ------------------------------------------------------
      DELETE ELECTION
  ------------------------------------------------------- */
  const handleDeleteElection = async (id) => {
    if (!window.confirm("Delete this election?")) return;

    const res = await deleteElection(id);

    if (res.success) loadElections();
    else alert(res.error || "Failed to delete election");
  };

  /* ------------------------------------------------------
      COUNTDOWN HELPER
  ------------------------------------------------------- */
  const getRemainingTime = (endTime) => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar
        name="Admin User"
        walletAddress="0xAdmin123...ABCD"
        onLogout={() => navigate("/")}
      />

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 px-4 py-8">
        
        {/* ---------------------- SIDEBAR ---------------------- */}
        <aside className="lg:col-span-1">
          <Sidebar navigate={navigate} isAdmin />

          <div className="bg-white rounded-xl shadow p-4 mt-6">
            <p className="font-bold mb-3">Admin Sections</p>

            {["create", "manage"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`block w-full text-left px-4 py-3 rounded-lg mb-2 transition ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {tab === "create" && "➕ Create Election"}
                {tab === "manage" && "🗳 Manage Elections"}
              </button>
            ))}
          </div>
        </aside>


        {/* ---------------------- MAIN CONTENT ---------------------- */}
        <main className="lg:col-span-3">

          {/* -------------------------------- CREATE ELECTION -------------------------------- */}
          {activeTab === "create" && (
            <div className="bg-white rounded-xl shadow p-8">
              <h2 className="text-2xl font-bold mb-6">Create New Election</h2>

              <div className="space-y-4">

                {/* TITLE */}
                <input
                  type="text"
                  placeholder="Election Title"
                  value={newElection.title}
                  onChange={(e) =>
                    setNewElection({ ...newElection, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />

                {/* DESCRIPTION */}
                <textarea
                  placeholder="Description"
                  value={newElection.description}
                  onChange={(e) =>
                    setNewElection({
                      ...newElection,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />

                {/* TIME */}
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="datetime-local"
                    value={newElection.startTime}
                    onChange={(e) =>
                      setNewElection({ ...newElection, startTime: e.target.value })
                    }
                    className="px-4 py-2 border rounded-lg"
                  />

                  <input
                    type="datetime-local"
                    value={newElection.endTime}
                    onChange={(e) =>
                      setNewElection({ ...newElection, endTime: e.target.value })
                    }
                    className="px-4 py-2 border rounded-lg"
                  />
                </div>

                {/* CANDIDATES */}
                <div>
                  <label className="font-medium">Candidates</label>

                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="Candidate Name"
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button
                      onClick={addCandidate}
                      className="bg-green-600 text-white px-5 rounded-lg"
                    >
                      Add
                    </button>
                  </div>

                  {newElection.candidates.map((c) => (
                    <div
                      key={c.id}
                      className="bg-gray-100 p-3 rounded-lg flex justify-between mt-2"
                    >
                      {c.name}
                      <button
                        className="text-red-500"
                        onClick={() =>
                          setNewElection({
                            ...newElection,
                            candidates: newElection.candidates.filter(
                              (x) => x.id !== c.id
                            ),
                          })
                        }
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* SUBMIT */}
                <button
                  onClick={handleCreateElection}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg"
                >
                  Create Election
                </button>
              </div>
            </div>
          )}

          {/* -------------------------------- MANAGE ELECTIONS -------------------------------- */}
          {activeTab === "manage" && (
            <div className="bg-white rounded-xl shadow p-8">
              <h2 className="text-2xl font-bold mb-6">Manage Elections</h2>

              {loading ? (
                <p>Loading...</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Votes</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {elections.map((e) => (
                      <tr key={e._id} className="border-b">
                        <td className="px-4 py-3">{e.title}</td>

                        <td className="px-4 py-3 capitalize">
                          {e.status === "active" ? (
                            <span className="text-green-600 font-semibold">
                              Active • {getRemainingTime(e.endTime)}
                            </span>
                          ) : (
                            <span className="text-red-600 font-semibold">
                              Completed
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">{e.totalVotes}</td>

                        <td className="px-4 py-3 flex gap-3">
                          <button
                            className="text-blue-600"
                            onClick={() =>
                              navigate(`/results?election=${e._id}`)
                            }
                          >
                            View Results
                          </button>

                          <button
                            className="text-red-600"
                            onClick={() => handleDeleteElection(e._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
