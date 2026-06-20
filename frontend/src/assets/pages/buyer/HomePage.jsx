// TODO:check before deploy
import { useEffect, useState } from "react";
import { aiAPI, productAPI } from "../../../services/apiHelpers";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertCircle, Search, ShoppingBag } from "lucide-react";
import ProductCard from "../../components/ProductCard";
import { GoArrowDownRight, GoArrowRight, GoArrowUpRight, GoCheck } from "react-icons/go";

export default function HomePage() {
  const navigate = useNavigate();

  // -----------------------------
  // STATE
  // -----------------------------
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // -----------------------------
  // FETCH RECOMMENDATIONS ON LANDING (NON-AI)
  // -----------------------------
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoadingAI(true);
        const products = await aiAPI.getRecommendations();
        setAiRecommendations(products.data.products);

      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        toast.error(
            "Failed to load recommendations"
        );

      } finally {
        setLoadingAI(false);
      }
    };

    fetchRecommendations();
  }, []);

  // -----------------------------
  // SEARCH HANDLER (AI vs MONGO)
  // -----------------------------
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const wordCount = searchQuery.trim().split(/\s+/).length;

    try {
      setLoadingSearch(true);
      setSearchResults([]);

      let res;

      // > 3 words → AI-powered search
      if (wordCount > 3) {
        res = await productAPI.aiSearch(encodeURIComponent(searchQuery));
      }
      // ≤ 3 words → standard Mongo text search
      else {
        res = await productAPI.search(searchQuery);
      }

      const products =
        res.data?.products && Array.isArray(res.data.products)
          ? res.data.products
          : Array.isArray(res.data)
          ? res.data
          : [];

      setSearchResults(products);
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Search failed");
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };




  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen pt-4 bg-gray-100">
      {/* ================= HERO ================= */}
      <section className="bg-gradient-to-r from-blue-600 to-violet-900 text-white py-20 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Smart Shopping, Simplified
          </h1>
          <p className="text-lg text-blue-100 mb-10">
            Describe what you need. Let AI do the thinking.
          </p>

          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-xl flex items-center gap-2 px-3 py-2"
          >
            <Search size={18} className="text-white" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. cheap running shoes for men"
              className="flex-1 bg-transparent px-3 py-2 text-white placeholder:text-blue-200 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-black px-6 py-2 rounded-lg font-medium hover:bg-gray-900 transition"
            >
              Search
            </button>
          </form>

          {loadingSearch && (
            <p className="mt-4 text-sm text-blue-100">
              Searching intelligently…
            </p>
          )}
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 py-14">
        {/* -------- SEARCH RESULTS -------- */}
        {searchResults.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mb-6">Search Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {searchResults.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}

        {/* -------- EMPTY SEARCH -------- */}
        {!loadingSearch && searchQuery && searchResults.length === 0 && (
          <p className="text-center text-gray-500 mt-12">
            No products matched your search.
          </p>
        )}

        {/* -------- RECOMMENDATIONS -------- */}
        {searchResults.length === 0 && (
          <>
            <div className="flex items-center justify-between mb-6 mt-8">
              <h2 className="text-2xl font-semibold">Recommended for You</h2>
              <span className="text-sm text-gray-500">Popular picks</span>
            </div>

            {loadingAI ? (
              <p className="text-gray-500">Loading recommendations…</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {aiRecommendations.length === 0 ? (
                  <div className="col-span-4 bg-gradient-to-b from-gray-50 to-white py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="text-center flex flex-col  py-12">
                        <ShoppingBag className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                          No recommendations yet
                        </h2>
                        <p className="text-gray-600 mb-6">
                          There are no recommended products try after{" "}
                          <strong>Purchasing Some products</strong>
                        </p> 
                        <button onClick={()=>navigate(`/product`)} className="flex bg-blue-500 text-2xl hover:bg-blue-400 rounded-lg text-white/90 px-3 py-2 justify-center self-center">
                        Visit Products
                        <GoArrowUpRight size={40}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  aiRecommendations.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
