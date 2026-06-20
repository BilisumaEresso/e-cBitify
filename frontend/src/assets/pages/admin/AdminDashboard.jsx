import {
  Activity,
  BarChart3,
  CheckCircle,
  DollarSign,
  Package,
  Plus,
  Settings,
  Shield,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { adminAPI } from "../../../services/apiHelpers";

function formatTime(date) {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalAdmins: 0,
    totalProducts: 0,
    totalOrders: 0,
    ordersToday: 0,
  });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
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

      const dashData = dashRes.data.data || {};
      const analyticsData = analyticsRes.data.data || {};
      const admins = adminsRes.data.admins || [];

      setStats({
        totalUsers: dashData.totalUsers || 0,
        totalSellers: dashData.totalSellers || 0,
        totalAdmins: dashData.totalAdmins || 0,
        totalProducts: dashData.totalProducts || 0,
        totalOrders: dashData.totalOrders || 0,
        ordersToday: dashData.ordersToday || 0,
      });
      setTotalRevenue(analyticsData.totalRevenue || 0);
      setRecentActivity(dashData.recentActivity || []);
      setAdminsList(admins.slice(0, 4));
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "user":
        return Users;
      case "order":
        return ShoppingBag;
      case "product":
        return Package;
      case "admin":
        return Shield;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "user":
        return "bg-blue-100 text-blue-600";
      case "order":
        return "bg-green-100 text-green-600";
      case "product":
        return "bg-purple-100 text-purple-600";
      case "admin":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-gray-50 p-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Super Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome, {user?.name}. Manage the entire platform.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-semibold">
              <Shield size={20} />
              <span>Super Admin</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Users</p>
                <p className="text-2xl font-bold">
                  {stats.totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Users size={24} />
              </div>
            </div>
            <p className="mt-4 text-sm opacity-90">
              {stats.totalSellers} sellers · {stats.totalAdmins} admins
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <DollarSign size={24} />
              </div>
            </div>
            <p className="mt-4 text-sm opacity-90">From completed orders</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Products</p>
                <p className="text-2xl font-bold">
                  {stats.totalProducts.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Package size={24} />
              </div>
            </div>
            <p className="mt-4 text-sm opacity-90">
              {stats.totalOrders} total orders
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Orders Today</p>
                <p className="text-2xl font-bold">{stats.ordersToday}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <ShoppingBag size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <CheckCircle size={16} />
              <span className="ml-1">Live from database</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Platform Overview
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Registered Users</p>
                    <p className="text-sm text-gray-500">All accounts</p>
                  </div>
                </div>
                <p className="text-xl font-bold">{stats.totalUsers}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Orders Today</p>
                    <p className="text-sm text-gray-500">Since midnight</p>
                  </div>
                </div>
                <p className="text-xl font-bold">{stats.ordersToday}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Active Sellers</p>
                    <p className="text-sm text-gray-500">Role: seller</p>
                  </div>
                </div>
                <p className="text-xl font-bold">{stats.totalSellers}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="text-red-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Super Admins</p>
                    <p className="text-sm text-gray-500">Platform administrators</p>
                  </div>
                </div>
                <p className="text-xl font-bold">{stats.totalAdmins}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Administrators
              </h2>
              <button
                onClick={() => navigate("/admin/add-admin")}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <Plus size={18} />
                <span>Add Admin</span>
              </button>
            </div>

            <div className="space-y-4">
              {adminsList.length === 0 ? (
                <p className="text-gray-500 text-sm">No administrators found.</p>
              ) : (
                adminsList.map((admin) => (
                  <div
                    key={admin._id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Shield size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{admin.name}</p>
                        <p className="text-sm text-gray-500">{admin.email}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        Super Admin
                      </span>
                      <p className="mt-1">
                        Joined {new Date(admin.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent Activity
            </h2>
            <button
              onClick={() => navigate("/admin/analytics")}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Analytics
            </button>
          </div>

          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent activity yet.</p>
            ) : (
              recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActivityColor(
                        activity.type
                      )}`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500">
                        {activity.user} · {formatTime(activity.time)}
                        {activity.amount != null &&
                          ` · $${Number(activity.amount).toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/admin/analytics")}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <BarChart3 size={32} className="text-blue-600 mb-3" />
            <span className="font-medium">Analytics</span>
            <span className="text-sm text-gray-500 mt-1">
              View detailed reports
            </span>
          </button>

          <button
            onClick={() => navigate("/admin/users")}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <Users size={32} className="text-green-600 mb-3" />
            <span className="font-medium">User Management</span>
            <span className="text-sm text-gray-500 mt-1">Manage all users</span>
          </button>

          <button
            onClick={() => navigate("/admin/admins")}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <Shield size={32} className="text-purple-600 mb-3" />
            <span className="font-medium">Administrators</span>
            <span className="text-sm text-gray-500 mt-1">Manage admin accounts</span>
          </button>

          <button
            onClick={() => navigate("/admin/settings")}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <Settings size={32} className="text-orange-600 mb-3" />
            <span className="font-medium">Settings</span>
            <span className="text-sm text-gray-500 mt-1">
              Platform configuration
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
