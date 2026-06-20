import {
  BarChart3,
  DollarSign,
  Loader2,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminAPI } from "../../../services/apiHelpers";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminAPI.getAnalytics();
      const data = res.data.data || {};
      setStats({
        totalUsers: data.totalUsers || 0,
        totalSellers: data.sellers || 0,
        totalAdmins: data.admins || 0,
        totalBuyers: data.buyers || 0,
        totalProducts: data.totalProducts || 0,
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        pendingOrders: data.pendingOrders || 0,
        completedOrders: data.completedOrders || 0,
        shippedOrders: data.shippedOrders || 0,
        cancelledOrders: data.cancelledOrders || 0,
        bannedUsers: data.bannedUsers || 0,
      });
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );

  if (!stats)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Unable to load analytics data.</p>
      </div>
    );

  const otherOrders =
    stats.totalOrders -
    stats.pendingOrders -
    stats.completedOrders -
    stats.shippedOrders -
    stats.cancelledOrders;

  return (
    <div className="min-h-screen pt-24 bg-gray-50 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 size={28} /> Analytics
          </h1>
          <p className="text-gray-500 mt-1">Platform-wide overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.totalUsers}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={Package}
            label="Total Products"
            value={stats.totalProducts}
            color="bg-purple-100 text-purple-600"
          />
          <StatCard
            icon={ShoppingBag}
            label="Total Orders"
            value={stats.totalOrders}
            color="bg-yellow-100 text-yellow-600"
          />
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            color="bg-green-100 text-green-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-green-500" /> Orders
              Breakdown
            </h3>
            <div className="space-y-3">
              {[
                {
                  label: "Pending",
                  value: stats.pendingOrders,
                  color: "bg-yellow-400",
                },
                {
                  label: "Shipped",
                  value: stats.shippedOrders,
                  color: "bg-blue-400",
                },
                {
                  label: "Completed",
                  value: stats.completedOrders,
                  color: "bg-green-400",
                },
                {
                  label: "Cancelled",
                  value: stats.cancelledOrders,
                  color: "bg-red-400",
                },
                ...(otherOrders > 0
                  ? [
                      {
                        label: "Other",
                        value: otherOrders,
                        color: "bg-gray-300",
                      },
                    ]
                  : []),
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${color} h-2 rounded-full`}
                      style={{
                        width: stats.totalOrders
                          ? `${(value / stats.totalOrders) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Users size={18} className="text-blue-500" /> User Breakdown
            </h3>
            <div className="space-y-3">
              {[
                {
                  label: "Buyers",
                  value: stats.totalBuyers,
                  color: "bg-blue-400",
                },
                {
                  label: "Sellers",
                  value: stats.totalSellers,
                  color: "bg-purple-400",
                },
                {
                  label: "Admins",
                  value: stats.totalAdmins,
                  color: "bg-red-400",
                },
                {
                  label: "Banned",
                  value: stats.bannedUsers,
                  color: "bg-gray-400",
                },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${color} h-2 rounded-full`}
                      style={{
                        width: stats.totalUsers
                          ? `${(value / stats.totalUsers) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-green-500" /> Revenue
            </h3>
            <p className="text-3xl font-bold text-green-600">
              ${stats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">from completed orders</p>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                Avg per order:{" "}
                <strong>
                  $
                  {stats.completedOrders
                    ? (stats.totalRevenue / stats.completedOrders).toFixed(2)
                    : "0.00"}
                </strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
