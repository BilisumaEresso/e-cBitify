import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./assets/context/AuthContext";
import Navbar from "./assets/components/Navbar";
import Footer from "./assets/components/Footer";
import ProtectedRoute from "./assets/components/ProtectedRouter";
import RoleProtectedRoute from "./assets/components/RoleProtectedRoute";
import { Toaster } from "react-hot-toast";

// Auth pages
import LoginPage    from "./assets/pages/Login";
import SignupPage   from "./assets/pages/Signup";
import ProfilePage  from "./assets/pages/ProfilePage";

// Shared pages
import TrendingPage    from "./assets/pages/Trending";
import ProductListPage from "./assets/pages/buyer/ProductListPage";
import ProductDetail   from "./assets/components/ProductDetail";

// Buyer pages
import HomePage     from "./assets/pages/buyer/HomePage";
import CartPage     from "./assets/pages/buyer/CartPage";
import AIPicksPage  from "./assets/pages/buyer/AIPicksPage";
import MyOrdersPage from "./assets/pages/buyer/MyOrdersPage";
import OrderConfirmationPage from "./assets/pages/buyer/OrderConfirmationPage";

// Seller pages
import SellerDashboard  from "./assets/pages/seller/SellerDashboard";
import SellerAnalytics  from "./assets/pages/seller/SellerAnalytics";
import SellerCategories from "./assets/pages/seller/SellerCategories";
import SellerProducts   from "./assets/pages/seller/SellerProducts";
import SellerOrders     from "./assets/pages/seller/SellerOrders";
import AddProduct       from "./assets/pages/seller/AddProductPage";

// Admin pages
import AdminDashboard from "./assets/pages/admin/AdminDashboard";
import AdminUsers     from "./assets/pages/admin/AdminUsers";
import AdminAdmins    from "./assets/pages/admin/AdminAdmins";
import AdminAnalytics from "./assets/pages/admin/AdminAnalytics";
import AdminSettings  from "./assets/pages/admin/AdminSettings";
import AddAdminPage   from "./assets/pages/admin/AddAdminPage";

function App() {
  return (
    <div>
      <Toaster position="bottom-right" />
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              {/* ── Public ─────────────────────────────── */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/trends" element={<TrendingPage />} />
              <Route path="/product" element={<ProductListPage />} />
              <Route path="/product/:id" element={<ProductDetail />} />

              {/* ── Protected (any role) ────────────────── */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* ── Buyer (role 1) ──────────────────────── */}
              <Route
                path="/"
                element={
                  <RoleProtectedRoute allowedRoles={[1]}>
                    <HomePage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <RoleProtectedRoute allowedRoles={[1]}>
                    <CartPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/my-orders"
                element={
                  <RoleProtectedRoute allowedRoles={[1]}>
                    <MyOrdersPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/ai-recommendation"
                element={
                  <RoleProtectedRoute allowedRoles={[1]}>
                    <AIPicksPage />
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/order-confirmation"
                element={
                  <ProtectedRoute>
                    <OrderConfirmationPage />
                  </ProtectedRoute>
                }
              />

              {/* ── Seller (role 2) ─────────────────────── */}
              <Route
                path="/seller"
                element={
                  <RoleProtectedRoute allowedRoles={[2]}>
                    <SellerDashboard />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/seller/products"
                element={
                  <RoleProtectedRoute allowedRoles={[2]}>
                    <SellerProducts />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/seller/orders"
                element={
                  <RoleProtectedRoute allowedRoles={[2]}>
                    <SellerOrders />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/seller/analytics"
                element={
                  <RoleProtectedRoute allowedRoles={[2]}>
                    <SellerAnalytics />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <RoleProtectedRoute allowedRoles={[2]}>
                    <SellerCategories />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/add-product"
                element={
                  <RoleProtectedRoute allowedRoles={[2]}>
                    <AddProduct />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/edit-product/:id"
                element={
                  <RoleProtectedRoute allowedRoles={[2]}>
                    <AddProduct />
                  </RoleProtectedRoute>
                }
              />

              {/* ── Admin (role 3) ──────────────────────── */}
              <Route
                path="/admin"
                element={
                  <RoleProtectedRoute allowedRoles={[3]}>
                    <AdminDashboard />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <RoleProtectedRoute allowedRoles={[3]}>
                    <AdminUsers />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/admins"
                element={
                  <RoleProtectedRoute allowedRoles={[3]}>
                    <AdminAdmins />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <RoleProtectedRoute allowedRoles={[3]}>
                    <AdminAnalytics />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <RoleProtectedRoute allowedRoles={[3]}>
                    <AdminSettings />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/add-admin"
                element={
                  <RoleProtectedRoute allowedRoles={[3]}>
                    <AddAdminPage />
                  </RoleProtectedRoute>
                }
              />

              {/* ── Catch-all ───────────────────────────── */}
              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <NavigateToRoleDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Footer />
          </div>
        </AuthProvider>
      </Router>
    </div>
  );
}

function NavigateToRoleDashboard() {
  const { user } = useAuth();
  if (user?.role === 2) return <Navigate to="/seller" />;
  if (user?.role === 3) return <Navigate to="/admin" />;
  return <Navigate to="/" />;
}

export default App;
