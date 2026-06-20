import {  useEffect } from "react";
import {
  X,
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  CreditCard,
  History,
  Shield,
  ChevronRight,
  ShoppingBag,
  Store,
  ShieldCheck,
  Users2,
  Star,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Role configuration
const ROLE_CONFIG = {
  1: {
    name: "Buyer",
    color: "bg-green-100 text-green-800",
    icon: ShoppingBag,
    description: "Can purchase products",
  },
  2: {
    name: "Seller",
    color: "bg-blue-100 text-blue-800",
    icon: Store,
    description: "Can list and sell products",
  },
  3: {
    name: "Super Admin",
    color: "bg-purple-100 text-purple-800",
    icon: ShieldCheck,
    description: "Full system access",
  },
};

export default function ProfileSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userRole = ROLE_CONFIG[user?.role] || ROLE_CONFIG[1];
  const RoleIcon = userRole.icon;

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const navigationItems = [
    {
      id: "profile",
      label: "My Profile",
      icon: User,
      path: "/profile",
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "orders",
      label: "My Orders",
      icon: Package,
      path: "/my-orders",
      color: "bg-blue-100 text-blue-600",
    },
  ];

  if (user?.role === 2) {
    navigationItems.push({
      id: "products",
      label: "My Products",
      icon: Store,
      path: "/seller/products",
      color: "bg-blue-100 text-blue-600",
    });
  }

  if (user?.role === 3) {
    navigationItems.push(
      {
        id: "admin-analytics",
        label: "Analytics",
        icon: Shield,
        path: "/admin/analytics",
        color: "bg-indigo-100 text-indigo-600",
      },
      {
        id: "admin",
        label: "Admin Dashboard",
        icon: ShieldCheck,
        path: "/admin",
        color: "bg-red-100 text-red-600",
      },
      {
        id: "users",
        label: "User Management",
        icon: Users2,
        path: "/admin/users",
        color: "bg-gray-100 text-gray-600",
      }
    );
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 right-0 w-96 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <X size={24} />
        </button>

        {/* Profile Header */}
        <div className="pt-16 px-6 pb-6 border-b">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 ${userRole.color} rounded-full flex items-center justify-center border-2 border-white`}
                >
                  <RoleIcon size={12} />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${userRole.color}`}
                >
                  {userRole.name}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{user?.email}</p>
              <p className="text-xs text-gray-500">{userRole.description}</p>
              <button
                onClick={() => handleNavigation("/profile")}
                className="mt-2 text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 transition"
              >
                View Full Profile
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="py-4 px-2 flex-1 overflow-y-auto space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="text-left">
                    <span className="block font-medium">{item.label}</span>
                    {item.description && (
                      <span className="text-xs text-gray-500">
                        {item.description}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className="text-gray-400 group-hover:translate-x-1 transition-transform"
                />
              </button>
            );
          })}
        </nav>

        {/* Settings & Logout */}
        <div className="p-6 border-t bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 font-medium transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
