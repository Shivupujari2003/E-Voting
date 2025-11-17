import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from LocalStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.log("Error reading LocalStorage:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return <p className="p-8 text-center">Loading profile...</p>;
  if (!user) return <p className="p-8 text-center">No profile found.</p>;

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
          <h2 className="text-3xl font-bold mb-6">👤 My Profile</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Full Name</label>
              <p className="text-lg font-semibold">{user.name}</p>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Email Address</label>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Contact Number</label>
              <p className="text-lg font-semibold">{user.contact || "Not Provided"}</p>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Wallet Address</label>
              <p className="text-lg font-mono break-all">{user.walletAddress}</p>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Voter ID</label>
              <p className="text-lg font-semibold">{user.voterId}</p>
            </div>

            {user.registeredAt && (
              <div>
                <label className="block text-sm text-gray-500 mb-1">Registered On</label>
                <p className="text-lg">
                  {new Date(user.registeredAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
