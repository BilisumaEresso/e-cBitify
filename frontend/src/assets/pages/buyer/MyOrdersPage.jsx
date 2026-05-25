import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orderAPI } from "../../../services/apiHelpers";
import {
  Package,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "bg-yellow-100 text-yellow-800", Icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800",   Icon: CheckCircle },
  shipped:   { label: "Shipped",   color: "bg-purple-100 text-purple-800", Icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", Icon: CheckCircle },
  completed: { label: "Completed", color: "bg-green-100 text-green-800", Icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800",    Icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "bg-gray-100 text-gray-700", Icon: AlertCircle };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      <cfg.Icon size={12} />
      {cfg.label}
    </span>
  );
}

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getAll();
      setOrders(res.data.orders || []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await orderAPI.cancel(orderId);
      toast.success("Order cancelled");
      fetchOrders();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Cannot cancel order");
    }
  };

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );

  return (
    <div className="min-h-screen pt-24 bg-gray-50 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-500 mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
          </div>
          <button
            onClick={() => navigate("/product")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <ShoppingBag size={18} /> Continue Shopping
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">When you place an order it will show up here.</p>
            <button
              onClick={() => navigate("/product")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Order header */}
                <div
                  onClick={() => toggle(order._id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition gap-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Order <span className="font-mono text-sm text-gray-500">#{order._id.slice(-8).toUpperCase()}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                        {" · "}{order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <StatusBadge status={order.status} />
                    <p className="font-bold text-gray-800 text-lg">${Number(order.totalAmount).toFixed(2)}</p>
                    {expanded[order._id] ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded[order._id] && (
                  <div className="border-t border-gray-100 px-5 pb-5">
                    {/* Items list */}
                    <div className="mt-4 space-y-3">
                      {order.items.map((item) => {
                        const img = item.product?.photo?.[0]?.signedUrl;
                        return (
                          <div
                            key={item._id}
                            onClick={() => navigate(`/product/${item.product?._id}`)}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                          >
                            {img ? (
                              <img src={img} alt={item.product?.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package size={20} className="text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">{item.product?.name || "Product"}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</p>
                            </div>
                            <p className="font-semibold text-gray-800">${Number(item.totalItemPrice).toFixed(2)}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Address */}
                    {order.address && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                        <p className="font-medium text-gray-700 mb-1">Delivery address</p>
                        <p>{order.address.street}, {order.address.city}, {order.address.state}</p>
                        {order.phoneNumber && <p className="mt-1">Phone: {order.phoneNumber}</p>}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex gap-3 flex-wrap">
                      {(order.status === "pending" || order.status === "confirmed") && (
                        <button
                          onClick={() => handleCancel(order._id)}
                          className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                        >
                          Cancel Order
                        </button>
                      )}
                      {order.status === "pending" && (
                        <button
                          onClick={async () => {
                            try {
                              await orderAPI.payNow(order._id);
                              toast.success("Payment completed!");
                              fetchOrders();
                            } catch (err) {
                              toast.error(err?.response?.data?.message || "Payment failed");
                            }
                          }}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
