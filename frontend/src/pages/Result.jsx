// // pages/Results.js
// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { fetchElectionResults } from "../services/api";

// export default function Results() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const query = new URLSearchParams(location.search);
//   const electionId = Number(query.get("election"));

//   const [election, setElection] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!electionId) {
//       setError("No election ID provided");
//       setLoading(false);
//       return;
//     }

//     const loadResults = async () => {
//       try {
//         const data = await fetchElectionResults(electionId);
//         if (!data || data.error) {
//           setError(data?.error || "Failed to load election results");
//         } else {
//           setElection(data);
//         }
//       } catch (err) {
//         console.error(err);
//         setError("An error occurred while fetching results");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadResults();
//   }, [electionId]);

//   if (loading) return <div className="p-8 text-center">Loading results...</div>;
//   if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
//   if (!election) return <div className="p-8 text-center">Election not found</div>;

//   const maxVotes = Math.max(...election.candidates.map((c) => c.votes));

//   return (
//     <div className="min-h-screen bg-gray-100 text-gray-800">
//       <div className="container mx-auto px-4 py-10 max-w-4xl">

//         <button
//           onClick={() => navigate(-1)}
//           className="mb-6 bg-white hover:bg-gray-100 px-4 py-2 rounded-lg shadow transition"
//         >
//           ← Back
//         </button>

//         <div className="bg-white rounded-xl shadow-lg p-8">
//           <h2 className="text-3xl font-bold mb-2">{election.title}</h2>
//           <p className="text-gray-600 mb-6">{election.description}</p>

//           {/* Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//             <div className="bg-blue-50 rounded-lg p-4 text-center">
//               <p className="text-sm text-gray-500">Total Votes</p>
//               <p className="text-3xl font-bold text-blue-600">{election.totalVotes}</p>
//             </div>

//             <div className="bg-green-50 rounded-lg p-4 text-center">
//               <p className="text-sm text-gray-500">Candidates</p>
//               <p className="text-3xl font-bold text-green-600">{election.candidates.length}</p>
//             </div>

//             <div className="bg-purple-50 rounded-lg p-4 text-center">
//               <p className="text-sm text-gray-500">Status</p>
//               <p className="text-2xl font-bold text-purple-600">{election.status}</p>
//             </div>
//           </div>

//           {/* Vote Distribution */}
//           <h3 className="text-2xl font-bold mb-4">📊 Vote Distribution</h3>
//           <div className="space-y-4 mb-10">
//             {election.candidates.map((candidate) => {
//               const percentage = election.totalVotes
//                 ? ((candidate.votes / election.totalVotes) * 100).toFixed(1)
//                 : 0;
//               const isWinner = candidate.votes === maxVotes;

//               return (
//                 <div
//                   key={candidate.id}
//                   className={`p-4 rounded-lg border ${
//                     isWinner ? "bg-yellow-100 border-yellow-500" : "bg-gray-50"
//                   }`}
//                 >
//                   <div className="flex justify-between mb-2">
//                     <div className="flex items-center gap-2">
//                       {isWinner && <span className="text-xl">🏆</span>}
//                       <span className="font-semibold">{candidate.name}</span>
//                     </div>
//                     <span className="font-bold">{candidate.votes} votes ({percentage}%)</span>
//                   </div>

//                   <div className="bg-gray-300 h-3 rounded-full overflow-hidden">
//                     <div
//                       className="bg-blue-600 h-full transition-all"
//                       style={{ width: `${percentage}%` }}
//                     />
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Blockchain Info */}
//           <h3 className="text-2xl font-bold mb-4">🔗 Blockchain Verification</h3>
//           <div className="bg-gray-50 rounded-lg p-6">
//             <div className="space-y-3">
//               <div>
//                 <p className="text-sm text-gray-500">Election Transaction Hash</p>
//                 <p className="font-mono text-blue-600 break-all">{election.txHash}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Block Number</p>
//                 <p className="font-mono">#{election.blockNumber || "N/A"}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Finalized</p>
//                 <p className="font-semibold">
//                   ✓ Finalized on {new Date(election.endTime).toLocaleDateString()}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
