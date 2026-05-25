import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { productAPI } from "../../../services/apiHelpers";
import {
  Package, Plus, Edit, Trash2, Loader2,
  Search, Star, ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SellerProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getAll();
      const all = res.data.products || [];
      // Only show products this seller created
      const mine = all.filter(
        (p) => p.createdBy?._id === user?.id || p.createdBy?._id === user?._id
      );
      setProducts(mine);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      setDeleting(id);
      await productAPI.delete(id);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );

  return (
    <div className="min-h-screen pt-24 bg-gray-50 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Products</h1>
            <p className="text-gray-500 mt-1">{products.length} product{products.length !== 1 ? "s" : ""} listed</p>
          </div>
          <button
            onClick={() => navigate("/add-product")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your products…"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              {search ? "No products match your search" : "No products yet"}
            </h2>
            {!search && (
              <button
                onClick={() => navigate("/add-product")}
                className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => {
              const img = product.photo?.[0]?.signedUrl;
              return (
                <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                  {/* Image */}
                  <div
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="h-48 bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden"
                  >
                    {img ? (
                      <img src={img} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={48} className="text-gray-300" />
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.desc}</p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-blue-600">${Number(product.price).toFixed(2)}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.quantity > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Star size={13} className="text-yellow-400" />{Number(product.averageRating || 0).toFixed(1)}</span>
                      <span className="flex items-center gap-1"><ShoppingBag size={13} />{product.sold || 0} sold</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => navigate(`/edit-product/${product._id}`)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        disabled={deleting === product._id}
                        className="flex-1 flex items-center justify-center gap-1 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium disabled:opacity-50"
                      >
                        {deleting === product._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
