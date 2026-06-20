import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { cartAPI, orderAPI } from "../../../services/apiHelpers";
import AddressModal from "../../components/AddressModal";
import FakePaymentModal from "../../components/FakePayemntModal";
import ClearCartModal from "../../components/ClearCartModal";
import {
  Trash2,
  Plus,
  Minus,
  Loader2,
  Package,
  Shield,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CartPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderAddress, setOrderAddress] = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState(null); // ← holds the created order ID
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart({ items: [], totalPrice: 0 });
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      if (response.data.status && response.data.cart) {
        setCart(response.data.cart);
      } else {
        setCart({ items: [], totalPrice: 0 });
      }
    } catch {
      toast.error("Failed to fetch cart");
      setCart({ items: [], totalPrice: 0 });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, change) => {
    if (!isAuthenticated) return navigate("/login");
    try {
      setUpdating(true);
      const item = cart.items.find((i) => i.product._id === productId);
      if (!item) return;
      const newQty = Math.max(1, item.quantity + change);
      if (newQty > item.product.quantity) {
        toast.error(`Only ${item.product.quantity} items in stock`);
        return;
      }
      await cartAPI.updateCartItem(productId, newQty);
      await fetchCart();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update quantity");
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (productId) => {
    if (!isAuthenticated) return navigate("/login");
    try {
      setUpdating(true);
      await cartAPI.removeFromCart(productId);
      toast.success("Item removed");
      await fetchCart();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove item");
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return navigate("/login");
    if (updating) return;
    try {
      setUpdating(true);
      await cartAPI.clearCart();
      setCart({ items: [], totalPrice: 0 });
      toast.success("Cart cleared");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to clear cart");
    } finally {
      setUpdating(false);
    }
  };

  // Step 1: open address modal
  const placeOrder = () => {
    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setShowAddressModal(true);
  };

  // Step 2: address confirmed → create order → open payment modal
  const handleAddressContinue = async (addressId, newAddress) => {
    setShowAddressModal(false);
    try {
      setPlacingOrder(true);
      const res = await orderAPI.create({ addressId, address: newAddress });
      const createdOrderId = res.data.order?._id;
      if (!createdOrderId) throw new Error("Order creation failed");
      setPendingOrderId(createdOrderId);
      setOrderAddress({ addressId, newAddress });
      setShowPaymentModal(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create order");
    } finally {
      setPlacingOrder(false);
    }
  };

  // Step 3: payment confirmed by modal
  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setCart({ items: [], totalPrice: 0 });
    setPendingOrderId(null);
    navigate("/my-orders");
  };

  const continueShopping = () => navigate("/product");

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );

  const cartItems = cart?.items || [];
  const subtotal = cart?.totalPrice || 0;
  const shipping = subtotal > 100 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen pt-20 bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
              your cart
            </p>
          </div>
          {cartItems.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={updating}
                className="px-4 py-2 flex items-center gap-2 rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition"
              >
                <Trash2 size={16} />
                {updating ? "Clearing…" : "Clear Cart"}
              </button>
              <button
                onClick={continueShopping}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Your cart is empty
                </h2>
                <p className="text-gray-500 mb-6">
                  Add some items to get started!
                </p>
                <button
                  onClick={continueShopping}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
                {cartItems.map((item) => {
                  const img = item.product?.photo?.[0]?.signedUrl;
                  return (
                    <div
                      key={item._id}
                      className="p-5 flex items-center gap-4 hover:bg-gray-50 transition"
                    >
                      {/* Image */}
                      <div
                        onClick={() => navigate(`/product/${item.product._id}`)}
                        className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden"
                      >
                        {img ? (
                          <img
                            src={img}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package size={28} className="text-gray-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/product/${item.product._id}`)}
                      >
                        <h3 className="font-semibold text-gray-800 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {item.product.desc}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {item.product.quantity} in stock
                        </p>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="font-semibold text-gray-800 w-16 text-right">
                          ${Number(item.price).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.product._id, -1)}
                            disabled={updating || item.quantity <= 1}
                            className="px-2 py-1.5 hover:bg-gray-100 rounded-l-lg disabled:opacity-40 transition"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 font-medium text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product._id, 1)}
                            disabled={updating}
                            className="px-2 py-1.5 hover:bg-gray-100 rounded-r-lg disabled:opacity-40 transition"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product._id)}
                          disabled={updating}
                          className="text-red-500 hover:text-red-700 disabled:opacity-40 transition p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span
                    className={
                      shipping === 0 ? "text-green-600 font-medium" : ""
                    }
                  >
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400">
                    Free shipping on orders over $100
                  </p>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={cartItems.length === 0 || placingOrder}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {placingOrder ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Creating
                    Order…
                  </>
                ) : (
                  "Proceed to Checkout"
                )}
              </button>

              {/* Trust signals */}
              <div className="pt-2 space-y-2 border-t">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield size={14} className="text-green-600 flex-shrink-0" />
                  <span>SSL encrypted & secure checkout</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle
                    size={14}
                    className="text-green-600 flex-shrink-0"
                  />
                  <span>Free returns within 30 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ClearCartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={clearCart}
        updating={updating}
      />

      <AddressModal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        addresses={user?.address ? [user.address] : []}
        defaultAddress={user?.address || null}
        onContinue={handleAddressContinue}
      />

      <FakePaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPay={handlePaymentSuccess}
        orderId={pendingOrderId}
      />
    </div>
  );
}
