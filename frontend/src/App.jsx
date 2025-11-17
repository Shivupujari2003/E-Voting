import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import Register from "./pages/Register";
import LoginVoter from "./pages/LoginVoter";
import AdminLogin from "./pages/LoginAdmin";
import VoterDashboard from "./pages/VoterDashboard";
// import Results from "./pages/Result";
import AdminDashboard from "./pages/AdminDashboard";
// import ProfilePage from "./pages/Profile";
// import AuditLogPage from "./pages/AuditLog";

export default function App() {
  return (
    <Router>
      {/* Navbar stays fixed at top */}
      <Navbar />

      {/* Push content below navbar */}
      <div className="pt-20 min-h-screen bg-gray-100 text-gray-800">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Auth Pages */}
          <Route path="/register" element={<Register />} />
          <Route path="/login-voter" element={<LoginVoter />} />
          <Route path="/login-admin" element={<AdminLogin />} />

          {/* Results */}
          {/* <Route path="/results" element={<Results />} /> */}

          {/* Dashboards */}
          <Route path="/voter/dashboard" element={<VoterDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Profile */}
          {/* <Route path="/profile" element={<ProfilePage />} /> */}
          {/* <Route path="/audit-log" element={<AuditLogPage />} /> */}
        </Routes>
      </div>
    </Router>
  );
}
