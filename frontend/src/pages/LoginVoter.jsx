import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, verifyFace } from "../services/api";
import Navbar from "../components/Navbar";
import { ethers } from "ethers";

export default function VoterLogin() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const verifyInterval = useRef(null);

  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [wallet, setWallet] = useState("");

  /* ----------------------------------------------------
     STOP CAMERA
  ---------------------------------------------------- */
  const stopCamera = () => {
    try {
      if (!videoRef.current) return;

      const stream = videoRef.current.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      videoRef.current.srcObject = null;
    } catch (err) {
      console.warn("Camera stop error:", err);
    }
  };

  /* ----------------------------------------------------
     LOGIN → MOVE TO STEP 2
  ---------------------------------------------------- */
  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      alert("Enter email + password");
      return;
    }

    const res = await loginUser({
      username: credentials.email,
      password: credentials.password,
    });

    if (res.error) {
      alert(res.error);
      return;
    }

    // ⭐ Save basic user info temporarily for later storage
    localStorage.setItem(
      "tempUser",
      JSON.stringify({
        email: credentials.email,
        voterId: res.voterId,
        walletAddress: res.wallet, // may be empty if not stored yet
      })
    );

    startCamera();
    setStep(2);
  };

  /* ----------------------------------------------------
     START CAMERA
  ---------------------------------------------------- */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera Error:", err);
    }
  };

  /* ----------------------------------------------------
     CONTINUOUS FACE VERIFICATION
  ---------------------------------------------------- */
  const startContinuousVerification = () => {
    if (verifyInterval.current !== null) return;

    verifyInterval.current = setInterval(async () => {
      if (!videoRef.current) return;

      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 300;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const capturedImage = canvas.toDataURL("image/jpeg");

      const res = await verifyFace({
        voterId: credentials.email,
        image: capturedImage,
      });

      if (res.success && res.confidence === 100) {
        clearInterval(verifyInterval.current);
        verifyInterval.current = null;

        stopCamera();
        alert("Face Verified!");
        setStep(3);
      }
    }, 4000); // Every 4 seconds
  };

  useEffect(() => {
    if (step === 2) startContinuousVerification();
  }, [step]);

  useEffect(() => {
    return () => {
      if (verifyInterval.current) clearInterval(verifyInterval.current);
      stopCamera();
    };
  }, []);

  /* ----------------------------------------------------
     CONNECT METAMASK & COMPLETE LOGIN
  ---------------------------------------------------- */
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected!");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setWallet(address);
      alert("Wallet Connected!");

      // Get stored user
      const tempUser = JSON.parse(localStorage.getItem("tempUser"));

      // ⭐ Save final user info for Dashboard + TopBar
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: tempUser?.email.split("@")[0], // You can replace with backend name later
          email: tempUser?.email,
          voterId: tempUser?.voterId,
          walletAddress: address,
        })
      );

      // Remove temp
      localStorage.removeItem("tempUser");

      stopCamera();

      navigate("/voter/dashboard");
    } catch (error) {
      console.error(error);
      alert("Failed to connect wallet");
    }
  };

  /* ----------------------------------------------------
     UI RENDER
  ---------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">
          Secure Voter Login
        </h1>

        {/* STEP INDICATOR */}
        <div className="flex justify-between mb-8 text-center">
          {["Credentials", "Face Scan", "Wallet"].map((s, index) => {
            const n = index + 1;
            return (
              <div className="flex-1" key={index}>
                <div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white 
                  ${step === n ? "bg-blue-600" : step > n ? "bg-green-600" : "bg-gray-400"}`}
                >
                  {step > n ? "✓" : n}
                </div>
                <p className="text-xs mt-1">{s}</p>
              </div>
            );
          })}
        </div>

        {/* STEP 1 — LOGIN */}
        {step === 1 && (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full border p-3 rounded"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full border p-3 rounded"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
            />

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded"
            >
              Next: Face Verification →
            </button>
          </div>
        )}

        {/* STEP 2 — FACE SCAN */}
        {step === 2 && (
          <div>
            <video ref={videoRef} className="w-full rounded bg-black mb-4" />
            <p className="text-center text-gray-600">Scanning face...</p>
          </div>
        )}

        {/* STEP 3 — METAMASK LOGIN */}
        {step === 3 && (
          <div className="text-center">
            {!wallet ? (
              <>
                <p className="mb-3 text-gray-600">
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
              <p className="text-green-600 font-mono break-all mt-3">
                {wallet}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
