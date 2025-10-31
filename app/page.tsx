export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex flex-col items-center justify-center px-6">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          Senta
        </h1>

        <p className="text-gray-300 text-lg md:text-xl">
          Market Sentiment Analysis for Indian Stocks 📊
        </p>

        <p className="text-gray-400">
          Get real-time insights on market mood using AI-powered sentiment
          analysis from trusted financial news sources.
        </p>

        <div className="pt-6">
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300">
            Get Started
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="absolute bottom-4 text-gray-500 text-sm">
        © {new Date().getFullYear()} Senta. All rights reserved.
      </footer>
    </main>
  );
}
