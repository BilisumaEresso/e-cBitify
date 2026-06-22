import { Star, ShoppingCart, Eye } from "lucide-react";
import { cartAPI } from "../../services/apiHelpers";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProductCard = ({ product, badge }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const imageUrl =
    product?.photo?.length > 0 ? product.photo[0].signedUrl : "/placeholder.png";

  const qty = product.quantity;
  const outOfStock = qty != null && Number(qty) <= 0;
  const rating = Number(product.averageRating || 0);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await cartAPI.addToCart({ productId: product._id });
      toast.success("Added to cart");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not add to cart");
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 overflow-hidden flex flex-col">
      <div
        onClick={() => navigate(`/product/${product._id}`)}
        className="relative aspect-square bg-slate-50 cursor-pointer overflow-hidden"
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
        {badge && (
          <span className="absolute top-3 left-3 bg-amber-400 text-amber-950 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            {badge}
          </span>
        )}
        {outOfStock && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Sold out
          </span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-white/95 text-slate-800 text-sm font-medium px-4 py-2 rounded-full shadow flex items-center gap-1.5">
            <Eye size={15} /> Quick view
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        {product.category?.name && (
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide truncate">
            {product.category.name}
          </p>
        )}
        <h2
          onClick={() => navigate(`/product/${product._id}`)}
          className="font-semibold text-slate-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors leading-snug"
        >
          {product.name}
        </h2>

        <div className="flex items-center gap-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={14}
                className={
                  i <= Math.round(rating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-200"
                }
              />
            ))}
          </div>
          <span className="text-xs text-slate-500">
            {rating > 0 ? rating.toFixed(1) : "New"} · {product.rateNumber || 0}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-xl font-bold text-slate-900">
            ETB {Number(product.price).toFixed(2)}
          </span>
          {(product.sold || 0) > 0 && (
            <span className="text-xs text-slate-400">{product.sold} sold</span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          <ShoppingCart size={16} />
          {outOfStock ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
