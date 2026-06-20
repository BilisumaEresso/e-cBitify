import { useState, useEffect, useMemo } from "react";
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
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "bg-amber-50 text-amber-700 border-amber-200", Icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-200",   Icon: CheckCircle },
  shipped:   { label: "Shipped",   color: "bg-purple-50 text-purple-700 border-purple-200", Icon: Truck },
  delivered: { label: "Delivered", color: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle },
  completed: { label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-700 border-red-200",    Icon: XCircle },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "shipped", label: "Shipped" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    color: "bg-slate-50 text-slate-600 border-slate-200",
    Icon: AlertCircle,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <cfg.Icon size={12} />
      {cfg.label}
    </span>
  );
}

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [filter, setFilter] = useState("all");

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

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "completed")
      return orders.filter((o) => o.status === "completed" || o.status === "delivered");
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

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

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My orders</h1>
            <p className="text-slate-500 mt-1">
              {orders.length} order{orders.length !== 1 ? "s" : ""} placed
            </p>
          </div>
          <button
            onClick={() => navigate("/product")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium text-sm"
          >
            <ShoppingBag size={16} /> Continue shopping
          </button>
        </div>

        {orders.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  filter === f.id
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Package size={36} className="text-slate-300" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">No orders yet</h2>
            <p className="text-slate-500 mb-8">When you place an order, it will appear here with tracking details.</p>
            <button
              onClick={() => navigate("/product")}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Start shopping <ArrowRight size={18} />
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
            No {filter} orders found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
              >
                <div
                  onClick={() => toggle(order._id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 cursor-pointer hover:bg-slate-50/50 transition gap-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      <Package className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Order{" "}
                        <span className="font-mono text-sm text-slate-500">
                          #{String(order._id).slice(-8).toUpperCase()}
                        </span>
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                        {" · "}
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-5">
                    <StatusBadge status={order.status} />
                    <p className="font-bold text-slate-900 text-lg">
                      ${Number(order.totalAmount).toFixed(2)}
                    </p>
                    {expanded[order._id] ? (
                      <ChevronUp size={20} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={20} className="text-slate-400" />
                    )}
                  </div>
                </div>

                {expanded[order._id] && (
                  <div className="border-t border-slate-100 px-5 pb-5 bg-slate-50/30">
                    <div className="mt-4 space-y-2">
                      {order.items.map((item) => {
                        const img = item.product?.photo?.[0]?.signedUrl;
                        return (
                          <div
                            key={item._id}
                            onClick={() => navigate(`/product/${item.product?._id}`)}
                            className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 cursor-pointer transition"
                          >
                            <div className="w-14 h-14 rounded-lg bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                              {img ? (
                                <img src={img} alt="" className="w-full h-full object-contain p-1" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package size={18} className="text-slate-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-800 truncate text-sm">
                                {item.product?.name || "Product"}
                              </p>
                              <p className="text-xs text-slate-500">
                                Qty {item.quantity} × ${Number(item.price).toFixed(2)}
                              </p>
                            </div>
                            <p className="font-semibold text-slate-800 text-sm">
                              ${Number(item.totalItemPrice).toFixed(2)}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {order.address && (
                      <div className="mt-4 p-4 bg-white rounded-xl border border-slate-100 text-sm">
                        <p className="font-semibold text-slate-700 mb-1">Delivery address</p>
                        <p className="text-slate-600">
                          {order.address.street}, {order.address.city}, {order.address.state}
                        </p>
                        {order.phoneNumber && (
                          <p className="text-slate-500 mt-1">Phone: {order.phoneNumber}</p>
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex gap-3 flex-wrap">
                      {(order.status === "pending" || order.status === "confirmed") && (
                        <button
                          onClick={() => handleCancel(order._id)}
                          className="px-4 py-2 text-sm bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition font-medium"
                        >
                          Cancel order
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
