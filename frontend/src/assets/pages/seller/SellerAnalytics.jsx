import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BarChart3,
  DollarSign,
  Package,
  ShoppingBag,
  Star,
  TrendingUp,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { orderAPI } from "../../../services/apiHelpers";
import StatCard from "../../components/dashboard/StatCard";
import BarChart from "../../components/dashboard/BarChart";
import DonutChart from "../../components/dashboard/DonutChart";
import ProgressRow from "../../components/dashboard/ProgressRow";
import { formatCurrency, pct } from "../../components/dashboard/chartUtils";

export default function SellerAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    orderAPI
      .getSellerAnalytics()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  const d = data || {};
  const totalOrderStatuses =
    (d.pendingOrders || 0) +
    (d.shippedOrders || 0) +
    (d.completedOrders || 0) +
    (d.cancelledOrders || 0);

  const orderSegments = [
    { label: "Pending", value: d.pendingOrders || 0, color: "#facc15" },
    { label: "Shipped", value: d.shippedOrders || 0, color: "#60a5fa" },
    { label: "Completed", value: d.completedOrders || 0, color: "#4ade80" },
    { label: "Cancelled", value: d.cancelledOrders || 0, color: "#f87171" },
  ].filter((s) => s.value > 0);

  const maxSold = Math.max(...(d.topProducts || []).map((p) => p.sold), 1);

  return (
    <div className="min-h-screen pt-24 bg-gray-50 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/seller")}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-6 transition text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 size={28} className="text-blue-600" /> Store Analytics
          </h1>
          <p className="text-gray-500 mt-1">Detailed performance metrics for your store</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            label="Order Revenue"
            value={formatCurrency(d.orderRevenue)}
            sub="Completed & delivered"
            icon={DollarSign}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            label="Total Orders"
            value={d.totalOrders || 0}
            sub={`${pct(d.completedOrders, d.totalOrders)}% fulfilled`}
            icon={ShoppingBag}
            gradient="from-blue-500 to-cyan-600"
          />
          <StatCard
            label="Units Sold"
            value={(d.totalUnitsSold || 0).toLocaleString()}
            sub={`Across ${d.totalProducts || 0} products`}
            icon={Package}
            gradient="from-violet-500 to-purple-600"
          />
          <StatCard
            label="Avg Rating"
            value={d.averageRating ? `${d.averageRating} ★` : "N/A"}
            sub="Across all products"
            icon={Star}
            gradient="from-amber-500 to-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" /> Daily Orders
            </h2>
            <p className="text-sm text-gray-500 mb-6">Last 7 days</p>
            <BarChart data={d.ordersChart || []} color="bg-blue-500" height={200} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <DollarSign size={18} className="text-emerald-500" /> Daily Revenue
            </h2>
            <p className="text-sm text-gray-500 mb-6">Last 7 days (your share)</p>
            <BarChart
              data={(d.revenueChart || []).map((r) => ({ ...r, value: Math.round(r.value) }))}
              color="bg-emerald-500"
              height={200}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Order Pipeline</h2>
            {orderSegments.length > 0 ? (
              <DonutChart segments={orderSegments} />
            ) : (
              <p className="text-gray-400 text-sm text-center py-10">No orders yet</p>
            )}
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Order Status Detail</h2>
            <div className="space-y-4">
              <ProgressRow label="Pending" value={d.pendingOrders || 0} total={totalOrderStatuses} color="bg-yellow-400" />
              <ProgressRow label="Shipped" value={d.shippedOrders || 0} total={totalOrderStatuses} color="bg-blue-400" />
              <ProgressRow label="Completed / Delivered" value={d.completedOrders || 0} total={totalOrderStatuses} color="bg-green-400" />
              <ProgressRow label="Cancelled" value={d.cancelledOrders || 0} total={totalOrderStatuses} color="bg-red-400" />
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-800">
                Fulfillment rate:{" "}
                <strong>
                  {totalOrderStatuses
                    ? pct(d.completedOrders, totalOrderStatuses)
                    : 0}
                  %
                </strong>{" "}
                · Avg revenue per completed order:{" "}
                <strong>
                  {d.completedOrders
                    ? formatCurrency(d.orderRevenue / d.completedOrders)
                    : "$0.00"}
                </strong>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Product Performance</h2>
          {(d.topProducts || []).length === 0 ? (
            <p className="text-gray-400 text-center py-10">No product data yet</p>
          ) : (
            <div className="space-y-5">
              {d.topProducts.map((p) => (
                <div key={p._id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {p.photo ? (
                          <img src={p.photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={14} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">
                          {p.sold} units · {formatCurrency(p.revenue)} revenue
                          {p.averageRating > 0 && ` · ${p.averageRating} ★`}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 shrink-0 ml-4">
                      {pct(p.sold, d.totalUnitsSold)}% of sales
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(p.sold / maxSold) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
