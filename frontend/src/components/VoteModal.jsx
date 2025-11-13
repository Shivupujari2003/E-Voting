import React, { useState } from "react";

export default function VoteModal({ election, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [faceDetected, setFaceDetected] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [txHash, setTxHash] = useState("");

  // Fake face capture
  const captureFace = () => {
    setFaceDetected(true);

    setTimeout(() => {
      const conf = Math.floor(80 + Math.random() * 15); // 80–95%
      setConfidence(conf);

      if (conf >= 80) {
        setStep(2);
      } else {
        alert("Face match failed. Try again.");
      }
    }, 1500);
  };

  // Fake blockchain sign
  const signTransaction = () => {
    const hash = "0x" + Math.random().toString(16).substring(2, 66);
    setTxHash(hash);

    setTimeout(() => {
      onSuccess(election.id, hash, selectedCandidate.id, selectedCandidate.name);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xl w-full">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Cast Your Vote</h2>
          <button className="text-3xl" onClick={onClose}>×</button>
        </div>

        {/* Step 1 — Face Verification */}
        {step === 1 && (
          <>
            <h3 className="text-xl font-semibold mb-4">Step 1: Face Verification</h3>

            <div className="bg-gray-200 h-52 rounded-xl flex items-center justify-center mb-4">
              {!faceDetected ? (
                <p className="text-gray-600 text-lg">📷 Ready to capture...</p>
              ) : (
                <p className="text-green-600 text-xl font-semibold">
                  Match: {confidence}%
                </p>
              )}
            </div>

            <button
              onClick={captureFace}
              disabled={faceDetected}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
            >
              {faceDetected ? "Processing..." : "📸 Capture Photo"}
            </button>
          </>
        )}

        {/* Step 2 — Choose Candidate */}
        {step === 2 && (
          <>
            <h3 className="text-xl font-semibold mb-4">Step 2: Select Candidate</h3>

            <div className="space-y-3 mb-4">
              {election.candidates.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCandidate(c)}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    selectedCandidate?.id === c.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  {c.name}
                </div>
              ))}
            </div>

            <button
              disabled={!selectedCandidate}
              onClick={() => setStep(3)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg disabled:opacity-50"
            >
              Confirm & Continue
            </button>
          </>
        )}

        {/* Step 3 — Sign with MetaMask */}
        {step === 3 && (
          <>
            <h3 className="text-xl font-semibold mb-4">Step 3: Sign Transaction</h3>

            {!txHash ? (
              <>
                <p className="text-gray-600 mb-4">
                  Please sign the voting transaction with MetaMask.
                </p>

                <button
                  onClick={signTransaction}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg"
                >
                  🦊 Sign with MetaMask
                </button>
              </>
            ) : (
              <div className="text-center">
                <p className="text-green-600 text-xl font-bold mb-2">
                  Vote Submitted!
                </p>
                <p className="font-mono text-sm break-all">{txHash}</p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
