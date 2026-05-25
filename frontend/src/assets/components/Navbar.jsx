/* eslint-disable no-unused-vars */
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import logo from "../images/logo.png";
import {
  LogIn,
  Sparkles,
  User,
  ShoppingBag,
  ChevronDown,
  LogOut,
  PlusCircle,
  Layers,
  Package,
  ShoppingBasket,
  TrendingUp,
  BarChart3,
  Users,
  Settings,
  Shield,
  Home,
  FolderPlus,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ProfileSidebar from "./ProfileSidebar";

function useClickOutside(callback) {
  const ref = useRef(null);
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [callback]);
  return ref;
}

const ROLE_NAVIGATION = {
  1: {
    mainLinks: [
      { to: "/", label: "Home", icon: Home },
      { to: "/ai-recommendation", label: "AI Picks", icon: Sparkles },
      { to: "/trends", label: "Trending", icon: TrendingUp },
      { to: "/product", label: "Products", icon: ShoppingBasket },
      { to: "/my-orders", label: "My Orders", icon: Package },
    ],
    actionLink: { to: "/cart", label: "Cart", icon: ShoppingBag },
  },
  2: {
    mainLinks: [
      { to: "/seller", label: "Dashboard", icon: Home },
      { to: "/seller/products", label: "My Products", icon: Package },
      { to: "/seller/orders", label: "Orders", icon: ShoppingBag },
      { to: "/categories", label: "Categories", icon: Layers },
    ],
    actionLink: {
      to: "/add-product",
      label: "Add Product",
      icon: PlusCircle,
    },
  },
  3: {
    mainLinks: [
      { to: "/admin", label: "Dashboard", icon: Home },
      { to: "/admin/users", label: "Users", icon: Users },
      { to: "/admin/admins", label: "Admins", icon: Shield },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
    actionLink: {
      to: "/admin/add-admin",
      label: "Add Admin",
      icon: FolderPlus,
    },
  },
};

function Navbar() {
  const { user, logout, isSeller, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useClickOutside(() => setIsDropdownOpen(false));
  const role = user?.role ?? 1;
  const { mainLinks, actionLink } = ROLE_NAVIGATION[role] || ROLE_NAVIGATION[1];

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsDropdownOpen(false);
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 fixed w-full z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <NavLink to="/" className="flex-shrink-0">
              <img className="h-35 w-auto" src={logo} alt="Logo" />
            </NavLink>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6">
              
              {mainLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gray-200 text-gray-900"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              {user && (
                <NavLink
                  to={actionLink.to}
                  className={({ isActive }) =>
                    `hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`
                  }
                >
                  <actionLink.icon size={18} />
                  <span>{actionLink.label}</span>
                </NavLink>
              )}

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <ChevronDown size={16} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-gray-100 rounded-lg shadow-lg  border-blue-300 z-30">
                      <div className="p-3 border-b-blue-400">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => setIsProfileOpen(true)}
                          className="w-full flex items-center gap-2 p-2 hover:bg-white rounded-md"
                        >
                          <User size={18} /> My Profile
                        </button>

                        {isSeller && (
                          <button
                          onClick={() => navigate("/seller/products")}
                          className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
                        >
                          <Package size={18} /> My Products
                        </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => navigate("/admin")}
                            className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
                          >
                            <Shield size={18} /> Admin Panel
                          </button>
                        )}
                      </div>
                      <div className="p-2 border-t">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 p-2 hover:bg-red-50 text-red-600 rounded-md"
                        >
                          <LogOut size={18} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium"
                >
                  <LogIn size={20} /> Login
                </NavLink>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg border-t">
            <nav className="flex flex-col p-4 space-y-2">
              {mainLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition ${
                      isActive ? "bg-gray-200 text-gray-900" : ""
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}

              {user && (
                <NavLink
                  to={actionLink.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                >
                  <actionLink.icon size={18} />
                  <span>{actionLink.label}</span>
                </NavLink>
              )}

              {!user && (
                <NavLink
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                >
                  <LogIn size={20} /> Login
                </NavLink>
              )}
            </nav>
          </div>
        )}
      </nav>

      <ProfileSidebar
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
}

export default Navbar;
