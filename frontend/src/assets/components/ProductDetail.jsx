import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { cartAPI, productAPI } from "../../services/apiHelpers";
import {
  Star,
  ShoppingCart,
  ChevronRight,
  Minus,
  Plus,
  Package,
  Loader2,
  CheckCircle,
  Truck,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, reviewRes] = await Promise.all([
          productAPI.getById(id),
          productAPI.getReview(id),
        ]);
        const productData = productRes.data?.product;
        setProduct(productData);
        setReviews(reviewRes.data?.reviews || []);
        const photos = productData?.photo?.slice(0, 5) || [];
        if (photos.length > 0) setActiveImage(photos[0].signedUrl);

        if (isAuthenticated) {
          try {
            const myReviewRes = await productAPI.getUserReview(id);
            const rv = myReviewRes.data?.review || null;
            setUserReview(rv);
            if (rv) {
              setReviewRating(rv.rating);
              setReviewComment(rv.comment || "");
            }
          } catch {
            setUserReview(null);
          }
        }
      } catch {
        toast.error("Failed to load product");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isAuthenticated]);

  const handleSubmitReview = async () => {
    if (!isAuthenticated) return navigate("/login");
    if (reviewRating === 0 || !reviewComment.trim()) {
      toast.error("Please add a rating and comment");
      return;
    }
    try {
      setSubmitting(true);
      await productAPI.addReview(id, { rating: reviewRating, comment: reviewComment });
      toast.success(userReview ? "Review updated" : "Review submitted");
      const reviewRes = await productAPI.getReview(id);
      setReviews(reviewRes.data?.reviews || []);
      const myReviewRes = await productAPI.getUserReview(id);
      setUserReview(myReviewRes.data?.review || null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    try {
      setSubmitting(true);
      await productAPI.deleteReview(id);
      toast.success("Review deleted");
      setUserReview(null);
      setReviewRating(0);
      setReviewComment("");
      const reviewRes = await productAPI.getReview(id);
      setReviews(reviewRes.data?.reviews || []);
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) return navigate("/login");
    if (!product?.quantity) return toast.error("Out of stock");
    try {
      setAdding(true);
      await cartAPI.addToCart({ productId: id, quantity });
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  const renderStars = (rating = 0, interactive = false, onClick) =>
    [...Array(5)].map((_, i) => (
      <button
        key={i}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onClick?.(i + 1)}
        className={interactive ? "cursor-pointer" : "cursor-default"}
      >
        <Star
          size={interactive ? 22 : 18}
          className={
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "text-slate-200"
          }
        />
      </button>
    ));

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <Package size={48} className="text-slate-300" />
        <p className="text-slate-600">Product not found</p>
        <button onClick={() => navigate("/product")} className="text-blue-600 font-medium">
          Back to shop
        </button>
      </div>
    );
  }

  const photos = product.photo?.slice(0, 5) || [];
  const outOfStock = !product.quantity || product.quantity === 0;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-8">
          <Link to="/" className="hover:text-blue-600 transition">Home</Link>
          <ChevronRight size={14} />
          <Link to="/product" className="hover:text-blue-600 transition">Products</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Gallery */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4 aspect-square flex items-center justify-center p-6">
              {activeImage ? (
                <img src={activeImage} alt={product.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-slate-300 flex flex-col items-center gap-2">
                  <Package size={48} />
                  <span className="text-sm">No image</span>
                </div>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-3">
                {photos.map((img) => (
                  <button
                    key={img._id}
                    onClick={() => setActiveImage(img.signedUrl)}
                    className={`w-20 h-20 rounded-xl border-2 overflow-hidden bg-white transition ${
                      activeImage === img.signedUrl
                        ? "border-blue-600 ring-2 ring-blue-100"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img src={img.signedUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.category?.name && (
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
                {product.category.name}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex">{renderStars(Math.round(product.averageRating || 0))}</div>
              <span className="text-sm text-slate-500">
                {Number(product.averageRating || 0).toFixed(1)} · {product.rateNumber || 0} reviews
              </span>
            </div>

            <p className="text-3xl font-bold text-slate-900 mb-6">
              ETB {Number(product.price).toFixed(2)}
            </p>

            <p className="text-slate-600 leading-relaxed mb-6">{product.desc}</p>

            <div className="flex flex-wrap gap-4 text-sm mb-6">
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium ${
                outOfStock ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
              }`}>
                <CheckCircle size={14} />
                {outOfStock ? "Out of stock" : `${product.quantity} in stock`}
              </span>
              {(product.sold || 0) > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                  {product.sold} sold
                </span>
              )}
            </div>

            {/* Purchase box */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-6">
              {!outOfStock && (
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-sm font-medium text-slate-700">Quantity</span>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 hover:bg-slate-50 transition"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                      className="px-3 py-2 hover:bg-slate-50 transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={outOfStock || adding}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-4 rounded-xl font-semibold text-lg transition"
              >
                {adding ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <ShoppingCart size={20} />
                )}
                {outOfStock ? "Out of stock" : "Add to cart"}
              </button>

              <div className="mt-5 pt-5 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Truck size={15} className="text-emerald-500 shrink-0" />
                  Free shipping on orders over ETB 100
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Shield size={15} className="text-emerald-500 shrink-0" />
                  Secure checkout & buyer protection
                </div>
              </div>
            </div>

            {product.createdBy && (
              <div className="text-sm text-slate-500">
                Sold by{" "}
                <span className="font-semibold text-slate-800">{product.createdBy.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Customer reviews ({reviews.length})
          </h2>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-8">
            <p className="font-medium text-slate-800 mb-3">
              {userReview ? "Update your review" : "Write a review"}
            </p>
            <div className="flex gap-0.5 mb-3">
              {renderStars(reviewRating, true, setReviewRating)}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              placeholder="Share your experience with this product…"
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {userReview ? "Update" : "Submit review"}
              </button>
              {userReview && (
                <button
                  onClick={handleDeleteReview}
                  disabled={submitting}
                  className="text-red-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No reviews yet — be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                        {review.user?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{review.user?.name}</p>
                        <div className="flex mt-0.5">{renderStars(review.rating)}</div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed pl-[52px]">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
