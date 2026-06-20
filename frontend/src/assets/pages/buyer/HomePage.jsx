import { useEffect, useState } from "react";
import { aiAPI, categoryAPI, productAPI } from "../../../services/apiHelpers";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Shield,
  Truck,
  ArrowRight,
  Loader2,
  Tag,
} from "lucide-react";
import ProductCard from "../../components/ProductCard";

export default function HomePage() {
  const navigate = useNavigate();
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingAI(true);
        const [recRes, catRes] = await Promise.all([
          aiAPI.getRecommendations(),
          categoryAPI.getAll(),
        ]);
        setAiRecommendations(recRes.data.products || []);
        setCategories((catRes.data.categories || []).slice(0, 6));
      } catch {
        toast.error("Failed to load recommendations");
      } finally {
        setLoadingAI(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const wordCount = searchQuery.trim().split(/\s+/).length;
    try {
      setLoadingSearch(true);
      setSearchResults([]);
      const res =
        wordCount > 3
          ? await productAPI.aiSearch(encodeURIComponent(searchQuery))
          : await productAPI.search(searchQuery);

      const products =
        res.data?.products && Array.isArray(res.data.products)
          ? res.data.products
          : Array.isArray(res.data)
          ? res.data
          : [];
      setSearchResults(products);
    } catch {
      toast.error("Search failed");
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const showRecommendations = searchResults.length === 0 && !loadingSearch;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 text-sm text-blue-100 mb-6">
            <Sparkles size={14} className="text-amber-300" />
            AI-powered shopping on e-cBitify
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Find exactly what you need
          </h1>
          <p className="text-lg text-blue-100/90 max-w-2xl mx-auto mb-10">
            Search naturally — our AI understands long descriptions and finds the right products for you.
          </p>

          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto flex items-center bg-white rounded-2xl shadow-2xl shadow-black/20 p-1.5 gap-1"
          >
            <Search size={20} className="text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Try: comfortable running shoes under $80"
              className="flex-1 px-3 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none text-base"
            />
            <button
              type="submit"
              disabled={loadingSearch}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-3.5 rounded-xl font-semibold transition shrink-0 flex items-center gap-2"
            >
              {loadingSearch ? <Loader2 size={18} className="animate-spin" /> : "Search"}
            </button>
          </form>

          {loadingSearch && (
            <p className="mt-4 text-sm text-blue-200 flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Searching…
            </p>
          )}

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-blue-100/80">
            <span className="flex items-center gap-2">
              <Shield size={16} className="text-emerald-400" /> Secure checkout
            </span>
            <span className="flex items-center gap-2">
              <Truck size={16} className="text-emerald-400" /> Fast delivery
            </span>
            <span className="flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" /> Trending picks
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        {/* Category shortcuts */}
        {showRecommendations && categories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Shop by category</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => navigate(`/product?category=${cat._id}`)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  <Tag size={14} />
                  {cat.name}
                </button>
              ))}
              <button
                onClick={() => navigate("/product")}
                className="flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View all <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Search results */}
        {searchResults.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Results for &ldquo;{searchQuery}&rdquo;
              </h2>
              <span className="text-sm text-slate-500">{searchResults.length} products</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {searchResults.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}

        {!loadingSearch && searchQuery && searchResults.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 mb-12">
            <Search size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No matches found</h3>
            <p className="text-slate-500 mb-6">Try different keywords or browse all products.</p>
            <button
              onClick={() => { setSearchQuery(""); setSearchResults([]); }}
              className="text-blue-600 font-medium hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Recommendations */}
        {showRecommendations && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Recommended for you</h2>
                <p className="text-slate-500 text-sm mt-1">Curated based on popular purchases</p>
              </div>
              <button
                onClick={() => navigate("/ai-recommendation")}
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                AI picks <ArrowRight size={14} />
              </button>
            </div>

            {loadingAI ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                    <div className="aspect-square bg-slate-100" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                      <div className="h-4 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : aiRecommendations.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                <ShoppingBag className="h-14 w-14 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No recommendations yet</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Browse our catalog and place an order — we&apos;ll personalize suggestions for you.
                </p>
                <button
                  onClick={() => navigate("/product")}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
                >
                  Browse products <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {aiRecommendations.map((product) => (
                  <ProductCard key={product._id} product={product} badge="For you" />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
