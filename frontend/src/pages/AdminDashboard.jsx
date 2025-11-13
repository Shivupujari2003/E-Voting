import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Mock Elections
  const [elections, setElections] = useState([
    {
      id: 1,
      title: "Student Council President 2025",
      description: "Choose the next student council president",
      startTime: "",
      endTime: "",
      status: "active",
      totalVotes: 52,
      candidates: [
        { id: 1, name: "Aarav", votes: 21 },
        { id: 2, name: "Riya", votes: 31 },
      ],
    },
    {
      id: 2,
      title: "Open Source Committee",
      description: "Election for open-source contributors",
      status: "upcoming",
      totalVotes: 0,
      candidates: [
        { id: 1, name: "Dev", votes: 0 },
        { id: 2, name: "Neha", votes: 0 },
      ],
    },
  ]);

  // Mock Applications
  const [applications, setApplications] = useState([
    {
      id: 100,
      name: "Sandeep Kumar",
      email: "sandeep@example.com",
      electionId: 1,
      electionTitle: "Student Council President 2025",
      submittedAt: new Date().toISOString(),
      status: "pending",
    },
  ]);

  const [activeTab, setActiveTab] = useState("create");

  // New Election Form
  const [newElection, setNewElection] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    candidates: [],
  });

  const [candidateName, setCandidateName] = useState("");

  const addCandidate = () => {
    if (!candidateName.trim()) return;
    setNewElection({
      ...newElection,
      candidates: [
        ...newElection.candidates,
        { id: Date.now(), name: candidateName },
      ],
    });
    setCandidateName("");
  };

  const createElection = () => {
    if (
      !newElection.title ||
      !newElection.description ||
      newElection.candidates.length < 2
    ) {
      alert("Please fill all fields and add at least 2 candidates.");
      return;
    }

    const createdElection = {
      ...newElection,
      id: Date.now(),
      status: "upcoming",
      totalVotes: 0,
    };

    setElections((prev) => [...prev, createdElection]);

    alert("Election created successfully!");

    setNewElection({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      candidates: [],
    });
  };

  const handleApplicationAction = (id, action) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: action } : app
      )
    );
  };

  const handleDeleteElection = (id) => {
    if (!window.confirm("Delete this election?")) return;
    setElections(elections.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar title="Admin Dashboard" onLogout={() => navigate("/")} />

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 px-4 py-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <Sidebar navigate={navigate} isAdmin />

          {/* Admin Tabs */}
          <div className="bg-white rounded-xl shadow p-4 mt-6">
            <p className="font-bold mb-3">Admin Sections</p>

            {["create", "applications", "manage"].map((tab) => (
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
                {tab === "applications" && "📋 Review Applications"}
                {tab === "manage" && "🗳 Manage Elections"}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {/* CREATE ELECTION */}
          {activeTab === "create" && (
            <div className="bg-white rounded-xl shadow p-8">
              <h2 className="text-2xl font-bold mb-6">Create New Election</h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Election Title"
                  value={newElection.title}
                  onChange={(e) =>
                    setNewElection({ ...newElection, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />

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

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="datetime-local"
                    value={newElection.startTime}
                    onChange={(e) =>
                      setNewElection({
                        ...newElection,
                        startTime: e.target.value,
                      })
                    }
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="datetime-local"
                    value={newElection.endTime}
                    onChange={(e) =>
                      setNewElection({
                        ...newElection,
                        endTime: e.target.value,
                      })
                    }
                    className="px-4 py-2 border rounded-lg"
                  />
                </div>

                {/* Candidates */}
                <div>
                  <label className="font-medium">Candidates</label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Candidate Name"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button
                      onClick={addCandidate}
                      className="bg-green-600 text-white px-6 rounded-lg"
                    >
                      Add
                    </button>
                  </div>

                  {newElection.candidates.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {newElection.candidates.map((c) => (
                        <li
                          key={c.id}
                          className="bg-gray-100 p-3 rounded-lg flex justify-between"
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
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button
                  onClick={createElection}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg"
                >
                  Create Election
                </button>
              </div>
            </div>
          )}

          {/* REVIEW APPLICATIONS */}
          {activeTab === "applications" && (
            <div className="bg-white rounded-xl shadow p-8">
              <h2 className="text-2xl font-bold mb-6">Candidate Applications</h2>

              {applications.length === 0 ? (
                <p className="text-gray-500">No applications yet.</p>
              ) : (
                applications.map((app) => (
                  <div
                    key={app.id}
                    className="border p-4 rounded-lg mb-4 flex justify-between"
                  >
                    <div>
                      <p className="font-semibold">{app.name}</p>
                      <p className="text-sm text-gray-500">{app.email}</p>
                      <p className="text-sm">
                        Election: {app.electionTitle}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {app.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleApplicationAction(app.id, "approved")
                            }
                            className="bg-green-600 text-white px-4 py-2 rounded-lg"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleApplicationAction(app.id, "rejected")
                            }
                            className="bg-red-600 text-white px-4 py-2 rounded-lg"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {app.status !== "pending" && (
                        <span
                          className={`px-4 py-2 rounded-lg font-semibold ${
                            app.status === "approved"
                              ? "text-green-700 bg-green-100"
                              : "text-red-700 bg-red-100"
                          }`}
                        >
                          {app.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* MANAGE ELECTIONS */}
          {activeTab === "manage" && (
            <div className="bg-white rounded-xl shadow p-8">
              <h2 className="text-2xl font-bold mb-6">Elections</h2>

              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Votes</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {elections.map((e) => (
                    <tr key={e.id} className="border-b">
                      <td className="px-4 py-3">{e.title}</td>
                      <td className="px-4 py-3 capitalize">{e.status}</td>
                      <td className="px-4 py-3">{e.totalVotes}</td>
                      <td className="px-4 py-3 flex gap-3">
                        <button
                          className="text-blue-600"
                          onClick={() =>
                            navigate(`/results?election=${e.id}`)
                          }
                        >
                          View Results
                        </button>

                        <button
                          className="text-red-600"
                          onClick={() => handleDeleteElection(e.id)}
                        >
                          Delete
                        </button>

                        {e.status === "active" && (
                          <button
                            className="text-green-600"
                            onClick={() =>
                              alert("Finalize action coming soon")
                            }
                          >
                            Finalize
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
