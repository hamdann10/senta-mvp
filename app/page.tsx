import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen text-white bg-gray-950 antialiased">

      {/* ================= HERO ================= */}
      <section
        id="hero"
        className="relative flex items-center justify-center text-center px-6 pt-24 min-h-screen overflow-hidden"
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -z-10" />

        <div className="relative max-w-4xl mx-auto">

         

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Financial News Sentiment.
            <br />
            <span className="text-blue-400">Made Actionable.</span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Real-time sentiment intelligence for Indian stocks.
            Analyze financial news signals and make informed decisions with clarity.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium transition"
            >
              Get Started Free
            </Link>

            <a
              href="#features"
              className="px-8 py-3 rounded-lg border border-gray-700 hover:border-blue-500 hover:text-white transition text-gray-300"
            >
              Explore Features
            </a>
          </div>

          {/* Trust Row */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <span>1000+ NSE Stocks</span>
            <span>•</span>
            <span>AI-Powered Analysis</span>
            <span>•</span>
            <span>Smart Alerts</span>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about" className="py-24 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-semibold">
            What is Senta?
          </h2>

          <p className="text-gray-300 text-lg leading-relaxed">
            Senta aggregates financial news, analyzes it using{" "}
            <span className="text-blue-400 font-medium">FinBERT</span>,
            and transforms raw headlines into structured sentiment insights —
            helping traders react faster with confidence.
          </p>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-24 bg-gray-950 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6">

          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-semibold">
              Key Features
            </h3>
            <p className="mt-3 text-gray-400 max-w-2xl mx-auto">
              Designed for focused, intelligent market monitoring.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {[
              {
                title: "Real-time Signals",
                desc: "Live sentiment analysis from the latest financial news.",
              },
              {
                title: "Advanced Dashboard",
                desc: "Visual trend charts and correlation insights.",
              },
              {
                title: "Personal Watchlist",
                desc: "Track up to 2 stocks and receive smart alerts.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-8 bg-gray-900/70 border border-gray-800 rounded-2xl hover:border-gray-700 transition"
              >
                <h4 className="text-lg font-semibold mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section id="contact" className="py-24 border-t border-gray-800">
        <div className="max-w-2xl mx-auto px-6 text-center space-y-8">

          <div>
            <h4 className="text-3xl font-semibold">Get in Touch</h4>
            <p className="text-gray-400 mt-2">
              Questions or feedback? We’d love to hear from you.
            </p>
          </div>

          <form className="space-y-5">
            <input
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              rows={4}
              placeholder="Your message..."
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-10 border-t border-gray-800 text-sm text-gray-400 text-center">
        © {new Date().getFullYear()} Senta. Built with AI-powered sentiment intelligence.
      </footer>
    </main>
  );
}