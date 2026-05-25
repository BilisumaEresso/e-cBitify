import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  ShoppingBag,
  Tag,
  Filter,
  Zap,
  RefreshCw,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import ProductCard from "../../components/ProductCard";
import { useAuth } from "../../context/AuthContext";
import { aiAPI } from "../../../services/apiHelpers";
import toast from "react-hot-toast";

const AIPicksPage = () => {
  const [recommendations, setRecommendations] = useState({
    products: [],
    strategy: "",
    confidence: 0,
    loading: true,
    error: null,
    lastUpdated: null,
  });
  const { user } = useAuth();

  const fetchRecommendations = async () => {
    try {
      setRecommendations((prev) => ({ ...prev, loading: true, error: null }));
      const response = await aiAPI.getRecommendations();
      console.log(response.data.products)
      if (response.data.status) {
        setRecommendations({
          products: response.data.products,
          strategy: response.data.strategy || "Personalized",
          confidence: response.data.confidence || 0,
          loading: false,
          error: null,
          lastUpdated: response.data.updatedAt,
          expiresAt:response.data.expiresAt
        });
      }
    } catch (error) {
      toast.error("Failed to fetch recommendations");
      setRecommendations((prev) => ({
        ...prev,
        loading: false,
        error:
          error.response?.data?.message || "Failed to load AI recommendations",
      }));
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const getStrategyIcon = (strategy) => {
    switch (strategy.toLowerCase()) {
      case "popular":
        return <TrendingUp className="h-4 w-4" />;
      case "trending":
        return <Zap className="h-4 w-4" />;
      case "recent":
        return <Clock className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getStrategyColor = (strategy) => {
    switch (strategy.toLowerCase()) {
      case "popular":
        return "bg-orange-100 text-orange-700";
      case "trending":
        return "bg-purple-100 text-purple-700";
      case "recent":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-indigo-100 text-indigo-700";
    }
  };

  if (recommendations.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Skeleton Header */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>

            {/* Skeleton Filters */}
            <div className="flex flex-wrap gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-lg w-32"></div>
              ))}
            </div>

            {/* Skeleton Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow p-4">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Failed to Load Recommendations
            </h2>
            <p className="text-gray-600 mb-6">Server is too busy, please again after <strong>5</strong> minutes</p>
            <button
              onClick={fetchRecommendations}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b pt-15 from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center mb-4">
            <Sparkles className="h-8 w-8 mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold">
              AI Picks Just For You
            </h1>
          </div>
          <p className="text-lg text-indigo-100 mb-6 max-w-2xl">
            Personalized recommendations based on your preferences, browsing
            history, and trending patterns.
          </p>

          {/* Strategy Info */}
          <div className="flex flex-wrap items-center gap-4">
            <div
              className={`px-4 py-2 rounded-full flex items-center ${getStrategyColor(
                recommendations.strategy
              )}`}
            >
              {getStrategyIcon(recommendations.strategy)}
              <span className="ml-2 font-medium">
                {recommendations.strategy} Picks
              </span>
            </div>

            <div className="flex items-center text-sm">
              <div className="w-32 bg-white/20 rounded-full h-2 mr-3">
                <div
                  className="bg-green-400 h-full rounded-full"
                  style={{ width: `${recommendations.confidence * 100}%` }}
                ></div>
              </div>
              <span>
                {(recommendations.confidence * 100).toFixed(0)}% Confidence
              </span>
            </div>

            {recommendations.lastUpdated && (
              <div className="text-sm text-indigo-200 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Updated{" "}
                {new Date(recommendations.lastUpdated).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}

            <button
              onClick={fetchRecommendations}
              className="ml-auto px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Chips */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-full flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            All Recommendations
            <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {recommendations.products.length}
            </span>
          </button>

          {[
            "Trending Now",
            "Best Sellers",
            "Based on History",
            "New Arrivals",
          ].map((filter) => (
            <button
              key={filter}
              className="px-4 py-2 bg-white border border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 rounded-full text-gray-700 hover:text-indigo-700 transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Products Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Your Personalized Selection
            </h2>
            <Link
              to="/products"
              className="text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              View All Products
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {recommendations.products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendations.products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow border-l-4 border-indigo-500">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Average Rating</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {(
                          recommendations.products.reduce(
                            (acc, p) => acc + (p.averageRating || 0),
                            0
                          ) / (recommendations.products.length || 1)
                        ).toFixed(1)}
                        <span className="text-sm text-gray-500"> / 5</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
                  <div className="flex items-center">
                    <ShoppingBag className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Avg Price</p>
                      <p className="text-2xl font-bold text-gray-800">
                        $
                        {(recommendations.products.length > 0
                          ? recommendations.products.reduce(
                              (acc, p) => acc + Number(p.price || 0),
                              0
                            ) / recommendations.products.length
                          : 0
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500">
                  <div className="flex items-center">
                    <Tag className="h-5 w-5 text-purple-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Categories</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {
                          new Set(
                            recommendations.products
                              .map((p) => p.category?.name)
                              .filter(Boolean)
                          ).size
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Recommendations Yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start browsing products and making purchases to receive
                personalized AI recommendations.
              </p>
              <Link
                to="/products"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
            </div>
          )}
        </div>

        {/* AI Explanation */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
          <div className="flex items-start mb-4">
            <Sparkles className="h-6 w-6 text-indigo-600 mr-3 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                How AI Recommendations Work
              </h3>
              <p className="text-gray-700">
                Our AI analyzes your browsing history, purchase patterns, and
                trending products to curate personalized recommendations just
                for you. The system learns from your preferences and
                continuously improves its suggestions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-indigo-600 font-bold text-lg mb-2">
                1. Behavior Analysis
              </div>
              <p className="text-sm text-gray-600">
                Tracks your product views, wishlist additions, and purchase
                history.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-indigo-600 font-bold text-lg mb-2">
                2. Pattern Recognition
              </div>
              <p className="text-sm text-gray-600">
                Identifies your preferences across categories, brands, and price
                ranges.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-indigo-600 font-bold text-lg mb-2">
                3. Real-time Updates
              </div>
              <p className="text-sm text-gray-600">
                Refreshes recommendations based on new trends and your latest
                activity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPicksPage;
