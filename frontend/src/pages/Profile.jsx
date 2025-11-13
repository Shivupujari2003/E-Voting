import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function ProfilePage() {
  const navigate = useNavigate();  // ✅ FIXED

  // Mock user (since AppContext is removed)
  const [user, setUser] = useState({
    name: "Demo User",
    email: "demo@vote.com",
    contact: "9876543210",
    walletAddress: "0x1234abcd5678ef90abcd1234ef567890abcd1234",
    voterId: "VTRABCD123",
    registeredAt: "2024-01-10T10:20:00Z",
  });

  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    email: user.email,
    contact: user.contact,
  });

  const handleUpdate = () => {
    setUser({ ...user, ...formData });
    alert("Profile updated!");
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      
      {/* Navbar */}
      <Navbar />

      {/* Page Container */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">

        {/* Back Button */}
        <button
          onClick={() => navigate("/voter/dashboard")}  // ✅ FIXED
          className="mb-6 bg-white hover:bg-gray-100 px-4 py-2 rounded-lg shadow-sm transition"
        >
          ← Back to Dashboard
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">

          {/* Header Row */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">👤 My Profile</h2>

            <button
              onClick={() => setEditing(!editing)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {/* Profile Fields */}
          <div className="space-y-6">

            {/* Name */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Full Name</label>
              <p className="text-lg font-semibold">{user.name}</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Email Address</label>

              {editing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300"
                />
              ) : (
                <p className="text-lg font-semibold">{user.email}</p>
              )}
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Contact Number</label>

              {editing ? (
                <input
                  type="tel"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300"
                />
              ) : (
                <p className="text-lg font-semibold">{user.contact}</p>
              )}
            </div>

            {/* Wallet Address */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Wallet Address</label>
              <p className="text-lg font-mono break-all">{user.walletAddress}</p>
            </div>

            {/* Voter ID */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Voter ID</label>
              <p className="text-lg font-semibold">{user.voterId}</p>
            </div>

            {/* Registered On */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Registered On</label>
              <p className="text-lg">
                {new Date(user.registeredAt).toLocaleDateString()}
              </p>
            </div>

            {/* Save Button */}
            {editing && (
              <button
                onClick={handleUpdate}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 mt-4 rounded-lg font-semibold transition"
              >
                Save Changes
              </button>
            )}

            <hr className="border-gray-200 my-6" />

            {/* Face Update */}
            <button
              onClick={() => alert("Face update soon!")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
            >
              🔄 Update Face Recognition
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
