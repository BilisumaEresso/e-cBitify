import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where the user was trying to go before login
  const redirectTo = location.state?.from || "/";

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "email" ? value.trim() : value, // ✅ do NOT trim password
    }));

    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password, rememberMe);

      if (result.success) {
        toast.success(result.message);

        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 1200);
      } else {
        toast.error(result.message);
        setFormData((prev) => ({ ...prev, password: "" })); 
      }
    } catch (err) {
      toast.error(err.message)
      setFormData((prev) => ({ ...prev, password: "" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center pt-20 justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 px-6">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-1 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-t-2xl">
          <div className="bg-white/50 rounded-xl p-1">
            <div className="relative py-3 rounded-xl font-medium">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl"></div>
              <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                Login to Your Account
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          {error && (
            <div
              aria-live="polite"
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              aria-live="polite"
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Welcome Back
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  autoFocus
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>

              <button
                type="button"
                disabled
                className="text-sm text-gray-400 cursor-not-allowed"
              >
                Forgot password? (Coming soon)
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
