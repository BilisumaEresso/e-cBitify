import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Package,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  ShoppingBag,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Download,
  Search,
} from "lucide-react";
import { orderAPI, productAPI } from "../../../services/apiHelpers";

export default function SellerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const sellerId = user.id; // replace with logged-in seller id
  const navigate=useNavigate()
  useEffect(() => {
    // Fetch seller dashboard data
    fetchSellerData();
  }, []);

  const fetchSellerData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        productAPI.getAll(),
        orderAPI.getAll(),
      ]);

      const allProducts = productsRes.data.products;
      const products = allProducts.filter(
        (product) => product.createdBy?._id?.toString() === sellerId.toString()
      );

      const totalSales = products.reduce(
        (acc, p) => acc + Number(p.sold || 0),
        0
      );

      const totalRevenue = products.reduce(
        (acc, p) => acc + Number(p.sold || 0) * Number(p.price || 0),
        0
      );

      const averageRating =
        products.length > 0
          ? products.reduce((acc, p) => acc + Number(p.averageRating || 0), 0) /
            products.length
          : 0;

      const allOrders = ordersRes.data.orders;
      const orders = allOrders.filter((order) =>
        order.items.some(
          (item) => item.product.createdBy?._id?.toString() === sellerId.toString()
        )
      );

      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      let pendingOrders = 0;
      let completedOrders = 0;
      orders.forEach((order) => {
        if (order.status === "pending") {
          pendingOrders++;
        } else if (order.status === "completed") {
          completedOrders++;
        }
      });

      setStats({
        totalProducts: products.length || 0,
        totalSales: totalSales,
        pendingOrders: pendingOrders,
        completedOrders: completedOrders,
        totalRevenue: totalRevenue,
        averageRating: averageRating,
      });

      setRecentOrders(recentOrders);
      const topFiveSold = [...allProducts]
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);
      setTopProducts(topFiveSold);
    } catch (error) {
      toast.error("Failed to load seller dashboard data");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Seller Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name}. Manage your products and orders.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp size={16} />
                <span className="ml-1">+12% from last month</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sales</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalSales}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingBag className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp size={16} />
                <span className="ml-1">+18% from last month</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp size={16} />
                <span className="ml-1">+22% from last month</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.pendingOrders}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-yellow-600">
                <AlertCircle size={16} />
                <span className="ml-1">Requires attention</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Recent Orders
              </h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 text-sm font-medium text-gray-500">
                      Order ID
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">
                      Customer
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">
                      Amount
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="py-3">#{order._id.slice(0, 5)}</td>
                      <td className="py-3">{order.user.name}</td>
                      <td className="py-3 font-medium">${order.totalAmount}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {order.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Top Selling Products
              </h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {topProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {product.sales} sales
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${product.price}</p>
                    <p className="text-sm text-gray-500">
                      Stock: {product.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Plus size={32} className="text-gray-400 mb-2" />
              <span className="font-medium">Add New Product</span>
              <span className="text-sm text-gray-500 mt-1">
                Upload product details
              </span>
            </button>

            <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors">
              <DollarSign size={32} className="text-gray-400 mb-2" />
              <span className="font-medium">View Earnings</span>
              <span className="text-sm text-gray-500 mt-1">
                Check your revenue
              </span>
            </button>

            <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-colors">
              <Users size={32} className="text-gray-400 mb-2" />
              <span className="font-medium">Customer Reviews</span>
              <span className="text-sm text-gray-500 mt-1">
                See what customers say
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
