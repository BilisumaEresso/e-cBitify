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
  ShoppingBag,
  ArrowRight,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CartPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
    else {
      setCart({ items: [], totalPrice: 0 });
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      setCart(
        response.data.status && response.data.cart
          ? response.data.cart
          : { items: [], totalPrice: 0 }
      );
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
        toast.error(`Only ${item.product.quantity} in stock`);
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

  const placeOrder = () => {
    if (!cart?.items?.length) return toast.error("Your cart is empty");
    setShowAddressModal(true);
  };

  const handleAddressContinue = async (addressId, newAddress) => {
    setShowAddressModal(false);
    try {
      setPlacingOrder(true);
      const res = await orderAPI.create({ addressId, address: newAddress });
      const createdOrderId = res.data.order?._id;
      if (!createdOrderId) throw new Error("Order creation failed");
      setPendingOrderId(createdOrderId);
      setShowPaymentModal(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create order");
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setCart({ items: [], totalPrice: 0 });
    setPendingOrderId(null);
    navigate("/my-orders");
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const subtotal = cart?.totalPrice || 0;
  const shipping = subtotal > 100 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Shopping cart</h1>
            <p className="text-slate-500 mt-1">
              {itemCount} {itemCount === 1 ? "item" : "items"} · Review before checkout
            </p>
          </div>
          {cartItems.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50 transition"
              >
                <Trash2 size={16} /> Clear cart
              </button>
              <button
                onClick={() => navigate("/product")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition"
              >
                <ShoppingBag size={16} /> Continue shopping
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Package size={36} className="text-slate-300" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 mb-2">Your cart is empty</h2>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                  Looks like you haven&apos;t added anything yet. Explore our catalog to find something you love.
                </p>
                <button
                  onClick={() => navigate("/product")}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
                >
                  Browse products <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                {cartItems.map((item) => {
                  const img = item.product?.photo?.[0]?.signedUrl || "/placeholder.png";
                  const lineTotal = Number(item.price) * item.quantity;
                  return (
                    <div key={item._id} className="p-5 flex gap-4 sm:gap-5">
                      <div
                        onClick={() => navigate(`/product/${item.product._id}`)}
                        className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-50 rounded-xl overflow-hidden shrink-0 cursor-pointer border border-slate-100"
                      >
                        <img src={img} alt={item.product.name} className="w-full h-full object-contain p-2" />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col">
                        <div
                          className="cursor-pointer"
                          onClick={() => navigate(`/product/${item.product._id}`)}
                        >
                          <h3 className="font-semibold text-slate-900 hover:text-blue-600 transition line-clamp-1">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            ${Number(item.price).toFixed(2)} each
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-3">
                          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.product._id, -1)}
                              disabled={updating || item.quantity <= 1}
                              className="px-2.5 py-1.5 hover:bg-slate-50 disabled:opacity-40 transition"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 text-sm font-semibold min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product._id, 1)}
                              disabled={updating}
                              className="px-2.5 py-1.5 hover:bg-slate-50 disabled:opacity-40 transition"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-bold text-slate-900">
                              ${lineTotal.toFixed(2)}
                            </span>
                            <button
                              onClick={() => removeItem(item.product._id)}
                              disabled={updating}
                              className="text-slate-400 hover:text-red-500 transition p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-28 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-5">Order summary</h2>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-medium text-slate-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-emerald-600 font-semibold" : "font-medium text-slate-800"}>
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Tag size={12} /> Add ${(100 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Estimated tax (8%)</span>
                  <span className="font-medium text-slate-800">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-100 pt-4 flex justify-between text-lg font-bold text-slate-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={cartItems.length === 0 || placingOrder}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {placingOrder ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Creating order…
                  </>
                ) : (
                  <>
                    Proceed to checkout <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="mt-5 pt-5 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Shield size={14} className="text-emerald-500 shrink-0" />
                  SSL encrypted checkout
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                  30-day return policy
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
