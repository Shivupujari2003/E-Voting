import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, verifyFace } from "../services/api";
import Navbar from "../components/Navbar";
import { ethers } from "ethers";

export default function VoterLogin() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const verifyInterval = useRef(null); // Stores interval safely

  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [wallet, setWallet] = useState("");

  // ======================================================
  // SAFE CAMERA STOP
  // ======================================================
  const stopCamera = () => {
    try {
      console.log("STOP CAMERA CALLED");

      if (!videoRef.current) {
        console.log("videoRef.current is NULL, cannot stop camera");
        return;
      }

      const stream = videoRef.current.srcObject;
      if (stream) {
        console.log("Stopping video tracks...");
        stream.getTracks().forEach((track) => track.stop());
      }

      videoRef.current.srcObject = null;
      console.log("Camera successfully stopped");
    } catch (err) {
      console.warn("Camera stop error:", err);
    }
  };

  // ======================================================
  // STEP 1 — LOGIN CHECK
  // ======================================================
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

    console.log("Credentials OK → Starting camera and going to STEP 2");

    startCamera();
    setStep(2);
  };

  // ======================================================
  // START CAMERA
  // ======================================================
  const startCamera = async () => {
    try {
      console.log("Starting camera...");

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        console.log("Camera started successfully");
      } else {
        console.log("videoRef is null, camera cannot start");
      }
    } catch (err) {
      console.error("Camera Error:", err);
    }
  };

  // ======================================================
  // FACE VERIFICATION LOOP
  // ======================================================
  const startContinuousVerification = () => {
    if (verifyInterval.current !== null) {
      console.log("Interval already running — NOT starting another");
      return;
    }

    console.log("Starting face verification loop...");

    verifyInterval.current = setInterval(async () => {
      if (!videoRef.current) {
        console.log("videoRef missing, skipping frame...");
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 300;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const capturedImage = canvas.toDataURL("image/jpeg");

      console.log("Sending frame to backend for face verification...");

      const res = await verifyFace({
        voterId: credentials.email,
        image: capturedImage,
      });

      if (res.success && res.confidence === 100) {
        console.log(
          "FACE CONFIRMED — STOPPING INTERVAL & CAMERA",
          res.confidence
        );

        clearInterval(verifyInterval.current);
        verifyInterval.current = null;

        stopCamera();

        alert("Face Verified!");
        setStep(3);
      }
    }, 5000);
  };

  useEffect(() => {
    if (step === 2) {
      startContinuousVerification();
    }
  }, [step]);

  // ======================================================
  // CLEANUP (component unmount)
  // ======================================================
  useEffect(() => {
    return () => {
      console.log("COMPONENT UNMOUNT — Cleaning up interval & camera");

      if (verifyInterval.current) {
        console.log("Clearing interval from cleanup...");
        clearInterval(verifyInterval.current);
      }

      stopCamera();
    };
  }, []);

  // ======================================================
  // METAMASK LOGIN (STEP 3)
  // ======================================================
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

      console.log("MetaMask Wallet Connected:", address);

      setWallet(address);
      alert("Wallet Connected!");

      stopCamera(); // ensure camera is always off
      navigate("/voter/dashboard");
    } catch (error) {
      console.error(error);
      alert("Failed to connect wallet");
    }
  };

  // ======================================================
  // UI
  // ======================================================
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
