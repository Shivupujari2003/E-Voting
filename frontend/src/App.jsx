import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";

// Pages (uncomment when you create them)
import Home from "./pages/Home";
import Register from "./pages/Register";
import LoginVoter from "./pages/LoginVoter";
import AdminLogin from "./pages/LoginAdmin";
import VoterDashboard from "./pages/VoterDashboard";
import Results from "./pages/Result";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <Router>
      {/* Navbar stays at the top */}
      <Navbar />

      {/* Push page content below fixed navbar */}
      <div className="pt-20 min-h-screen bg-gray-100 text-gray-800">
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />

          {/* Auth Pages */}
          <Route path="/register" element={<Register />} />
          <Route path="/login-voter" element={<LoginVoter />} />
          <Route path="/login-admin" element={<AdminLogin />} /> 
          <Route path="/results" element={<Results />} />
          {/* Dashboards */}
          <Route path="/voter/dashboard" element={<VoterDashboard />} /> 
          <Route path="/admin/dashboard" element={<AdminDashboard />} /> 
        </Routes>
      </div>
    </Router>
  );
}
