// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { adminLogin } from "../services/api";

// export default function AdminLogin() {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   // =======================================================
//   // BACKEND LOGIN CALL
//   // =======================================================
//   const handleLogin = async () => {
//     if (!email || !password) {
//       alert("Please enter email and password");
//       return;
//     }

//     const res = await adminLogin({ email, password });

//     if (res.error) {
//       alert(res.error);
//       return;
//     }

//     alert("Admin login successful!");
//     navigate("/admin/dashboard");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 text-gray-800">
//       <div className="container mx-auto px-4 py-16 max-w-md">
//         <div className="bg-white rounded-xl shadow-lg p-8">
//           <h2 className="text-3xl font-bold mb-6 text-center">Admin Login</h2>

//           {/* Demo Info Box */}
//           <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-6 text-sm">
//             <p className="font-semibold mb-2">🔑 Admin Login</p>
//             <p>Enter your registered admin credentials.</p>
//           </div>

//           <div className="space-y-4">
//             {/* Email */}
//             <div>
//               <label className="block mb-2 font-medium">Email Address</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-4 py-2 rounded-lg border border-gray-300"
//                 placeholder="admin@example.com"
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <label className="block mb-2 font-medium">Password</label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full px-4 py-2 rounded-lg border border-gray-300"
//                 placeholder="Enter password"
//               />
//             </div>

//             {/* Login Button */}
//             <button
//               onClick={handleLogin}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
//             >
//               Login as Admin
//             </button>

//             {/* Back Button */}
//             <button
//               onClick={() => navigate("/")}
//               className="w-full bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-semibold transition"
//             >
//               ← Back to Home
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
