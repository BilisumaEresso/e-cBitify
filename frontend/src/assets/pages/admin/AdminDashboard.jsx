import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Users,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Package,
  Activity,
  Shield,
  BarChart3,
  Globe,
  Database,
  Cpu,
  Plus,
  Download,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalAdmins: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalOrders: 0,
    systemHealth: "excellent",
    activeSessions: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [adminsList, setAdminsList] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    // Mock data - replace with API calls
    setSystemStats({
      totalUsers: 12458,
      totalSellers: 245,
      totalAdmins: 12,
      totalRevenue: 1254800,
      totalProducts: 85642,
      totalOrders: 45892,
      systemHealth: "excellent",
      activeSessions: 842,
    });

    setRecentActivity([
      {
        id: 1,
        action: "User Registration",
        user: "John Doe",
        time: "2 minutes ago",
        type: "user",
      },
      {
        id: 2,
        action: "Order Placed",
        user: "Jane Smith",
        amount: 250,
        time: "15 minutes ago",
        type: "order",
      },
      {
        id: 3,
        action: "Product Added",
        user: "Seller Pro",
        product: "Smart Watch",
        time: "1 hour ago",
        type: "product",
      },
      {
        id: 4,
        action: "Admin Added",
        user: "System",
        admin: "New Admin",
        time: "3 hours ago",
        type: "admin",
      },
      {
        id: 5,
        action: "System Update",
        user: "System",
        details: "Security patch",
        time: "5 hours ago",
        type: "system",
      },
    ]);

    setAdminsList([
      {
        id: 1,
        name: "Admin One",
        email: "admin1@example.com",
        role: "Super Admin",
        lastActive: "Just now",
        status: "active",
      },
      {
        id: 2,
        name: "Admin Two",
        email: "admin2@example.com",
        role: "Content Admin",
        lastActive: "2 hours ago",
        status: "active",
      },
      {
        id: 3,
        name: "Admin Three",
        email: "admin3@example.com",
        role: "Support Admin",
        lastActive: "1 day ago",
        status: "inactive",
      },
      {
        id: 4,
        name: "Admin Four",
        email: "admin4@example.com",
        role: "Product Admin",
        lastActive: "Just now",
        status: "active",
      },
    ]);
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
      case "system":
        return Cpu;
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
      case "system":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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

        {/* System Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Users</p>
                <p className="text-2xl font-bold">
                  {systemStats.totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Users size={24} />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp size={16} />
                <span className="ml-1">+5.2% this month</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${(systemStats.totalRevenue / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <DollarSign size={24} />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp size={16} />
                <span className="ml-1">+18.7% this month</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Products</p>
                <p className="text-2xl font-bold">
                  {systemStats.totalProducts.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Package size={24} />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp size={16} />
                <span className="ml-1">+12.3% this month</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">System Health</p>
                <p className="text-2xl font-bold capitalize">
                  {systemStats.systemHealth}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Activity size={24} />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <CheckCircle size={16} />
                <span className="ml-1">
                  {systemStats.activeSessions} active sessions
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                System Overview
              </h2>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Filter size={18} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Download size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Active Users</p>
                    <p className="text-sm text-gray-500">Currently online</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">8,942</p>
                  <p className="text-sm text-green-600">+342 today</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Orders Today</p>
                    <p className="text-sm text-gray-500">24 hour period</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">1,248</p>
                  <p className="text-sm text-green-600">+12.5%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Database className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Database Size</p>
                    <p className="text-sm text-gray-500">Total data stored</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">45.2 GB</p>
                  <p className="text-sm text-gray-500">+2.1 GB this week</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Globe className="text-red-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Server Uptime</p>
                    <p className="text-sm text-gray-500">Last 30 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">99.98%</p>
                  <p className="text-sm text-green-600">Excellent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Admins List */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Administrators
              </h2>
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                <Plus size={18} />
                <span>Add Admin</span>
              </button>
            </div>

            <div className="space-y-4">
              {adminsList.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        admin.role === "Super Admin"
                          ? "bg-purple-100"
                          : "bg-blue-100"
                      }`}
                    >
                      <Shield
                        size={20}
                        className={
                          admin.role === "Super Admin"
                            ? "text-purple-600"
                            : "text-blue-600"
                        }
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{admin.name}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            admin.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {admin.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{admin.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{admin.role}</p>
                    <p className="text-xs text-gray-500">
                      Last active: {admin.lastActive}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent System Activity
            </h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All Activity
            </button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity) => {
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
                      {activity.user} • {activity.time}
                      {activity.amount && ` • $${activity.amount}`}
                      {activity.product && ` • ${activity.product}`}
                      {activity.admin && ` • ${activity.admin}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Controls */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <BarChart3 size={32} className="text-blue-600 mb-3" />
            <span className="font-medium">Analytics</span>
            <span className="text-sm text-gray-500 mt-1">
              View detailed reports
            </span>
          </button>

          <button className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <Users size={32} className="text-green-600 mb-3" />
            <span className="font-medium">User Management</span>
            <span className="text-sm text-gray-500 mt-1">Manage all users</span>
          </button>

          <button className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <Database size={32} className="text-purple-600 mb-3" />
            <span className="font-medium">Database</span>
            <span className="text-sm text-gray-500 mt-1">Backup & Restore</span>
          </button>

          <button className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <Settings size={32} className="text-orange-600 mb-3" />
            <span className="font-medium">Settings</span>
            <span className="text-sm text-gray-500 mt-1">
              System configuration
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
