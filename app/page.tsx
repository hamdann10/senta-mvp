import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen text-white bg-gradient-to-b from-slate-900 via-slate-900 to-black antialiased">
      {/* NOTE:
          If you already render your client Navbar component (app/components/Navbar.tsx)
          from layout.tsx, remove this <header> block to avoid duplicate navbars.
      */}
      

      {/* HERO - exactly viewport height, centered content */}
      <section
        id="hero"
        className="relative flex items-center justify-center text-center px-5 pt-[72px] min-h-screen"
        style={{
          backgroundImage:
            `linear-gradient(180deg, rgba(2,6,23,0.64), rgba(2,6,23,0.78)), url('/mnt/data/babcd84a-51da-4384-8ea1-64b131a4e58c.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="w-full max-w-4xl mx-auto">
          <div className="px-4 md:px-0">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight drop-shadow-[0_12px_30px_rgba(0,0,0,0.6)]">
              Senta
            </h1>

            <p className="mt-4 text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Market Sentiment Analysis for Indian Stocks — concise, reliable signals from News & Social.
            </p>

            <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
              Real-time sentiment scores and alerts powered by FinBERT — less noise, more signal.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-white text-black px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition"
              >
                Get started
              </Link>

              <a
                href="#features"
                className="inline-flex items-center justify-center text-slate-200 border border-white/20 px-5 py-3 rounded-full hover:bg-white/5 transition"
              >
                See features
              </a>
            </div>

            <div className="mt-5 text-sm text-slate-400">
              <span className="inline-block mr-2 text-sky-400">•</span>
              Live sentiment for NIFTY50 & SENSEX (news + social).
            </div>
          </div>
        </div>
      </section>

      {/* soft separator */}
      <div className="h-6 bg-gradient-to-b from-transparent to-slate-900/80" />

      {/* ABOUT - balanced padding */}
      <section id="about" className="bg-slate-900/60 border-t border-slate-800 py-14">
        <div className="max-w-5xl mx-auto px-5 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white">About Senta</h2>
          <p className="mt-4 text-slate-300 max-w-3xl mx-auto leading-relaxed md:text-lg">
            Senta aggregates financial news and public social signals, analyzes them with a financial-domain
            language model (FinBERT), and surfaces concise, actionable sentiment so traders can make faster,
            better-informed decisions.
          </p>
        </div>
      </section>

      {/* separator with subtle gradient */}
      <div className="h-10 bg-gradient-to-b from-slate-900/60 to-slate-900/30" />

      {/* FEATURES - roomy, consistent cards */}
      <section id="features" className="py-16 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-5 md:px-6">
          <h3 className="text-2xl md:text-3xl font-semibold text-center text-white">Key features</h3>
          <p className="mt-3 text-center text-slate-400 max-w-2xl mx-auto">
            Fast, domain-aware sentiment for indices and stocks with a minimal, trader-first UX.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <article className="p-6 bg-slate-800/60 rounded-2xl border border-slate-700 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center font-bold text-white">1</div>
                <div>
                  <h4 className="text-white font-semibold">Real-time signals</h4>
                  <p className="text-slate-300 mt-2 text-sm leading-relaxed">Continuously fetch and analyze the latest market news to provide live sentiment updates.</p>
                </div>
              </div>
            </article>

            <article className="p-6 bg-slate-800/60 rounded-2xl border border-slate-700 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center font-bold text-white">N</div>
                <div>
                  <h4 className="text-white font-semibold">News + Social</h4>
                  <p className="text-slate-300 mt-2 text-sm leading-relaxed">Blend authoritative articles with social chatter for stronger sentiment signals.</p>
                </div>
              </div>
            </article>

            <article className="p-6 bg-slate-800/60 rounded-2xl border border-slate-700 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center font-bold text-white">★</div>
                <div>
                  <h4 className="text-white font-semibold">Personal Watchlist</h4>
                  <p className="text-slate-300 mt-2 text-sm leading-relaxed">Save up to 5 stocks and get alerts when sentiment shifts significantly.</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* CONTACT - tuned form spacing */}
      <section id="contact" className="bg-slate-900/60 border-t border-slate-800 py-12">
        <div className="max-w-3xl mx-auto px-5 md:px-6 text-center">
          <h4 className="text-xl font-semibold text-white">Contact</h4>
          <p className="text-slate-300 mt-3">Questions, feedback or partnership — drop a short message and we'll reply.</p>

          <form action="#" className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" placeholder="Your name" className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white" />
            <input name="email" placeholder="Email" className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white" />

            <textarea name="message" rows={5} placeholder="Message" className="col-span-1 md:col-span-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white" />

            <div className="col-span-1 md:col-span-2 flex justify-center">
              <button type="submit" className="bg-sky-600 hover:bg-sky-700 px-6 py-3 rounded-lg font-semibold">Send message</button>
            </div>
          </form>
        </div>
      </section>

      {/* FOOTER - compact and balanced */}
      <footer className="py-8 text-center text-slate-400">
        <div className="max-w-6xl mx-auto px-5 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm">© {new Date().getFullYear()} Senta. All rights reserved.</div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <a href="mailto:hello@senta.example" className="hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
