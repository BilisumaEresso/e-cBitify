import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Package,
  DollarSign,
  Clock,
  ShoppingBag,
  Plus,
  Star,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { orderAPI } from "../../../services/apiHelpers";
import StatCard from "../../components/dashboard/StatCard";
import BarChart from "../../components/dashboard/BarChart";
import DonutChart from "../../components/dashboard/DonutChart";
import { formatCurrency } from "../../components/dashboard/chartUtils";

const STATUS_COLOR = {
  pending: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getSellerAnalytics();
      setData(res.data.data);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  const d = data || {};
  const orderSegments = [
    { label: "Pending", value: d.pendingOrders || 0, color: "#facc15" },
    { label: "Shipped", value: d.shippedOrders || 0, color: "#60a5fa" },
    { label: "Completed", value: d.completedOrders || 0, color: "#4ade80" },
    { label: "Cancelled", value: d.cancelledOrders || 0, color: "#f87171" },
  ].filter((s) => s.value > 0);

  return (
    <div className="min-h-screen pt-24 bg-gray-50 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, {user?.name} — here&apos;s how your store is performing
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/seller/analytics")}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 shadow-sm transition font-medium"
            >
              <BarChart3 size={18} /> Full Analytics
            </button>
            <button
              onClick={() => navigate("/add-product")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm transition font-medium"
            >
              <Plus size={18} /> Add Product
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            label="Total Revenue"
            value={formatCurrency(d.orderRevenue)}
            sub={`${formatCurrency(d.totalRevenue)} catalog value`}
            icon={DollarSign}
            gradient="from-emerald-500 to-green-600"
          />
          <StatCard
            label="Units Sold"
            value={(d.totalUnitsSold || 0).toLocaleString()}
            sub={`${d.totalProducts || 0} active products`}
            icon={ShoppingBag}
            gradient="from-blue-500 to-indigo-600"
          />
          <StatCard
            label="Total Orders"
            value={d.totalOrders || 0}
            sub={`${d.pendingOrders || 0} awaiting action`}
            icon={Package}
            gradient="from-violet-500 to-purple-600"
          />
          <StatCard
            label="Avg Rating"
            value={d.averageRating ? `${d.averageRating} ★` : "—"}
            sub={d.lowStockCount ? `${d.lowStockCount} low-stock items` : "Stock healthy"}
            icon={Star}
            gradient="from-amber-500 to-orange-600"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600" />
                  Orders — Last 7 Days
                </h2>
                <p className="text-sm text-gray-500">Daily order volume</p>
              </div>
            </div>
            <BarChart data={d.ordersChart || []} color="bg-blue-500" height={180} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Order Status</h2>
            <p className="text-sm text-gray-500 mb-6">Current breakdown</p>
            {orderSegments.length > 0 ? (
              <DonutChart segments={orderSegments} size={130} />
            ) : (
              <p className="text-gray-400 text-sm text-center py-12">No orders yet</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Revenue — Last 7 Days</h2>
            <p className="text-sm text-gray-500 mb-6">From completed orders</p>
            <BarChart
              data={(d.revenueChart || []).map((r) => ({
                ...r,
                value: Math.round(r.value),
              }))}
              color="bg-emerald-500"
              height={160}
            />
          </div>

          {/* Top products */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-800">Top Products</h2>
              <button
                onClick={() => navigate("/seller/products")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {(d.topProducts || []).length === 0 ? (
                <p className="text-gray-400 text-sm py-8 text-center">No products yet</p>
              ) : (
                d.topProducts.map((p, i) => (
                  <div
                    key={p._id}
                    onClick={() => navigate(`/product/${p._id}`)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition"
                  >
                    <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {p.photo ? (
                        <img src={p.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.sold} sold · {formatCurrency(p.revenue)}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold">{formatCurrency(p.price)}</p>
                      <p className="text-xs text-gray-400">Stock: {p.quantity}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
              <button
                onClick={() => navigate("/seller/orders")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                Manage orders <ArrowRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Order", "Customer", "Your Share", "Status", "Date"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(d.recentOrders || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-gray-400">
                        No orders yet — they&apos;ll appear here when customers buy your products
                      </td>
                    </tr>
                  ) : (
                    d.recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="py-3 px-2 font-mono text-xs text-gray-600">
                          #{String(order._id).slice(-8).toUpperCase()}
                        </td>
                        <td className="py-3 px-2 font-medium">{order.customer}</td>
                        <td className="py-3 px-2 font-semibold text-emerald-700">
                          {formatCurrency(order.sellerAmount)}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[order.status] || "bg-gray-100 text-gray-700"}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low stock alert */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle size={18} className="text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-800">Low Stock Alert</h2>
            </div>
            {(d.lowStockProducts || []).length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package size={20} className="text-green-600" />
                </div>
                <p className="text-sm text-gray-500">All products well stocked</p>
              </div>
            ) : (
              <div className="space-y-3">
                {d.lowStockProducts.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => navigate(`/edit-product/${p._id}`)}
                    className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl cursor-pointer hover:bg-amber-100 transition"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <p className="text-xs text-amber-700">{formatCurrency(p.price)}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-800 bg-amber-200 px-2.5 py-1 rounded-lg">
                      {p.quantity} left
                    </span>
                  </div>
                ))}
              </div>
            )}

            {(d.pendingOrders || 0) > 0 && (
              <button
                onClick={() => navigate("/seller/orders")}
                className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl text-sm font-medium hover:bg-yellow-100 transition"
              >
                <Clock size={16} />
                {d.pendingOrders} pending order{d.pendingOrders !== 1 ? "s" : ""} need attention
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
