import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    city: "",
    street: "",
    state: "",
    postalCode: "",
    kebele: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Required fields validation
    const requiredFields = ["name", "email", "password", "phoneNumber"];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      setError(`Please fill in required fields: ${missingFields.join(", ")}`);
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Phone number validation
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/\D/g, ""))) {
      setError("Please enter a valid phone number (10-15 digits)");
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber.replace(/\D/g, ""), // Remove non-digits
        role: 1, // Default role (buyer)
      };

      // Add optional fields if they exist
      if (formData.city) signupData.city = formData.city;
      if (formData.street) signupData.street = formData.street;
      if (formData.state) signupData.state = formData.state;
      if (formData.postalCode) signupData.postalCode = formData.postalCode;
      if (formData.kebele) signupData.kebele = formData.kebele;

      console.log("📤 Sending signup data:", signupData);

      // Call signup from AuthContext
      const result = await signup(signupData);

      if (result.success) {
        console.log("✅ Signup successful:", result);
        toast.success(
          result.message
        );

        // Redirect after successful signup
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error( err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center pt-20 justify-center bg-gradient-to-br from-gray-50 via-pink-50 to-purple-50 px-6 py-8">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-1 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-t-2xl">
          <div className="bg-white/50 rounded-xl p-1">
            <div className="relative py-3 rounded-xl font-medium">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-xl"></div>
              <span className="relative z-10 flex items-center justify-center gap-2 text-white">
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Create Your Account
              </span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6">
          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-green-600 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Join Us Today
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Required Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="0912345678"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300"
                  disabled={loading}
                  required
                />
              </div>

              {/* Optional Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="Addis Ababa"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-300"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street
                </label>
                <input
                  type="text"
                  name="street"
                  placeholder="2 maskas"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-300"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Region
                </label>
                <input
                  type="text"
                  name="state"
                  placeholder="Addis Ababa"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-300"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  placeholder="222-3ee"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-300"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kebele
                </label>
                <input
                  type="text"
                  name="kebele"
                  placeholder="12"
                  value={formData.kebele}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-300"
                  disabled={loading}
                />
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
                "Create Account"
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
