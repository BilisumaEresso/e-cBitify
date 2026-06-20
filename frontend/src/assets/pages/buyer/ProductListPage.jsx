// TODO : done with Product list
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  X,
  Sparkles,
  Tag,
  DollarSign,
  Calendar,
  TrendingUp,
  Star,
  ShoppingCart,
  Heart,
  Eye,
  ChevronRight,
  Sliders,
  RefreshCw,
  Package,
  Clock,
  ArrowUpDown,
  Grid,
  List,
  Zap,
} from "lucide-react";
import ProductCard from "../../components/ProductCard";
import { categoryAPI, productAPI } from "../../../services/apiHelpers";
import { debounce } from "lodash";
import toast from "react-hot-toast";

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [aiSearchEnabled, setAiSearchEnabled] = useState(false);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortOption, setSortOption] = useState("newest");
  const [dateRange, setDateRange] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(0);

  // AI Search Results
  const [aiSearchResult, setAiSearchResult] = useState(null);
  const [isAiSearching, setIsAiSearching] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [
    searchQuery,
    selectedCategory,
    priceRange,
    sortOption,
    dateRange,
    inStockOnly,
    ratingFilter,
    products,
  ]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      console.log(response);
      if (response.data.status) {
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
      }
    } catch (err) {
      toast.error(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();

      if (response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      toast.error(err);
    }
  };

  const performAiSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim() || query.trim().split(" ").length <= 3) {
        setAiSearchResult(null);
        return;
      }

      try {
        setIsAiSearching(true);
        const response = await productAPI.aiSearch(encodeURIComponent(query));

        if (response.data) {
          setAiSearchResult({
            strategy: response.data.aiResult?.strategy || "AI Search",
            keywords: response.data.aiResult?.keywords || [],
            filters: response.data.aiResult?.filters || {},
            products: response.data.products || [],
          });

          // Update filtered products with AI results
          if (response.data.products && response.data.products.length > 0) {
            setFilteredProducts(response.data.products);
          }
        }
      } catch (err) {
        toast.error("AI Search failed:", err);
      } finally {
        setIsAiSearching(false);
      }
    }, 1000),
    []
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Enable AI search for complex queries
    const isComplex = query.trim().split(" ").length > 3;
    setAiSearchEnabled(isComplex);

    if (isComplex) {
      performAiSearch(query);
    } else {
      setAiSearchResult(null);
    }
  };

  const averagePrice = filteredProducts.length
    ? (
        filteredProducts.reduce((sum, p) => sum + Number(p.price || 0), 0) /
        filteredProducts.length
      ).toFixed(2)
    : "0.00";

  const applyFilters = () => {
    let result = [...products];

    // Apply AI search results if available
    if (aiSearchResult && aiSearchEnabled) {
      result = aiSearchResult.products || result;
    }

    // Apply text search (if not using AI or as fallback)
    if (searchQuery && (!aiSearchEnabled || !aiSearchResult)) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.desc?.toLowerCase().includes(query) ||
          product.category?.name?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      result = result.filter(
        (product) => product.category?._id === selectedCategory
      );
    }

    // Apply price filter
    if (priceRange.min) {
      result = result.filter(
        (product) => product.price >= parseFloat(priceRange.min)
      );
    }
    if (priceRange.max) {
      result = result.filter(
        (product) => product.price <= parseFloat(priceRange.max)
      );
    }

    // Apply stock filter
    if (inStockOnly) {
      result = result.filter((product) => (product.quantity || 0) > 0);
    }

    // Apply rating filter
    if (ratingFilter > 0) {
      result = result.filter(
        (product) => (product.averageRating || 0) >= ratingFilter
      );
    }

    // Apply date filter
    if (dateRange !== "all") {
      const now = new Date();
      let cutoffDate = new Date();

      switch (dateRange) {
        case "today":
          cutoffDate.setDate(now.getDate() - 1);
          break;
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          cutoffDate = new Date(0); // All time
      }

      result = result.filter(
        (product) => new Date(product.createdAt) >= cutoffDate
      );
    }

    // Apply sorting
    switch (sortOption) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        result.sort((a, b) => (b.sold || 0) - (a.sold || 0));
        break;
      case "rating":
        result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    setSortOption("newest");
    setDateRange("all");
    setInStockOnly(false);
    setRatingFilter(0);
    setAiSearchResult(null);
    setAiSearchEnabled(false);
  };

  const handlePriceChange = (type, value) => {
    setPriceRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleSortChange = (option) => {
    setSortOption(option);
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-10 bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-r from-blue-600 to-violet-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Amazing Products
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            AI-powered search helps you find exactly what you're looking for
          </p>

          {/* Main Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="flex items-center bg-linear-to-r from-blue-400 to-black/50 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden">
                <div className="pl-4">
                  <Search className="h-5 w-5 text-white/70" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Describe what you're looking for... (e.g., 'comfortable running shoes under $100')"
                  className="w-full px-4 py-4 bg-transparent text-white placeholder-white/70 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-4 text-white/70 rounded-lg hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                {/* FIXME:ai search not working */}
                <button
                  onClick={() => performAiSearch(searchQuery)}
                  disabled={!searchQuery || isAiSearching}
                  className={`px-6 py-4 rounded-lg flex items-center ${
                    aiSearchEnabled
                      ? "bg-gradient-to-r from-blue-500 to-black"
                      : "bg-black/20 hover:bg-white/30"
                  } transition-colors disabled:opacity-50`}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  {isAiSearching ? "Searching..." : "Search"}
                </button>
              </div>

              {/* AI Search Status */}
              {aiSearchEnabled && (
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Sparkles className="h-4 w-4 mr-2 text-purple-300" />
                    <span>AI Search Enabled</span>
                    {aiSearchResult?.strategy && (
                      <span className="ml-4 px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                        {aiSearchResult.strategy}
                      </span>
                    )}
                  </div>
                  {isAiSearching && (
                    <div className="flex items-center text-sm">
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing your query...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div
            className={`lg:w-1/4 ${
              showAdvancedFilters ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Sliders className="h-5 w-5 mr-2" />
                  Filters
                </h2>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Category
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      !selectedCategory
                        ? "bg-blue-50 text-blue-600 font-medium border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => setSelectedCategory(category._id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category._id
                          ? "bg-blue-50 text-blue-600 font-medium border border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-blue-400 mr-3"></span>
                        {category.name}
                        <span className="ml-auto text-sm text-gray-500">
                          ({category.productCount || 0})
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Price Range
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                      Min ($)
                    </label>
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange("min", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                      Max ($)
                    </label>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange("max", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1000"
                      min="0"
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[50, 100, 200, 500].map((price) => (
                    <button
                      key={price}
                      onClick={() => handlePriceChange("max", price)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50"
                    >
                      Under ${price}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date Added
                </h3>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Time" },
                    { value: "today", label: "Today" },
                    { value: "week", label: "This Week" },
                    { value: "month", label: "This Month" },
                    { value: "year", label: "This Year" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                    >
                      <input
                        type="radio"
                        name="dateRange"
                        value={option.value}
                        checked={dateRange === option.value}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-3 text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Minimum Rating
                </h3>
                <div className="flex items-center space-x-2">
                  {[0, 3, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(rating)}
                      className={`px-3 py-2 rounded-lg border transition-colors ${
                        ratingFilter === rating
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      {rating === 0 ? "Any" : `${rating}+`}
                      {rating > 0 && (
                        <Star className="inline h-4 w-4 ml-1 text-yellow-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Filter */}
              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="h-5 w-5 text-blue-600 rounded"
                  />
                  <span className="ml-3 text-gray-700 font-medium">
                    In Stock Only
                  </span>
                </label>
              </div>

              {/* AI Search Results Summary */}
              {aiSearchResult && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-purple-500" />
                    AI Search Insights
                  </h3>
                  <div className="space-y-2">
                    {aiSearchResult.keywords?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Keywords detected:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {aiSearchResult.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {aiSearchResult.filters && (
                      <div className="text-sm text-gray-600">
                        Applied:{" "}
                        {aiSearchResult.filters.category || "Any category"},
                        {aiSearchResult.filters.price?.min
                          ? ` $${aiSearchResult.filters.price.min}+`
                          : ""}
                        {aiSearchResult.filters.price?.max
                          ? ` up to $${aiSearchResult.filters.price.max}`
                          : ""}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Mobile Filter Toggle and Stats */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="w-full px-4 py-3 bg-white rounded-xl shadow border flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  {showAdvancedFilters ? "Hide Filters" : "Show Filters"}
                </div>
                <div className="text-sm text-gray-600">
                  {filteredProducts.length} products
                </div>
              </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {aiSearchResult ? "AI Search Results" : "All Products"}
                  </h2>
                  <p className="text-gray-600">
                    {filteredProducts.length} products found
                    {searchQuery && ` for "${searchQuery}"`}
                    {aiSearchResult && " using AI"}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-md ${
                        viewMode === "grid" ? "bg-white shadow" : ""
                      }`}
                    >
                      <Grid className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md ${
                        viewMode === "list" ? "bg-white shadow" : ""
                      }`}
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortOption}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="popular">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                    <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              <div className="flex flex-wrap gap-2 mt-4">
                {searchQuery && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery("")} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center">
                    {categories.find((c) => c._id === selectedCategory)?.name}
                    <button
                      onClick={() => setSelectedCategory("")}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(priceRange.min || priceRange.max) && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm flex items-center">
                    Price: {priceRange.min || "0"}-{priceRange.max || "∞"}
                    <button
                      onClick={() => setPriceRange({ min: "", max: "" })}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {ratingFilter > 0 && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
                    Rating: {ratingFilter}+
                    <button onClick={() => setRatingFilter(0)} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center">
                    In Stock Only
                    <button
                      onClick={() => setInStockOnly(false)}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {dateRange !== "all" && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center">
                    {dateRange.charAt(0).toUpperCase() + dateRange.slice(1)}
                    <button
                      onClick={() => setDateRange("all")}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* AI Search Indicator */}
            {aiSearchEnabled && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
                <div className="flex items-center">
                  <Sparkles className="h-6 w-6 text-purple-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      AI Search Active
                    </h3>
                    <p className="text-sm text-gray-600">
                      Understanding natural language queries and applying
                      intelligent filters
                    </p>
                  </div>
                  <button
                    onClick={() => setAiSearchEnabled(false)}
                    className="ml-auto text-sm text-purple-600 hover:text-purple-800"
                  >
                    Switch to basic search
                  </button>
                </div>
              </div>
            )}

            {/* Products Grid/List */}
            {filteredProducts.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentProducts.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentProducts.map((product) => (
                      <ProductListItem key={product._id} product={product} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-8 space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`w-10 h-10 rounded-lg ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Product Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow border">
                    <div className="text-sm text-gray-600">Total Products</div>
                    <div className="text-2xl font-bold text-gray-800">
                      {filteredProducts.length}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow border">
                    <div className="text-sm text-gray-600">Avg Price</div>
                    <div className="text-2xl font-bold text-gray-800">
                      ${averagePrice}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow border">
                    <div className="text-sm text-gray-600">Avg Rating</div>
                    <div className="text-2xl font-bold text-gray-800">
                      {(
                        filteredProducts.reduce(
                          (sum, p) => sum + (p.averageRating || 0),
                          0
                        ) / filteredProducts.length || 0
                      ).toFixed(1)}
                      <Star className="inline h-5 w-5 ml-1 text-yellow-400" />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow border">
                    <div className="text-sm text-gray-600">In Stock</div>
                    <div className="text-2xl font-bold text-gray-800">
                      {
                        filteredProducts.filter((p) => (p.quantity || 0) > 0)
                          .length
                      }
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Package className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery
                    ? `No results found for "${searchQuery}". Try different keywords or adjust your filters.`
                    : "Try adjusting your search or filter criteria to find more products."}
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Clear All Filters
                  </button>
                  <Link
                    to="/ai-recommendation"
                    className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    <Sparkles className="inline h-4 w-4 mr-2" />
                    Get AI Recommendations
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Product List Item Component for List View
const ProductListItem = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const mainImage = product.photo?.[0]?.signedUrl || "/api/placeholder/400/300";

  return (
    <Link to={`/product/${product._id}`}>
      <div className="bg-white rounded-xl mt-5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="md:w-1/4 relative">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-48 md:h-full object-cover"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsWishlisted(!isWishlisted);
              }}
              className="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:bg-gray-50"
            >
              <Heart
                className={`h-4 w-4 ${
                  isWishlisted ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </button>
          </div>

          {/* Product Details */}
          <div className="md:w-3/4 p-6">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      {product.category?.name || "Uncategorized"}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {product.name}
                    </h3>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${Number(product.price).toFixed(2)}
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {product.desc}
                </p>

                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                    <span className="font-medium">
                      {Number(product.averageRating || 0).toFixed(1)}
                    </span>
                    <span className="text-gray-500 ml-1">
                      ({product.rateNumber || 0} reviews)
                    </span>
                  </div>
                  <div className="text-gray-600">
                    <ShoppingCart className="inline h-4 w-4 mr-1" />
                    {product.sold || 0} sold
                  </div>
                  <div className="text-gray-600">
                    <Package className="inline h-4 w-4 mr-1" />
                    {product.quantity || 0} in stock
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-blue-600">
                    <Eye className="h-5 w-5" />
                  </button>
                  <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                    Add to Compare
                  </button>
                </div>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductListPage;
