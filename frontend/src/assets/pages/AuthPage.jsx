import { useState } from "react";
import { authService } from "../../services/auth";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
    console.log(formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
   

    console.log("🚀 Submitting form:", { isLogin, formData });

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (!isLogin && !formData.name) {
      setError("Please enter your name");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const password=formData.name
        const email = formData.password;
        console.log("📤 Calling login API...");
        const result = await authService.login({email,password});
        console.log("✅ Login result:", result);


        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        console.log("📤 Calling signup API...");
        const result = await authService.signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        console.log("✅ Signup result:", result);

       

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      }

      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      console.error("❌ Auth error details:", err);

      // Check error structure
      if (err.response) {
        // Axios error with response
        console.error(
          "📊 Response error:",
          err.response.status,
          err.response.data
        );
        setError(
          err.response.data?.message || `Server error: ${err.response.status}`
        );
      } else if (err.request) {
        // Request made but no response
        console.error("🌐 Network error:", err.request);
        setError("Network error. Please check your connection.");
      } else if (err.message) {
        // Other errors
        console.error("⚠️ Error message:", err.message);
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };
  //   const handleForgotPassword = async () => {
  //     if (!formData.email) {
  //       setError("Please enter your email address");
  //       return;
  //     }

  //     setLoading(true);
  //     try {
  //       await authService.forgotPassword(formData.email);
  //     } catch (err) {
  //       setError(err.message || "Failed to send reset instructions");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 px-6">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20">
        {/* Toggle with Gradient */}
        <div className="flex justify-center p-1 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-t-2xl">
          <div className="flex w-full bg-white/50 rounded-xl p-1">
            <button
              className={`relative flex-1 py-3 rounded-xl font-medium transition-all duration-500 ease-in-out overflow-hidden group ${
                isLogin ? "text-white" : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setIsLogin(true)}
              disabled={loading}
            >
              {/* Gradient background for active state */}
              {isLogin && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl transition-all duration-500"></div>
              )}

              {/* Hover effect for inactive state */}
              {!isLogin && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              )}

              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLogin && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                )}
                Login
              </span>
            </button>

            <button
              className={`relative flex-1 py-3 rounded-xl font-medium transition-all duration-500 ease-in-out overflow-hidden group ${
                !isLogin ? "text-white" : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setIsLogin(false)}
              disabled={loading}
            >
              {/* Gradient background for active state */}
              {!isLogin && (
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-xl transition-all duration-500"></div>
              )}

              {/* Hover effect for inactive state */}
              {isLogin && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              )}

              <span className="relative z-10 flex items-center justify-center gap-2">
                {!isLogin && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                )}
                Sign Up
              </span>
            </button>
          </div>
        </div>

        {/* Forms Container */}
        <div className="p-6 relative min-h-[400px] overflow-hidden">
          {error && (
            <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg text-red-600 text-sm transition-all duration-300">
              {error}
            </div>
          )}

          <div className="relative w-full h-full">
            {/* Login Form */}
            <form
              onSubmit={handleSubmit}
              className={`absolute top-0 left-0 w-full transition-all duration-500 ease-in-out ${
                isLogin
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-full"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                    disabled={loading}
                    required
                  />
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                    disabled={loading}
                    required
                  />
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-500 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Signup Form */}
            <form
              onSubmit={handleSubmit}
              className={`absolute top-0 left-0 w-full transition-all duration-500 ease-in-out ${
                !isLogin
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-full"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Create Account
              </h2>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300"
                    disabled={loading}
                    required
                  />
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300"
                    disabled={loading}
                    required
                  />
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300"
                    disabled={loading}
                    required
                  />
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-500 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-1 rounded-full animate-spin">
                <div className="bg-white rounded-full p-3">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
