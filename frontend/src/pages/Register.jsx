import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api"; // <-- added

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
    photo: null,
    walletAddress: "",
  });

  const [errors, setErrors] = useState({});
  const [photoCaptured, setPhotoCaptured] = useState(false);

  const validateStep1 = async() => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }

    if (!/^\d{10}$/.test(formData.contact)) {
      newErrors.contact = "Valid 10-digit contact number is required";
    }

    if (!formData.password.trim() || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    const payload = {
      name: formData.name,
      email: formData.email,
      contact: formData.contact,
      password: formData.password,
      walletAddress: formData.walletAddress,
      faceVerified: true,
      faceEmbedding: Array(128).fill(0),
    };

    const res = await registerUser(payload);

    if (res.error) {
      alert(res.error);
      return;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const capturePhoto = () => {
    setPhotoCaptured(true);
    setFormData({ ...formData, photo: "captured_photo_data" });
  };

  const connectWallet = () => {
    const mockWallet = "0x" + Math.random().toString(16).substring(2, 42);
    setFormData({ ...formData, walletAddress: mockWallet });
  };

  // =====================================================
  // BACKEND INTEGRATION — ONLY THIS PART IS UPDATED
  // =====================================================
  const handleRegister = async () => {
    
    alert("Registration successful!");
    navigate("/login-voter");
  };
  // =====================================================

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">

          <h2 className="text-3xl font-bold mb-6 text-center">Voter Registration</h2>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="flex justify-between mt-2 text-sm">
              <span className={step >= 1 ? "text-blue-600 font-semibold" : ""}>1. Info</span>
              <span className={step >= 2 ? "text-blue-600 font-semibold" : ""}>2. Photo</span>
              <span className={step >= 3 ? "text-blue-600 font-semibold" : ""}>3. Wallet</span>
            </div>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Step 1: Basic Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.name ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block mb-2 font-medium">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"}`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block mb-2 font-medium">Contact Number</label>
                  <input
                    type="tel"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.contact ? "border-red-500" : "border-gray-300"}`}
                    placeholder="1234567890"
                  />
                  {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
                </div>

                <div>
                  <label className="block mb-2 font-medium">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.password ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Enter password"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block mb-2 font-medium">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Re-enter password"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <button
                onClick={() => validateStep1() && setStep(2)}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
              >
                Next: Capture Photo
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Step 2: Face Recognition Setup</h3>

              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                {photoCaptured ? (
                  <div className="text-center">
                    <div className="text-6xl mb-3">✅</div>
                    <p className="text-lg font-semibold">Photo Captured Successfully!</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-3">📷</div>
                    <p>Position your face in the frame</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={capturePhoto}
                  disabled={photoCaptured}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {photoCaptured ? "✓ Photo Captured" : "📸 Capture Photo"}
                </button>

                {photoCaptured && (
                  <button
                    onClick={() => setPhotoCaptured(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold"
                  >
                    🔄 Retake
                  </button>
                )}
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold"
                >
                  ← Back
                </button>

                <button
                  onClick={() => setStep(3)}
                  disabled={!photoCaptured}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  Next: Connect Wallet
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Step 3: Connect Wallet</h3>

              <div className="bg-gray-100 rounded-lg p-6 mb-6 text-center">
                {formData.walletAddress ? (
                  <div>
                    <div className="text-5xl mb-4">✔</div>
                    <p className="font-semibold mb-2">Wallet Connected</p>
                    <p className="font-mono break-all">{formData.walletAddress}</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-5xl mb-4">🦊</div>
                    <p className="mb-4 text-gray-600">Connect your MetaMask wallet</p>
                    <button
                      onClick={connectWallet}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                      Connect MetaMask
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold"
                >
                  ← Back
                </button>

                <button
                  onClick={handleRegister}
                  disabled={!formData.walletAddress}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  ✓ Complete Registration
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
