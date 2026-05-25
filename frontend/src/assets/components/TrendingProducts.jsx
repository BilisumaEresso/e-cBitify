import { Sparkles, TrendingUp, Globe } from "lucide-react";

const trendingData = [
  {
    name: "AI Resume Review Tools",
    category: "Productivity",
    reason: "Increased demand due to global hiring slowdown",
    source: "Web trend analysis",
  },
  {
    name: "Smart Home Energy Monitors",
    category: "IoT",
    reason: "Rising energy costs and sustainability concerns",
    source: "Social media signals",
  },
  {
    name: "Portable Solar Power Banks",
    category: "Electronics",
    reason: "High travel demand and eco-conscious usage",
    source: "E-commerce trend scraping",
  },
  {
    name: "AI Note-Taking Assistants",
    category: "Education",
    reason: "Rapid adoption among students and remote workers",
    source: "AI market inference",
  },
];

function TrendingAISection() {
  return (
    <section className="py-14 px-6 md:px-10 bg-linear-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="flex items-center gap-2 text-purple-600 mb-3">
          <Sparkles className="animate-pulse" size={22} />
          <span className="text-sm uppercase tracking-widest font-semibold">
            AI Generated
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold uppercase text-gray-900">
          Trending Products
        </h1>

        <p className="text-gray-600 mt-3 max-w-xl text-sm md:text-base">
          Products detected by AI based on global interest, demand signals, and
          online activity.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {trendingData.map((item, index) => (
          <div
            key={index}
            className="relative bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* AI badge */}
            <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-600 font-semibold">
              AI Trend
            </span>

            {/* Category */}
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              {item.category}
            </p>

            {/* Name */}
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {item.name}
            </h2>

            {/* Reason */}
            <p className="text-gray-600 text-sm mb-4">{item.reason}</p>

            {/* Source */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Globe size={14} />
              <span>Source: {item.source}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="flex justify-center mt-10 text-xs text-gray-500">
        <TrendingUp size={14} className="mr-2" />
        Updated periodically using AI trend analysis
      </div>
    </section>
  );
}

export default TrendingAISection;
