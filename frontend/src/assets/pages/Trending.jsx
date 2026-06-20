import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Flame,
  BarChart3,
  Clock,
  ArrowUpRight,
  ShoppingBag,
  Hash,
  Calendar,
  Filter,
  RefreshCw,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import { aiAPI, productAPI } from "../../services/apiHelpers";

const TrendingPage = () => {
  const [trends, setTrends] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("today");

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const [trendsResponse, productsResponse] = await Promise.all([
        aiAPI.getTrends("/ai/trends"),
        productAPI.getAll("/products"),
      ]);

      if (trendsResponse.data.status) {
        setTrends(trendsResponse.data.trends || []);
      }

      if (productsResponse.data.status) {
        setTrendingProducts(productsResponse.data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch trends:", err);
      setError("Failed to load trending data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const getTrendIntensity = (reason = "") => {
    const intensityWords = [
      "rising",
      "popular",
      "growing",
      "exploding",
      "surging",
    ];
    return intensityWords.some((word) => (reason || "").toLowerCase().includes(word))
      ? "high"
      : "medium";
  };



  const filteredTrends = trends.filter((trend) => {
    if (activeFilter === "all") return true;
    return trend.category.toLowerCase() === activeFilter.toLowerCase();
  });

  const timeRanges = [
    { value: "today", label: "Today", icon: <Clock className="h-4 w-4" /> },
    {
      value: "week",
      label: "This Week",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      value: "month",
      label: "This Month",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      value: "all",
      label: "All Time",
      icon: <BarChart3 className="h-4 w-4" />,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r pt-15 from-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center mb-4">
            <Flame className="h-8 w-8 mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold">
              What's Trending Now
            </h1>
          </div>
          <p className="text-lg text-orange-100 mb-6 max-w-2xl">
            Discover the hottest products and categories based on real-time AI
            analysis of market trends and user behavior.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="px-4 py-2 bg-white/20 rounded-full flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span>Powered by AI Trend Analysis</span>
            </div>

            <div className="text-sm text-orange-200 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Updated daily
            </div>

            <button
              onClick={fetchTrends}
              className="ml-auto px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Trends
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Range Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Trend Period
          </h2>
          <div className="flex flex-wrap gap-3">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-lg flex items-center transition-all ${
                  timeRange === range.value
                    ? "bg-orange-100 text-orange-700 border-2 border-orange-300"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-orange-300"
                }`}
              >
                {range.icon}
                <span className="ml-2">{range.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Trends List */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Top Trends
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({filteredTrends.length} trends)
                </span>
              </h2>

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Categories</option>
                  {Array.from(new Set(trends.map((t) => t.category))).map(
                    (category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {error ? (
              <div className="text-center py-12">
                <div className="text-red-400 mb-4">⚠️</div>
                <p className="text-gray-600">{error}</p>
                <button
                  onClick={fetchTrends}
                  className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Try Again
                </button>
              </div>
            ) : filteredTrends.length > 0 ? (
              <div className="space-y-4">
                {filteredTrends.map((trend, index) => (
                  <div
                    key={trend._id}
                    className="bg-white rounded-xl shadow-lg border-l-4 border-orange-500 overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div>
                            <div className="flex items-center">
                              <span className="font-bold text-gray-900 text-lg">
                                {trend.name}
                              </span>
                              {index < 3 && (
                                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded">
                                  #{index + 1} TRENDING
                                </span>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Hash className="h-3 w-3 mr-1" />
                              {trend.category}
                              <span className="mx-2">•</span>
                              <span
                                className={`flex items-center ${
                                  getTrendIntensity(trend.reason) === "high"
                                    ? "text-red-500"
                                    : "text-orange-500"
                                }`}
                              >
                                <TrendingUpIcon className="h-3 w-3 mr-1" />
                                {getTrendIntensity(
                                  trend.reason
                                ).toUpperCase()}{" "}
                                INTENSITY
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-500">Source</div>
                          <div className="text-sm font-medium">
                            {trend.source}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{trend.reason}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          Detected{" "}
                          {new Date(trend.createdAt).toLocaleDateString()}
                        </div>

                        <Link
                          to={`/product`}
                
                          className="text-orange-600 hover:text-orange-800 flex items-center text-sm font-medium"
                        >
                          Shop {trend.category}
                          <ArrowUpRight className="h-4 w-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Trends Available
                </h3>
                <p className="text-gray-600">
                  AI trends analysis is currently being processed. Check back
                  soon!
                </p>
              </div>
            )}

            {/* Trend Insights */}
            {trends.length > 0 && (
              <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
                  Trend Insights
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-sm text-gray-600">
                          Most Trending Category
                        </div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">
                          {(() => {
                            const categories = trends.map((t) => t.category);
                            const frequency = {};
                            categories.forEach((cat) => {
                              frequency[cat] = (frequency[cat] || 0) + 1;
                            });
                            const mostFrequent = Object.keys(frequency).reduce(
                              (a, b) => (frequency[a] > frequency[b] ? a : b)
                            );
                            return mostFrequent;
                          })()}
                        </div>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="text-sm text-gray-600">
                      Appears in{" "}
                      {
                        trends.filter(
                          (t) =>
                            t.category ===
                            (() => {
                              const categories = trends.map((t) => t.category);
                              const frequency = {};
                              categories.forEach((cat) => {
                                frequency[cat] = (frequency[cat] || 0) + 1;
                              });
                              return Object.keys(frequency).reduce((a, b) =>
                                frequency[a] > frequency[b] ? a : b
                              );
                            })()
                        ).length
                      }{" "}
                      trends
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-sm text-gray-600">
                          Trend Velocity
                        </div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">
                          {
                            trends.filter(
                              (t) => getTrendIntensity(t.reason) === "high"
                            ).length
                          }
                          <span className="text-lg font-normal text-gray-600">
                            {" "}
                            / {trends.length}
                          </span>
                        </div>
                      </div>
                      <Flame className="h-8 w-8 text-red-500" />
                    </div>
                    <div className="text-sm text-gray-600">
                      High intensity trends this period
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Trending Products */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <ShoppingBag className="h-6 w-6 text-orange-600 mr-3" />
                  Trending Products
                </h3>

                {trendingProducts.length > 0 ? (
                  <div className="space-y-4">
                    {trendingProducts.slice(0, 5).map((product, index) => (
                      <Link
                        key={product._id}
                        to={`/product/${product._id}`}
                        className="flex items-center p-3 rounded-lg hover:bg-orange-50 group transition-colors"
                      >
                        <div className="relative">
                          <img
                            src={
                              product.photo?.[0]?.signedUrl ||
                              "/placeholder.png"
                            }
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          {index < 3 && (
                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              #{index + 1}
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flex-1">
                          <h4 className="font-medium text-gray-800 group-hover:text-orange-600 line-clamp-1">
                            {product.name}
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-gray-600">
                              {product.sold || 0} sold
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}

                    <Link
                      to="/product"
                      className="block w-full py-3 text-center text-orange-600 hover:text-orange-800 font-medium border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      View All Trending Products
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingDown className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No trending products available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingPage;
