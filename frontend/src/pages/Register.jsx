import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, checkWalletExists } from "../services/api";
import { ethers } from "ethers";

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const videoRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
    walletAddress: "",
    photos: [],
  });

  /* -------------------------------------------
     STEP 1 VALIDATION
  -------------------------------------------- */
  const validateStep1 = () => {
    const err = {};

    if (!formData.name.trim()) err.name = "Name required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) err.email = "Invalid email";
    if (!/^\d{10}$/.test(formData.contact))
      err.contact = "10-digit number required";
    if (formData.password.length < 6) err.password = "Min 6 characters";
    if (formData.password !== formData.confirmPassword)
      err.confirmPassword = "Passwords do not match";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* -------------------------------------------
     CAMERA & FACE CAPTURE
  -------------------------------------------- */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert("Camera access denied");
    }
  };

  useEffect(() => {
    if (step === 2) startCamera();
  }, [step]);

  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const imgData = canvas.toDataURL("image/jpeg");

    if (formData.photos.length < 10) {
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, imgData],
      }));
    }
  };

  /* -------------------------------------------
     CONNECT METAMASK + CHECK DUPLICATE WALLET
  -------------------------------------------- */
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      // 🔥 CHECK IF WALLET IS ALREADY REGISTERED
      const check = await checkWalletExists(walletAddress);

      if (check.exists) {
        alert("❌ This wallet is already registered! Switch MetaMask account.");
        setFormData({ ...formData, walletAddress: "" });
        return;
      }

      // Wallet is unique → store it
      setFormData({ ...formData, walletAddress });
      alert("Wallet Connected!");
    } catch (err) {
      console.error("Wallet connection failed:", err);
      alert("Failed to connect wallet");
    }
  };

  /* Update wallet on MetaMask account change */
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts) => {
        const newWallet = accounts[0] || "";

        if (!newWallet) {
          setFormData((prev) => ({ ...prev, walletAddress: "" }));
          return;
        }

        // Check again if wallet is already registered
        const check = await checkWalletExists(newWallet);

        if (check.exists) {
          alert("❌ This wallet is already registered!");
          setFormData((prev) => ({ ...prev, walletAddress: "" }));
          return;
        }

        setFormData((prev) => ({ ...prev, walletAddress: newWallet }));
      });
    }
  }, []);

  /* -------------------------------------------
     SUBMIT REGISTRATION
  -------------------------------------------- */
  const handleRegister = async () => {
    const res = await registerUser(formData);

    if (res.success) {
      alert("Registration successful!");
      navigate("/login-voter");
    } else {
      alert(res.error || "Registration failed");
    }
  };

  const progress = (step / 3) * 100;

  /* -------------------------------------------
     UI OUTPUT
  -------------------------------------------- */
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-6">
            Voter Registration
          </h2>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-gray-200 rounded">
              <div
                className="bg-blue-600 h-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* --------------------------------------
               STEP 1 — BASIC INFORMATION
          --------------------------------------- */}
          {step === 1 && (
            <>
              <h3 className="text-xl font-semibold mb-4">Basic Information</h3>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full border p-2 rounded"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                {errors.name && <p className="text-red-500">{errors.name}</p>}

                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border p-2 rounded"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {errors.email && <p className="text-red-500">{errors.email}</p>}

                <input
                  type="tel"
                  placeholder="Contact Number"
                  className="w-full border p-2 rounded"
                  value={formData.contact}
                  onChange={(e) =>
                    setFormData({ ...formData, contact: e.target.value })
                  }
                />
                {errors.contact && (
                  <p className="text-red-500">{errors.contact}</p>
                )}

                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border p-2 rounded"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                {errors.password && (
                  <p className="text-red-500">{errors.password}</p>
                )}

                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full border p-2 rounded"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                {errors.confirmPassword && (
                  <p className="text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                onClick={() => validateStep1() && setStep(2)}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded"
              >
                Next: Capture Photos →
              </button>
            </>
          )}

          {/* --------------------------------------
               STEP 2 — CAPTURE PHOTOS
          --------------------------------------- */}
          {step === 2 && (
            <>
              <h3 className="text-xl font-semibold mb-4">
                Capture Your Face
              </h3>

              <video
                ref={videoRef}
                className="w-full aspect-video bg-black rounded"
              />

              <button
                onClick={capturePhoto}
                disabled={formData.photos.length >= 10}
                className="w-full mt-4 bg-green-600 text-white py-3 rounded disabled:opacity-50"
              >
                Capture Photo ({formData.photos.length}/10)
              </button>

              <div className="flex gap-3 mt-4 flex-wrap">
                {formData.photos.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className="w-24 h-24 object-cover rounded border"
                  />
                ))}
              </div>

              <button
                disabled={formData.photos.length < 10}
                onClick={() => setStep(3)}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded disabled:opacity-50"
              >
                Next: Connect Wallet →
              </button>
            </>
          )}

          {/* --------------------------------------
               STEP 3 — CONNECT WALLET
          --------------------------------------- */}
          {step === 3 && (
            <>
              <h3 className="text-xl font-semibold mb-4">Connect Wallet</h3>

              <div className="p-4 border rounded bg-gray-50 text-center">
                {formData.walletAddress ? (
                  <>
                    <p className="text-green-700 font-bold">
                      Wallet Connected
                    </p>
                    <p className="text-sm font-mono break-all">
                      {formData.walletAddress}
                    </p>
                  </>
                ) : (
                  <button
                    onClick={connectWallet}
                    className="bg-orange-600 text-white px-6 py-3 rounded"
                  >
                    Connect MetaMask
                  </button>
                )}
              </div>

              <button
                onClick={handleRegister}
                disabled={!formData.walletAddress}
                className="w-full mt-6 bg-green-600 text-white py-3 rounded disabled:opacity-50"
              >
                Complete Registration ✔
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
