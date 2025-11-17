import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  // ====================================================
  // STEP 1 — STATIC CREDENTIAL CHECK
  // ====================================================
  const handleLogin = () => {
    if (!email || !password) {
      alert("Please enter email & password");
      return;
    }

    if (email !== "admin@gmail.com" || password !== "admin123") {
      alert("Invalid admin credentials");
      return;
    }

    // Go to wallet step
    setStep(2);
  };

  // ====================================================
  // STEP 2 — METAMASK CONNECT
  // ====================================================
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not installed!");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setWalletAddress(address);

      // Save admin info
      localStorage.setItem(
        "admin",
        JSON.stringify({
          name: "Admin",
          email,
          walletAddress: address,
        })
      );

      alert("Admin logged in successfully!");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to connect wallet");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Admin Login</h2>

          {/* STEP PROGRESS */}
          <div className="flex justify-between mb-6">
            {["Credentials", "Wallet"].map((label, i) => {
              const num = i + 1;
              return (
                <div key={i} className="text-center flex-1">
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white 
                      ${step === num ? "bg-blue-600" : step > num ? "bg-green-600" : "bg-gray-400"}`}
                  >
                    {step > num ? "✓" : num}
                  </div>
                  <p className="text-xs mt-1">{label}</p>
                </div>
              );
            })}
          </div>

          {/* STEP 1 — CREDENTIALS */}
          {step === 1 && (
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Admin Email"
                className="w-full p-3 border rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 text-white py-3 rounded"
              >
                Next → Connect MetaMask
              </button>
            </div>
          )}

          {/* STEP 2 — METAMASK */}
          {step === 2 && (
            <div className="text-center">
              {!walletAddress ? (
                <>
                  <p className="mb-4 text-gray-600">
                    Connect MetaMask to complete login
                  </p>

                  <button
                    onClick={connectWallet}
                    className="bg-orange-600 text-white px-6 py-3 rounded"
                  >
                    Connect MetaMask
                  </button>
                </>
              ) : (
                <p className="mt-3 font-mono text-green-600">{walletAddress}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
