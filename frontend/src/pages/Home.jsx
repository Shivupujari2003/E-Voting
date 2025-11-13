export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Blockchain E-Voting System
        </h1>

        <p className="text-xl text-gray-700 mb-10">
          Secure • Transparent • Decentralized
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <a
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition shadow-lg hover:shadow-xl"
          >
            📝 Register as Voter
          </a>

          <a
            href="/login-voter"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition shadow-lg hover:shadow-xl"
          >
            🔐 Login as Voter
          </a>

          <a
            href="/login-admin"
            className="bg-gray-700 hover:bg-gray-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition shadow-lg hover:shadow-xl"
          >
            👔 Login as Admin
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <FeatureCard
          icon="🔒"
          title="Blockchain Security"
          description="Votes are immutably recorded on-chain ensuring tamper-proof elections."
        />

        <FeatureCard
          icon="👤"
          title="Face Recognition"
          description="Biometric verification prevents impersonation and fake votes."
        />

        <FeatureCard
          icon="📊"
          title="Real-time Results"
          description="Get instant on-chain election results without delays."
        />

        <FeatureCard
          icon="🔍"
          title="Audit Trail"
          description="Full transparency with verifiable blockchain logs."
        />

      </div>
    </div>
  );
}

// ----------------------------------
// Feature Card Component
// ----------------------------------

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
