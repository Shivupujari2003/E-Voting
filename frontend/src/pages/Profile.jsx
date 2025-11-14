import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { fetchUserProfile, updateUserProfile, updateUserFace } from "../services/api";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ email: "", contact: "" });

  // Fetch profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchUserProfile();
        setUser(data);
        setFormData({ email: data.email, contact: data.contact });
      } catch (err) {
        alert("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      const updated = await updateUserProfile(formData);
      setUser(updated);
      alert("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const handleFaceUpdate = async () => {
    try {
      await updateUserFace();
      alert("Face recognition updated successfully!");
    } catch (err) {
      alert("Failed to update face recognition");
    }
  };

  if (loading) return <p className="p-8 text-center">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <button
          onClick={() => navigate("/voter/dashboard")}
          className="mb-6 bg-white hover:bg-gray-100 px-4 py-2 rounded-lg shadow-sm transition"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">👤 My Profile</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Full Name</label>
              <p className="text-lg font-semibold">{user.name}</p>
            </div>

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

            <div>
              <label className="block text-sm text-gray-500 mb-1">Wallet Address</label>
              <p className="text-lg font-mono break-all">{user.walletAddress}</p>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Voter ID</label>
              <p className="text-lg font-semibold">{user.voterId}</p>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Registered On</label>
              <p className="text-lg">{new Date(user.registeredAt).toLocaleDateString()}</p>
            </div>

            {editing && (
              <button
                onClick={handleUpdate}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 mt-4 rounded-lg font-semibold transition"
              >
                Save Changes
              </button>
            )}

            <hr className="border-gray-200 my-6" />

            <button
              onClick={handleFaceUpdate}
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
