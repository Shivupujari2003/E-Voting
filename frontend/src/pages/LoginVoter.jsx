import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginVoter() {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState("");

  const connectWallet = () => {
    const mockWallet = "0x" + Math.random().toString(16).substring(2, 42);
    setWalletAddress(mockWallet);
    alert("MetaMask connected!");
  };

  const handleLogin = () => {
    alert("Login successful!");
    navigate("/voter/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Voter Login
          </h2>

          <div className="text-center">
            <div className="text-6xl mb-6">🦊</div>

            {/* If wallet is NOT connected */}
            {!walletAddress && (
              <div className="mb-6">
                <p className="mb-4 text-gray-600">
                  Connect your MetaMask wallet to continue
                </p>

                <button
                  onClick={connectWallet}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  Connect MetaMask
                </button>
              </div>
            )}

            {/* If wallet IS connected */}
            {walletAddress && (
              <>
                <div className="mb-6">
                  <p className="font-semibold mb-2">Wallet Connected</p>
                  <p className="text-sm font-mono break-all bg-gray-100 p-3 rounded">
                    {walletAddress}
                  </p>
                </div>

                <button
                  onClick={handleLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  Enter as Voter
                </button>
              </>
            )}

            <button
              onClick={() => navigate("/")}
              className="w-full mt-4 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-semibold transition"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
