import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { orderAPI, productAPI } from "../../../services/apiHelpers";
import {
  Package, Loader2, ChevronDown, ChevronUp,
  Clock, CheckCircle, Truck, XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_OPTS = ["pending","confirmed","shipped","delivered","completed","cancelled"];
const STATUS_COLOR = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped:   "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function SellerOrders() {
  const { user } = useAuth();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState({});
  const [updating, setUpdating] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [ordRes, prodRes] = await Promise.all([
        orderAPI.getAll(),
        productAPI.getAll(),
      ]);
      const allOrders   = ordRes.data.orders || [];
      const allProducts = prodRes.data.products || [];

      // Build a set of product IDs owned by this seller
      const myProductIds = new Set(
        allProducts
          .filter((p) => p.createdBy?._id === user?.id || p.createdBy?._id === user?._id)
          .map((p) => p._id)
      );

      // Keep orders that contain at least one of this seller's products
      const mine = allOrders.filter((order) =>
        order.items.some((item) => myProductIds.has(item.product?._id))
      );
      setOrders(mine);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdating(orderId);
      await orderAPI.updateStatus(orderId, status);
      toast.success("Status updated");
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setUpdating(null);
    }
  };

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );

  return (
    <div className="min-h-screen pt-24 bg-gray-50 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
          <p className="text-gray-500 mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} for your products</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700">No orders yet</h2>
            <p className="text-gray-500 mt-2">Orders for your products will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div
                  onClick={() => toggle(order._id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 cursor-pointer hover:bg-gray-50 gap-3"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      Order <span className="font-mono text-sm text-gray-500">#{order._id.slice(-8).toUpperCase()}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" })}
                      {" · "}{order.user?.name || "Customer"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLOR[order.status] || "bg-gray-100 text-gray-700"}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="font-bold text-gray-800">${Number(order.totalAmount).toFixed(2)}</span>
                    {expanded[order._id] ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </div>
                </div>

                {expanded[order._id] && (
                  <div className="border-t border-gray-100 px-5 pb-5">
                    <div className="mt-4 space-y-2">
                      {order.items.map((item) => (
                        <div key={item._id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.product?.photo?.[0]?.signedUrl
                              ? <img src={item.product.photo[0].signedUrl} className="w-full h-full object-cover rounded-lg" alt="" />
                              : <Package size={18} className="text-gray-400" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.product?.name || "Product"}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</p>
                          </div>
                          <p className="text-sm font-semibold">${Number(item.totalItemPrice).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Status update */}
                    <div className="mt-4 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700">Update Status:</label>
                      <select
                        value={order.status}
                        disabled={updating === order._id}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
                      >
                        {STATUS_OPTS.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                      {updating === order._id && <Loader2 size={16} className="animate-spin text-blue-600" />}
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
