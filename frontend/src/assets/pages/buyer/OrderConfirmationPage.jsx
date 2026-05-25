import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { orderAPI } from "../../../services/apiHelpers";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Package,
  MapPin,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const txRef = searchParams.get("tx_ref");

  const [status, setStatus] = useState("loading"); // loading | success | failed
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    if (!txRef) {
      setStatus("failed");
      return;
    }
    verify();
  }, [txRef]);

  const verify = async () => {
    try {
      const res = await orderAPI.verifyChapa(txRef);
      const { chapaStatus, order, payment } = res.data;
      setOrder(order);
      setPayment(payment);
      setStatus(chapaStatus === "success" ? "success" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (status === "loading")
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-gray-600 font-medium">Verifying your payment…</p>
      </div>
    );

  // ── Failed ────────────────────────────────────────────────────────────────
  if (status === "failed")
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24">
        <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-500 mb-8">
            Your payment could not be completed. No charges were made.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/my-orders")}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );

  // ── Success ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success banner */}
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={44} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-500">
            Thank you for your purchase. Your order has been placed and is being
            processed.
          </p>
          {payment && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-4 py-2 rounded-full">
              <CheckCircle size={14} />
              Payment successful via Chapa
            </div>
          )}
        </div>

        {/* Order details */}
        {order && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Package size={20} className="text-blue-600" /> Order Details
              </h2>
              <span className="text-sm font-mono text-gray-500">
                #{String(order._id).slice(-8).toUpperCase()}
              </span>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-5">
              {order.items?.map((item) => {
                const img = item.product?.photo?.[0]?.signedUrl;
                return (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {img ? (
                        <img
                          src={img}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={20} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      ${Number(item.totalItemPrice).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${Number(order.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment method</span>
                <span className="font-medium text-blue-600">Chapa</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-base pt-1">
                <span>Total paid</span>
                <span>${Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Delivery address */}
        {order?.address && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <MapPin size={20} className="text-blue-600" /> Delivery Address
            </h2>
            <p className="text-gray-700">{order.address.street}</p>
            <p className="text-gray-500 text-sm">
              {order.address.city}, {order.address.state}
            </p>
            {order.address.phoneNumber && (
              <p className="text-gray-500 text-sm mt-1">
                Phone: {order.address.phoneNumber}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/my-orders")}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            <Package size={18} /> View My Orders
          </button>
          <button
            onClick={() => navigate("/product")}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            <ShoppingBag size={18} /> Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
