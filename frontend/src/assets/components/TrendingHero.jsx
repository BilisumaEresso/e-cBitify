export default function TrendingHero() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        {/* AI Signal Animation */}
        <div className="flex justify-center">
          <div className="signal-container">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="signal-bar"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div>
          <h1 className="text-5xl font-bold mb-6">
            AI-Powered
            <br />
            <span className="text-purple-600">Trending Intelligence</span>
          </h1>

          <p className="text-gray-600 max-w-xl mb-8">
            Live trends detected by AI analyzing global signals, search
            momentum, and social activity in real time.
          </p>

          <button className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-900 transition">
            Explore Trends
          </button>
        </div>
      </div>
    </section>
  );
}
