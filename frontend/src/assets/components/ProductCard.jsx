// TODO : done with Product card
import { Star } from "lucide-react";
import { cartAPI } from "../../services/apiHelpers";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProductCard = ({ product, badge }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const imageUrl =
    product?.photo?.length > 0
      ? product.photo[0].signedUrl
      : "/placeholder.png"; // optional fallback

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await cartAPI.addToCart({
        productId: product._id
      });
      toast.success("Added to cart");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
      <div
        onClick={() => navigate(`/product/${product._id}`)}
        className="h-80 flex items-center justify-center cursor-pointer bg-gray-100 p-3 relative"
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="rounded-md max-h-full object-contain"
        />

        {badge && (
          <span className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
            {badge}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={16}
              className={
                i <= product.averageRating
                  ? "text-yellow-400 fill-yellow-300"
                  : "text-gray-300"
              }
            />
          ))}
          <span className="text-gray-500 text-sm">({product.rateNumber})</span>
        </div>

        {/* Price */}
        <div className="text-lg font-bold text-gray-900">
          ${Number(product.price).toFixed(2)}
        </div>

        {/* Stock info (optional but professional) */}
        {product.quantity === 0 && (
          <span className="text-sm text-red-500">Out of stock</span>
        )}

        <button
          onClick={handleAddToCart}
          disabled={product.quantity === 0}
          className="mt-2 bg-black text-white py-2 rounded hover:bg-gray-800 disabled:bg-gray-400"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
