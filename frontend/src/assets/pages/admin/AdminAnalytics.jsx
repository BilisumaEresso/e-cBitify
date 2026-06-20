import {
  BarChart3,
  DollarSign,
  Loader2,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  ArrowLeft,
  Ban,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { adminAPI } from "../../../services/apiHelpers";
import StatCard from "../../components/dashboard/StatCard";
import BarChart from "../../components/dashboard/BarChart";
import DonutChart from "../../components/dashboard/DonutChart";
import ProgressRow from "../../components/dashboard/ProgressRow";
import { formatCurrency, pct } from "../../components/dashboard/chartUtils";

const STATUS_COLOR = {
  pending: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .getAnalytics()
      .then((res) => setStats(res.data.data))
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-gray-600">Unable to load analytics.</p>
      </div>
    );
  }

  const orderSegments = [
    { label: "Pending", value: stats.pendingOrders || 0, color: "#facc15" },
    { label: "Shipped", value: stats.shippedOrders || 0, color: "#60a5fa" },
    { label: "Completed", value: stats.completedOrders || 0, color: "#4ade80" },
    { label: "Cancelled", value: stats.cancelledOrders || 0, color: "#f87171" },
  ].filter((s) => s.value > 0);

  const userSegments = [
    { label: "Buyers", value: stats.buyers || 0, color: "#60a5fa" },
    { label: "Sellers", value: stats.sellers || 0, color: "#a78bfa" },
    { label: "Admins", value: stats.admins || 0, color: "#f87171" },
  ].filter((s) => s.value > 0);

  const maxSold = Math.max(...(stats.topProducts || []).map((p) => p.sold), 1);

  return (
    <div className="min-h-screen pt-24 bg-gray-50 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-6 transition text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 size={28} className="text-purple-600" /> Platform Analytics
          </h1>
          <p className="text-gray-500 mt-1">Comprehensive metrics across the entire marketplace</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            label="Total Users"
            value={stats.totalUsers.toLocaleString()}
            sub={`${stats.bannedUsers || 0} banned`}
            icon={Users}
            gradient="from-blue-500 to-indigo-600"
          />
          <StatCard
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            sub={`Avg ${formatCurrency(stats.avgOrderValue)} / order`}
            icon={DollarSign}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            label="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            sub={`${stats.pendingOrders || 0} pending`}
            icon={ShoppingBag}
            gradient="from-violet-500 to-purple-600"
          />
          <StatCard
            label="Total Products"
            value={stats.totalProducts.toLocaleString()}
            sub={`${stats.sellers || 0} active sellers`}
            icon={Package}
            gradient="from-orange-500 to-red-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <TrendingUp size={18} className="text-purple-500" /> Daily Orders
            </h2>
            <p className="text-sm text-gray-500 mb-6">Last 7 days</p>
            <BarChart data={stats.ordersChart || []} color="bg-purple-500" height={200} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <DollarSign size={18} className="text-emerald-500" /> Daily Revenue
            </h2>
            <p className="text-sm text-gray-500 mb-6">Last 7 days</p>
            <BarChart
              data={(stats.revenueChart || []).map((r) => ({ ...r, value: Math.round(r.value) }))}
              color="bg-emerald-500"
              height={200}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Order Status</h2>
            {orderSegments.length > 0 ? (
              <DonutChart segments={orderSegments} />
            ) : (
              <p className="text-gray-400 text-sm text-center py-10">No orders</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">User Roles</h2>
            {userSegments.length > 0 ? (
              <DonutChart segments={userSegments} />
            ) : (
              <p className="text-gray-400 text-sm text-center py-10">No users</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Order Pipeline</h2>
            <div className="space-y-4">
              <ProgressRow label="Pending" value={stats.pendingOrders} total={stats.totalOrders} color="bg-yellow-400" />
              <ProgressRow label="Shipped" value={stats.shippedOrders} total={stats.totalOrders} color="bg-blue-400" />
              <ProgressRow label="Completed" value={stats.completedOrders} total={stats.totalOrders} color="bg-green-400" />
              <ProgressRow label="Cancelled" value={stats.cancelledOrders} total={stats.totalOrders} color="bg-red-400" />
            </div>
            <div className="mt-5 p-3 bg-purple-50 rounded-xl text-sm text-purple-800">
              Fulfillment rate: <strong>{pct(stats.completedOrders, stats.totalOrders)}%</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">User Breakdown</h2>
            <div className="space-y-4">
              <ProgressRow label="Buyers" value={stats.buyers} total={stats.totalUsers} color="bg-blue-400" />
              <ProgressRow label="Sellers" value={stats.sellers} total={stats.totalUsers} color="bg-purple-400" />
              <ProgressRow label="Admins" value={stats.admins} total={stats.totalUsers} color="bg-red-400" />
              <ProgressRow label="Banned" value={stats.bannedUsers} total={stats.totalUsers} color="bg-gray-400" />
            </div>
            {(stats.bannedUsers || 0) > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-xl">
                <Ban size={16} />
                {stats.bannedUsers} account{stats.bannedUsers !== 1 ? "s" : ""} currently banned
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Revenue Summary</h2>
            <p className="text-4xl font-bold text-emerald-600 mb-2">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <p className="text-sm text-gray-500 mb-6">From completed & delivered orders</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Order</p>
                <p className="text-xl font-bold text-gray-800 mt-1">
                  {formatCurrency(stats.avgOrderValue)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Completed</p>
                <p className="text-xl font-bold text-gray-800 mt-1">
                  {stats.completedOrders}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Top Selling Products</h2>
          {(stats.topProducts || []).length === 0 ? (
            <p className="text-gray-400 text-center py-8">No products yet</p>
          ) : (
            <div className="space-y-5">
              {stats.topProducts.map((p) => (
                <div key={p._id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {p.photo ? (
                          <img src={p.photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package size={14} className="text-gray-400 m-auto mt-2.5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-gray-500">
                          {p.sold} sold · {formatCurrency(p.revenue)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">
                      {formatCurrency(p.price)} each
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(p.sold / maxSold) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Recent Platform Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Order ID", "Customer", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(stats.recentOrders || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-400">No orders yet</td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="py-3 px-3 font-mono text-xs">
                        #{String(order._id).slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3 px-3 font-medium">{order.customer}</td>
                      <td className="py-3 px-3 font-semibold text-emerald-700">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[order.status] || "bg-gray-100"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
