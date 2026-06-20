import {
  Activity,
  BarChart3,
  DollarSign,
  Package,
  Plus,
  Settings,
  Shield,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { adminAPI } from "../../../services/apiHelpers";
import StatCard from "../../components/dashboard/StatCard";
import BarChart from "../../components/dashboard/BarChart";
import DonutChart from "../../components/dashboard/DonutChart";
import { formatCurrency } from "../../components/dashboard/chartUtils";

function formatTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(date).toLocaleDateString();
}

const STATUS_COLOR = {
  pending: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dash, setDash] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [adminsList, setAdminsList] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [dashRes, analyticsRes, adminsRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAnalytics(),
        adminAPI.getAdmins(),
      ]);
      setDash(dashRes.data.data || {});
      setAnalytics(analyticsRes.data.data || {});
      setAdminsList((adminsRes.data.admins || []).slice(0, 4));
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  const d = dash || {};
  const a = analytics || {};

  const userSegments = [
    { label: "Buyers", value: a.buyers || 0, color: "#60a5fa" },
    { label: "Sellers", value: a.sellers || 0, color: "#a78bfa" },
    { label: "Admins", value: a.admins || 0, color: "#f87171" },
  ].filter((s) => s.value > 0);

  return (
    <div className="min-h-screen pt-24 bg-gray-50 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome, {user?.name} — platform overview at a glance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/analytics")}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 shadow-sm font-medium transition"
            >
              <BarChart3 size={18} /> Full Analytics
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-xl font-semibold">
              <Shield size={18} />
              Super Admin
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            label="Total Users"
            value={(d.totalUsers || 0).toLocaleString()}
            sub={`${d.totalSellers || 0} sellers · ${d.totalAdmins || 0} admins`}
            icon={Users}
            gradient="from-blue-500 to-indigo-600"
          />
          <StatCard
            label="Platform Revenue"
            value={formatCurrency(a.totalRevenue)}
            sub={`Avg ${formatCurrency(a.avgOrderValue)} / order`}
            icon={DollarSign}
            gradient="from-emerald-500 to-green-600"
          />
          <StatCard
            label="Total Products"
            value={(d.totalProducts || 0).toLocaleString()}
            sub={`${d.totalOrders || 0} lifetime orders`}
            icon={Package}
            gradient="from-violet-500 to-purple-600"
          />
          <StatCard
            label="Orders Today"
            value={d.ordersToday || 0}
            sub={`${a.pendingOrders || 0} pending platform-wide`}
            icon={ShoppingBag}
            gradient="from-orange-500 to-red-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <TrendingUp size={20} className="text-purple-600" />
              Platform Orders — Last 7 Days
            </h2>
            <p className="text-sm text-gray-500 mb-6">Daily order volume across all sellers</p>
            <BarChart data={a.ordersChart || []} color="bg-purple-500" height={180} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">User Distribution</h2>
            <p className="text-sm text-gray-500 mb-6">By role</p>
            {userSegments.length > 0 ? (
              <DonutChart segments={userSegments} size={130} />
            ) : (
              <p className="text-gray-400 text-sm text-center py-12">No users yet</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Revenue — Last 7 Days</h2>
            <p className="text-sm text-gray-500 mb-6">Completed & delivered orders</p>
            <BarChart
              data={(a.revenueChart || []).map((r) => ({ ...r, value: Math.round(r.value) }))}
              color="bg-emerald-500"
              height={160}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-800">Top Products</h2>
              <button
                onClick={() => navigate("/admin/analytics")}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
              >
                Details <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {(a.topProducts || []).length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No products yet</p>
              ) : (
                a.topProducts.map((p, i) => (
                  <div key={p._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                    <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
                    <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {p.photo ? (
                        <img src={p.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package size={14} className="text-gray-400 m-auto mt-2.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.sold} sold · {formatCurrency(p.revenue)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Activity size={18} className="text-blue-500" /> Recent Orders
              </h2>
              <button
                onClick={() => navigate("/admin/analytics")}
                className="text-sm text-purple-600 font-medium flex items-center gap-1"
              >
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Order", "Customer", "Amount", "Status", "Date"].map((h) => (
                      <th key={h} className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(a.recentOrders || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">No orders yet</td>
                    </tr>
                  ) : (
                    a.recentOrders.slice(0, 6).map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-2 font-mono text-xs">#{String(order._id).slice(-8).toUpperCase()}</td>
                        <td className="py-2.5 px-2">{order.customer}</td>
                        <td className="py-2.5 px-2 font-semibold">{formatCurrency(order.totalAmount)}</td>
                        <td className="py-2.5 px-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status] || "bg-gray-100"}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-gray-500">{formatTime(order.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-800">Administrators</h2>
              <button
                onClick={() => navigate("/admin/add-admin")}
                className="text-purple-600 hover:text-purple-800"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {adminsList.length === 0 ? (
                <p className="text-gray-400 text-sm">No admins</p>
              ) : (
                adminsList.map((admin) => (
                  <div key={admin._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                    <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center">
                      <Shield size={16} className="text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{admin.name}</p>
                      <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => navigate("/admin/admins")}
              className="mt-4 w-full text-sm text-purple-600 hover:text-purple-800 font-medium py-2"
            >
              Manage all admins →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Analytics", icon: BarChart3, path: "/admin/analytics", color: "text-blue-600" },
            { label: "Users", icon: Users, path: "/admin/users", color: "text-green-600" },
            { label: "Admins", icon: Shield, path: "/admin/admins", color: "text-purple-600" },
            { label: "Settings", icon: Settings, path: "/admin/settings", color: "text-orange-600" },
          ].map(({ label, icon: Icon, path, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <Icon size={28} className={`${color} mb-2`} />
              <span className="font-medium text-gray-800 text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
