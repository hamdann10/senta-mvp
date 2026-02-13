import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen text-white bg-slate-950 antialiased">
      {/* HERO - premium gradient background with overlay */}
      <section
        id="hero"
        className="relative flex items-center justify-center text-center px-5 pt-[72px] min-h-screen overflow-hidden"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-900/20 to-slate-950 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10" />

        <div className="relative w-full max-w-4xl mx-auto">
          <div className="px-4 md:px-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
              <span className="text-xs font-semibold text-blue-300">✨ Powered by FinBERT</span>
            </div>

            {/* Main heading */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight tracking-tight drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
              <span className="bg-gradient-to-r from-blue-200 via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                Senta
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-xl md:text-2xl font-medium text-slate-200 max-w-3xl mx-auto leading-relaxed">
              Real-time sentiment analysis for Indian stocks powered by advanced AI
            </p>

            <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-lg">
              Analyze market sentiment from financial news signals. Get actionable insights with minimal noise.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Get Started Free
              </Link>

              <a
                href="#features"
                className="inline-flex items-center justify-center text-slate-200 border-2 border-slate-500 hover:border-blue-400 hover:bg-blue-500/5 px-7 py-3.5 rounded-lg font-semibold transition-all duration-200"
              >
                Explore Features
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-blue-400">📊</span>
                <span>1000+ NSE Stocks</span>
              </div>
              <div className="h-5 w-px bg-slate-700" />
              <div className="flex items-center gap-2">
                <span className="text-blue-400">⚡</span>
                <span>Real-time Updates</span>
              </div>
              <div className="h-5 w-px bg-slate-700" />
              <div className="flex items-center gap-2">
                <span className="text-blue-400">🔒</span>
                <span>Enterprise Security</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT - refined section */}
      <section id="about" className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-4xl mx-auto px-5 md:px-6">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              What is Senta?
            </h2>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
              Senta aggregates financial news, analyzes them with <span className="text-blue-300 font-semibold">FinBERT</span> — a financial-domain language model — and delivers concise, actionable sentiment insights. Make faster, better-informed trading decisions with institutional-grade analysis.
            </p>
          </div>

          {/* Stats grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="text-3xl font-bold text-blue-400">1730+</div>
              <p className="text-slate-300 mt-2">NSE Stocks Supported</p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="text-3xl font-bold text-cyan-400">Real-time</div>
              <p className="text-slate-300 mt-2">Sentiment Updates</p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="text-3xl font-bold text-blue-300">FinBERT</div>
              <p className="text-slate-300 mt-2">AI-Powered Analysis</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES - premium card design */}
      <section id="features" className="py-20 bg-slate-950">
        <div className="max-w-6xl mx-auto px-5 md:px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">Key Features</h3>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Everything you need for professional sentiment analysis and trading insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <article className="group relative p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 hover:border-blue-500/50 shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold mb-4">
                  ⚡
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Real-time Signals</h4>
                <p className="text-slate-300 leading-relaxed">
                  Continuously fetch and analyze the latest market news to provide live sentiment updates every minute.
                </p>
              </div>
            </article>

            {/* Feature 2 */}
            <article className="group relative p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 hover:border-cyan-500/50 shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-xl font-bold mb-4">
                  📰
                </div>
                <h4 className="text-xl font-bold text-white mb-3">News</h4>
                <p className="text-slate-300 leading-relaxed">
                  Blend authoritative financial articles with social signals for comprehensive market sentiment analysis.
                </p>
              </div>
            </article>

            {/* Feature 3 */}
            <article className="group relative p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 hover:border-amber-500/50 shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl font-bold mb-4">
                  ⭐
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Personal Watchlist</h4>
                <p className="text-slate-300 leading-relaxed">
                  Save up to 2 stocks and receive instant alerts when sentiment shifts significantly.
                </p>
              </div>
            </article>
          </div>

          {/* Additional features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 flex gap-4 bg-slate-800/30 rounded-xl border border-slate-700">
              <div className="text-2xl flex-shrink-0">📊</div>
              <div>
                <h5 className="font-semibold text-white mb-1">Advanced Dashboard</h5>
                <p className="text-slate-400 text-sm">Visualize sentiment trends with professional charts and analytics</p>
              </div>
            </div>
            <div className="p-6 flex gap-4 bg-slate-800/30 rounded-xl border border-slate-700">
              <div className="text-2xl flex-shrink-0">🔔</div>
              <div>
                <h5 className="font-semibold text-white mb-1">Smart Alerts</h5>
                <p className="text-slate-400 text-sm">Get notifications when significant sentiment changes occur</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT - professional form */}
      <section id="contact" className="py-20 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800">
        <div className="max-w-2xl mx-auto px-5 md:px-6">
          <div className="text-center mb-12">
            <h4 className="text-3xl md:text-4xl font-bold text-white mb-3">Get in Touch</h4>
            <p className="text-slate-300">Have questions or feedback? We'd love to hear from you.</p>
          </div>

          <form action="#" className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="name"
                placeholder="Your name"
                className="px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition"
              />
              <input
                name="email"
                type="email"
                placeholder="Email address"
                className="px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            <textarea
              name="message"
              rows={5}
              placeholder="Your message..."
              className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
            />

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* FOOTER - polished footer */}
      <footer className="py-10 border-t border-slate-800 bg-slate-950">
        <div className="max-w-6xl mx-auto px-5 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm text-slate-400">
              © {new Date().getFullYear()} Senta. Built for traders, powered by AI.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-slate-400 hover:text-white transition">Privacy Policy</Link>
              <Link href="/terms" className="text-slate-400 hover:text-white transition">Terms of Service</Link>
              <a href="mailto:hello@senta.example" className="text-slate-400 hover:text-white transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
