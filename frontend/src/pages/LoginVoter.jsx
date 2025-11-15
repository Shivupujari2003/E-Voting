import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, verifyFace } from "../services/api";
import Navbar from "../components/Navbar";

export default function VoterLogin() {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [faceMatch, setFaceMatch] = useState(null);
  const [wallet, setWallet] = useState("");

  // ============================
  // STEP 1 — CREDENTIAL CHECK
  // ============================
const handleLogin = async () => {
  if (!credentials.email || !credentials.password) {
    alert("Enter email + password");
    return;
  }

  const res = await loginUser({
    username: credentials.email,
    password: credentials.password
  });

  if (res.error) {
    alert(res.error);
    return;
  }

  startCamera();
  setStep(2);
};


  // ============================
  // CAMERA START
  // ============================
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  };

  // ============================
  // STEP 2 — CAPTURE + SEND FACE IMAGE
  // ============================
const captureAndVerify = async () => {
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

  if (res.error) {
    alert(res.error);
    return;
  }

  setFaceMatch(res.confidence);

  if (res.confidence >= 60) {
    alert("Face Verified!");
    setStep(3);
  } else {
    alert("Face mismatch, try again!");
  }
};


  // ============================
  // STEP 3 — VERIFY WALLET
  // ============================
  const connectWallet = () => {
    const mockWallet = "0x" + Math.random().toString(16).substring(2, 42);
    setWallet(mockWallet);

    alert("Wallet Connected!");
    navigate("/voter/dashboard");
  };

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
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white 
                  ${step === n ? "bg-blue-600" : step > n ? "bg-green-600" : "bg-gray-400"}`}>
                  {step > n ? "✓" : n}
                </div>
                <p className="text-xs mt-1">{s}</p>
              </div>
            );
          })}
        </div>

        {/* STEP 1 — CREDENTIALS */}
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

            {faceMatch !== null && (
              <p className="text-center text-lg font-bold text-green-600">
                Match: {faceMatch}%
              </p>
            )}

            <button
              onClick={captureAndVerify}
              className="w-full bg-green-600 text-white py-3 rounded"
            >
              📸 Capture & Verify Face
            </button>
          </div>
        )}

        {/* STEP 3 — WALLET */}
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
              <p className="text-green-600 font-mono">{wallet}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
