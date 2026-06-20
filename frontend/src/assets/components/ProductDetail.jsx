// TODO:✅
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cartAPI, productAPI } from "../../services/apiHelpers";
import { Star } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);

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
        if (photos.length > 0) {
          setActiveImage(photos[0].signedUrl);
        }

        if (isAuthenticated) {
          try {
            const myReviewRes = await productAPI.getUserReview(id);
            setUserReview(myReviewRes.data?.review || null);
          } catch {
            setUserReview(null);
          }
        }
      } catch (err) {
        toast.error(err?.message || "Failed to load product");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ADD OR UPDATE REVIEW
  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (reviewRating === 0 || !reviewComment.trim()) {
      toast.error("Please add rating and comment");
      return;
    }

    try {
      setSubmitting(true);
      const data = { rating: reviewRating, comment: reviewComment };
      if (userReview) {
        // update
        await productAPI.addReview(id, data);
        toast.success("Review updated");
      } else {
        // add new
        await productAPI.addReview(id, data);
       
        toast.success("Review added");
      }

      // Refresh reviews
      const reviewRes = await productAPI.getReview(id);
      setReviews(reviewRes.data?.reviews || []);
      try {
        const myReviewRes = await productAPI.getUserReview(id);
        setUserReview(myReviewRes.data?.review || null);
      } catch {
        setUserReview(null);
      }
      setReviewRating(0);
      setReviewComment("");
    } catch (err) {
      toast.error(err?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE REVIEW
  const handleDeleteReview = async () => {
    if (!userReview) return;
    try {
      setSubmitting(true);
      await productAPI.deleteReview(id);
      toast.success("Review deleted");
      const reviewRes = await productAPI.getReview(id);
      setReviews(reviewRes.data?.reviews || []);
      try {
        const myReviewRes = await productAPI.getUserReview(id);
        setUserReview(myReviewRes.data?.review || null);
      } catch {
        setUserReview(null);
      }
      setReviewRating(0);
      setReviewComment("");
    } catch (err) {
      toast.error(err.message || "Failed to delete review");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating = 0, onClick) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={20}
        className={
          i < rating
            ? "fill-yellow-400 text-yellow-400 cursor-pointer"
            : "text-gray-300 cursor-pointer"
        }
        onClick={() => onClick && onClick(i + 1)}
      />
    ));

  if (loading) return <p className="text-center mt-20">Loading product…</p>;
  if (!product)
    return <p className="text-center mt-20 text-red-500">Product not found</p>;

  const photos = product.photo?.slice(0, 5) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* PRODUCT SECTION */}
      <div className="grid pt-15 grid-cols-1 md:grid-cols-2 gap-12">
        {/* IMAGES */}
        <div>
          <div className="border border-blue-300 rounded-xl overflow-hidden mb-4 bg-white">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-[420px] object-contain"
              />
            ) : (
              <div className="h-[420px] flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>

          {photos.length > 1 && (
            <div className="flex gap-3">
              {photos.map((img) => (
                <button
                  key={img._id}
                  onClick={() => setActiveImage(img.signedUrl)}
                  className={`w-20 h-20 border rounded-lg overflow-hidden ${
                    activeImage === img.signedUrl ? "ring-2 ring-black" : ""
                  }`}
                >
                  <img
                    src={img.signedUrl}
                    alt="thumb"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div>
          <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex">{renderStars(product.averageRating)}</div>
            <span className="text-sm text-gray-500">
              ({product.rateNumber || 0} reviews)
            </span>
          </div>

          <p className="text-2xl font-semibold text-blue-600 mb-6">
            ${Number(product.price).toFixed(2)}
          </p>

          <p className="text-gray-700 mb-6">{product.desc}</p>

          <div className="flex gap-6 text-sm text-gray-600 mb-6">
            <span>
              Stock: <strong>{product.quantity}</strong>
            </span>
            <span>
              Sold: <strong>{product.sold}</strong>
            </span>
          </div>

          <button
            onClick={async () => {
              if (!isAuthenticated) return navigate("/login");
              await cartAPI.addToCart({ productId: id });
              toast.success("Added to cart");
            }}
            className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-900 transition"
          >
            Add to Cart
          </button>

          {product.createdBy && (
            <div className="mt-8 border-t pt-4 text-sm text-gray-600">
              Sold by <strong>{product.createdBy.name}</strong>
              <br />
              {product.createdBy.email}
            </div>
          )}
        </div>
      </div>

      {/* REVIEWS */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-6">Customer Reviews</h2>

        {/* REVIEW FORM */}
        <div className="border border-blue-200 rounded-xl p-5 mb-6">
          {userReview ? (
            <p className="text-gray-700 mb-2">
              You have already reviewed this product. Update your review below.
            </p>
          ) : (
            <p className="text-gray-700 mb-2">Add your review:</p>
          )}
          <div className="flex items-center gap-2 mb-2">
            {renderStars(
              reviewRating || userReview?.rating || 0,
              setReviewRating
            )}
          </div>
          <textarea
            value={reviewComment || userReview?.comment || ""}
            onChange={(e) => setReviewComment(e.target.value)}
            className="w-full border border-blue-200 rounded-lg p-2 mb-2 focus:outline-none"
            placeholder="Write your review..."
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {userReview ? "Update Review" : "Submit Review"}
            </button>
            {userReview && (
              <button
                onClick={handleDeleteReview}
                disabled={submitting}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete Review
              </button>
            )}
          </div>
        </div>

        {/* REVIEW LIST */}
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="border border-blue-300 rounded-xl p-5"
              >
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="font-medium">{review.user?.name}</p>
                    <div className="flex">{renderStars(review.rating)}</div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
