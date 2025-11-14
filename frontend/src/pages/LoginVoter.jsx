import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { loginUser , verifyFace } from "../services/api";
export default function VoterLogin() {
  const navigate = useNavigate();

  const [loginStep, setLoginStep] = useState(1);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [faceConfidence, setFaceConfidence] = useState(0);
  const [walletAddress, setWalletAddress] = useState("");

  // ================================================================
  // STEP 1 → CHECK USERNAME + PASSWORD (BACKEND CALL)
  // ================================================================
  const handleCredentialsSubmit = async () => {
    if (!credentials.username || !credentials.password) {
      alert("Please enter username and password");
      return;
    }

    const res = await loginUser(credentials);

    if (res.error) {
      alert(res.error);
      return;
    }

    alert("Credentials verified!");
    setLoginStep(2);
  };

  // ================================================================
  // STEP 2 → FACE RECOGNITION (BACKEND CALL)
  // ================================================================
  const captureFace = async () => {
    setFaceConfidence(1); // show loading UI

    // Normally you would send embedding or image; here we send placeholder
    const payload = {
      username: credentials.username,
      capturedEmbedding: Array(128).fill(0),
    };

    const res = await verifyFace(payload);

    if (res.error) {
      alert(res.error);
      setFaceConfidence(0);
      return;
    }

    setFaceConfidence(res.confidence);

    if (res.confidence >= 60) {
      alert("Face Verified: " + res.confidence + "% match!");
      setTimeout(() => setLoginStep(3), 1200);
    } else {
      alert("Face match too low. Try again!");
      setFaceConfidence(0);
    }
  };

  // ================================================================
  // STEP 3 → WALLET CHECK (BACKEND CALL)
  // ================================================================
  // const connectWallet = async () => {
  //   const mockWallet = "0x" + Math.random().toString(16).substring(2, 42);
  //   setWalletAddress(mockWallet);

  //   const res = await verifyWallet({
  //     username: credentials.username,
  //     walletAddress: mockWallet,
  //   });

  //   if (res.error) {
  //     alert(res.error);
  //     setWalletAddress("");
  //     return;
  //   }

  //   alert("MetaMask connected!");
  // };

  // ================================================================
  // FINAL LOGIN SUCCESS
  // ================================================================
  const handleLogin = () => {
    alert("Login Successful!");
    navigate("/voter/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Navbar />

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Multi-Factor Voter Login
          </h2>

          {/* PROGRESS UI */}
          <div className="flex justify-between mb-8">
            {["Credentials", "Face Scan", "MetaMask"].map((label, index) => {
              const step = index + 1;
              const isCompleted =
                (step === 1 && loginStep > 1) ||
                (step === 2 && loginStep > 2) ||
                (step === 3 && walletAddress);

              const isActive = loginStep === step;

              return (
                <div key={label} className="flex-1 text-center">
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 text-white font-bold
                      ${
                        isCompleted
                          ? "bg-green-600"
                          : isActive
                          ? "bg-blue-600"
                          : "bg-gray-400"
                      }
                    `}
                  >
                    {isCompleted ? "✓" : step}
                  </div>
                  <p className="text-xs">{label}</p>
                </div>
              );
            })}
          </div>

          {/* STEP 1 — CREDENTIALS */}
          {loginStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Username / Email</label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Enter username or email"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Password</label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Enter password"
                />
              </div>

              <button
                onClick={handleCredentialsSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
              >
                Next: Face Recognition →
              </button>
            </div>
          )}

          {/* STEP 2 — FACE RECOGNITION */}
          {loginStep === 2 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Face Recognition Verification
              </h3>

              <div className="w-full h-64 bg-gray-800 text-white rounded-lg flex items-center justify-center mb-4">
                {faceConfidence <= 1 ? (
                  <div className="text-center">
                    <div className="text-6xl mb-4">📷</div>
                    <p>Position your face in the frame</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <p className="text-xl font-semibold">{faceConfidence}% Match</p>
                  </div>
                )}
              </div>

              <button
                onClick={captureFace}
                disabled={faceConfidence > 1}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                📸 Capture Face
              </button>
            </div>
          )}

          {/* STEP 3 — WALLET */}
          {loginStep === 3 && (
            <div className="text-center">
              <div className="text-6xl mb-6">🦊</div>

              {!walletAddress ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Connect MetaMask to finish login
                  </p>
                  <button
                    onClick={connectWallet}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold"
                  >
                    Connect MetaMask
                  </button>
                </>
              ) : (
                <>
                  <p className="font-semibold mb-2">Wallet Connected</p>
                  <p className="text-gray-600 bg-gray-100 p-3 rounded font-mono break-all mb-4">
                    {walletAddress}
                  </p>

                  <button
                    onClick={handleLogin}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
                  >
                    ✓ Complete Login
                  </button>
                </>
              )}
            </div>
          )}

          {/* BACK */}
          <button
            onClick={() => navigate("/")}
            className="w-full mt-6 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-semibold"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
